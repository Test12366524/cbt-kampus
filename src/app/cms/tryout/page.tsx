// app/cms/tryout/paket-latihan/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetTestListQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
} from "@/services/tryout/test.service";
import { useExportTestMutation } from "@/services/tryout/export-test.service";
import { useGetSchoolListQuery } from "@/services/master/school.service";
import { useGetUsersListQuery } from "@/services/users-management.service";
import { useGetMeQuery } from "@/services/auth.service";
import {
  useGetParticipantHistoryListQuery,
  useRegenerateTestMutation,
  useEndSessionMutation,
} from "@/services/student/tryout.service";
import type { Test } from "@/types/tryout/test";
import type { Users } from "@/types/user";
import type { ParticipantHistoryItem } from "@/types/student/tryout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ListChecks,
  FileDown,
  PenLine,
  Trash2,
  Plus,
  RefreshCw,
  Trophy,
  Users as UsersIcon,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import Pager from "@/components/ui/tryout-pagination";
import ActionIcon from "@/components/ui/action-icon";
import { SiteHeader } from "@/components/site-header";
import { displayDate } from "@/lib/format-utils";
import TryoutForm, {
  FormState,
  TimerType,
  ScoreType,
  AssessmentType,
} from "@/components/form-modal/tryout-admin-form";

import { Combobox } from "@/components/ui/combo-box";

type TestPayload = {
  school_id: number;
  title: string;
  sub_title: string | null;
  shuffle_questions: boolean | number;
  timer_type: TimerType;
  score_type: ScoreType;
  total_time?: number;
  start_date?: string;
  end_date?: string;
  slug?: string;
  description?: string | null;
  total_questions?: number;
  pass_grade?: number;
  assessment_type?: AssessmentType;
  code?: string | null;
  max_attempts?: string | null;
  is_graded?: boolean;
  is_explanation_released?: boolean;
  user_id: number; // pengawas
};

const emptyForm: FormState = {
  school_id: 0,
  title: "",
  sub_title: "",
  slug: "",
  description: "",
  total_time: 3600,
  total_questions: 0,
  pass_grade: 70,
  shuffle_questions: false,
  assessment_type: "irt",
  timer_type: "per_test",
  score_type: "default",
  start_date: "",
  end_date: "",
  code: "",
  max_attempts: "",
  is_graded: false,
  is_explanation_released: false,
  user_id: 0,
};

type School = { id: number; name: string; email?: string };

type TestRow = Test & {
  user_id?: number | null;
  pengawas_name?: string | null;
};

/** Pastikan format YYYY-MM-DD (date only) */
function dateOnly(input?: string | null): string {
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const s = String(input);
  if (s.includes("T") || s.includes(" ")) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** bantu ambil nama peserta dari berbagai kemungkinan field tanpa any */
function getParticipantName(p: ParticipantHistoryItem): string {
  const p1 = (p as { user_name?: string }).user_name;
  if (p1) return p1;

  const p2 = (p as { user?: { name?: string } }).user?.name;
  if (p2) return p2;

  const p3 = (p as { participant_name?: string }).participant_name;
  if (p3) return p3;

  return `User #${p.user_id}`;
}

export default function TryoutPage() {
  const [page, setPage] = useState(1);
  const [paginate, setPaginate] = useState(10);
  const [search, setSearch] = useState("");
  const [searchBySpecific, setSearchBySpecific] = useState("");
  const [exportingId, setExportingId] = useState<number | null>(null);

  // Filter Prodi
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [schoolSearch, setSchoolSearch] = useState("");

  // ambil user login
  const { data: me } = useGetMeQuery();
  const roles = me?.roles ?? [];
  const isSuperadmin = roles.some((r) => r.name === "superadmin");
  const isPengawas = roles.some((r) => r.name === "pengawas");
  const myId = me?.id ?? 0;

  const { data: schoolResp, isLoading: loadingSchools } = useGetSchoolListQuery(
    { page: 1, paginate: 100, search: schoolSearch || "" }
  );
  const schools: School[] = useMemo(() => schoolResp?.data ?? [], [schoolResp]);

  // susun argumen query
  const baseQuery = {
    page,
    paginate,
    search,
    searchBySpecific,
    orderBy: "tests.updated_at",
    orderDirection: "desc" as const,
    school_id: schoolId ?? undefined,
  };

  // kalau dia pengawas (role_id=3) dan BUKAN superadmin → paksa filter by user_id
  const finalQuery =
    !isSuperadmin && isPengawas
      ? {
          ...baseQuery,
          searchBySpecific: "user_id" as const,
          search: String(myId),
        }
      : baseQuery;

  // List ujian
  const { data, isLoading, refetch } = useGetTestListQuery(finalQuery);

  // List pengawas (role_id = 3) untuk mapping nama di tabel
  const { data: pengawasResp } = useGetUsersListQuery({
    page: 1,
    paginate: 200,
    search: "",
    role_id: 3,
  });
  const pengawasMap = useMemo(() => {
    const m = new Map<number, string>();
    (pengawasResp?.data ?? []).forEach((u: Users) => m.set(u.id, u.name));
    return m;
  }, [pengawasResp]);

  const [createTest, { isLoading: creating }] = useCreateTestMutation();
  const [updateTest, { isLoading: updating }] = useUpdateTestMutation();
  const [deleteTest] = useDeleteTestMutation();
  const [exportTest] = useExportTestMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestRow | null>(null);

  // ⬇️ state untuk monitoring
  const [monitoringTest, setMonitoringTest] = useState<TestRow | null>(null);

  const baseMonitorQuery = monitoringTest
    ? {
        page: 1,
        paginate: 200,
        test_id: monitoringTest.id,
        // kalau pengawas → batasi by user_id pengawas
        ...(isSuperadmin ? {} : { user_id: myId }),
      }
    : skipToken;

  // query peserta ujian yang SEDANG ONGOING
  const {
    data: ongoingResp,
    isFetching: loadingOngoing,
    refetch: refetchOngoing,
  } = useGetParticipantHistoryListQuery(
    // Hanya ambil yang is_ongoing = 1 dan BUKAN completed
    baseMonitorQuery !== skipToken
      ? { ...baseMonitorQuery, is_ongoing: 1 }
      : skipToken
  );

  // query peserta ujian yang SUDAH SELESAI
  const {
    data: completedResp,
    isFetching: loadingCompleted,
    refetch: refetchCompleted,
  } = useGetParticipantHistoryListQuery(
    // Hanya ambil yang is_completed = 1
    baseMonitorQuery !== skipToken
      ? { ...baseMonitorQuery, is_completed: 1 }
      : skipToken
  );

  // Gabungkan status loading
  const loadingMonitor = loadingOngoing || loadingCompleted;

  // Gabungkan fungsi refetch
  async function refetchMonitor() {
    await Promise.all([refetchOngoing(), refetchCompleted()]);
  }

  const [regenerateTest, { isLoading: continuingAdmin }] =
    useRegenerateTestMutation();
  const [endSessionAdmin, { isLoading: endingAdmin }] = useEndSessionMutation();

  const toForm = (t: TestRow): FormState => ({
    school_id: t.school_id,
    title: t.title,
    sub_title: t.sub_title ?? "",
    slug: t.slug ?? "",
    description: t.description ?? "",
    total_time: t.total_time,
    total_questions: t.total_questions,
    pass_grade: t.pass_grade,
    shuffle_questions: t.shuffle_questions,
    assessment_type: t.assessment_type as AssessmentType,
    timer_type: t.timer_type as TimerType,
    score_type: (t.score_type as ScoreType) ?? "default",
    start_date: dateOnly(t.start_date),
    end_date: dateOnly(t.end_date),
    code: t.code ?? "",
    max_attempts: t.max_attempts ?? "",
    is_graded: t.is_graded,
    is_explanation_released: t.is_explanation_released,
    user_id: t.user_id ?? 0,
  });

  const toPayload = (f: FormState): TestPayload => {
    const payload: TestPayload = {
      school_id: f.school_id,
      title: f.title,
      sub_title: f.sub_title || null,
      shuffle_questions: f.shuffle_questions ? 1 : 0,
      timer_type: f.timer_type,
      score_type: f.score_type,
      slug: f.slug,
      description: f.description,
      total_questions: f.total_questions,
      pass_grade: f.pass_grade,
      assessment_type: f.assessment_type,
      code: f.code || "",
      max_attempts: f.max_attempts || "",
      is_graded: f.is_graded,
      is_explanation_released: f.is_explanation_released,
      user_id: Number(f.user_id || 0),
    };

    if (f.timer_type === "per_test") {
      payload.total_time = Number(f.total_time || 0);
    }

    const sd = dateOnly(f.start_date);
    const ed = dateOnly(f.end_date);
    if (sd) payload.start_date = sd;
    if (ed) payload.end_date = ed;

    return payload;
  };

  const openCreate = () => {
    // kalau pengawas, saat create langsung set ke id dia
    if (!isSuperadmin && isPengawas) {
      setEditing(null);
      setOpen(true);
    } else {
      setEditing(null);
      setOpen(true);
    }
  };

  const openEdit = (t: TestRow) => {
    setEditing(t);
    setOpen(true);
  };

  const onSubmit = async (values: FormState): Promise<boolean> => {
    try {
      const fixedValues =
        !isSuperadmin && isPengawas ? { ...values, user_id: myId } : values;

      if (editing) {
        const res = await updateTest({
          id: editing.id,
          payload: toPayload(fixedValues),
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: `Test "${res.title}" diperbarui.`,
        });
      } else {
        const res = await createTest(toPayload(fixedValues)).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Created",
          text: `Test "${res.title}" dibuat.`,
        });
      }
      refetch();
      return true;
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e) });
      return false;
    }
  };

  const onDelete = async (id: number, label: string) => {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Hapus Test?",
      text: `Data "${label}" akan dihapus permanen.`,
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!ask.isConfirmed) return;
    try {
      await deleteTest(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Terhapus",
        text: `"${label}" dihapus.`,
      });
      refetch();
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e) });
    }
  };

  const onExport = async (id: number) => {
    try {
      setExportingId(id);
      const res = await exportTest({ test_id: id }).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Export dimulai",
        text: res.data || res.message,
      });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Export gagal",
        text: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setExportingId(null);
    }
  };

  // === handler monitoring ===
  async function handleForceFinish(participantTestId: number, nama: string) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Selesaikan ujian ini?",
      text: `Peserta "${nama}" akan langsung diselesaikan.`,
      showCancelButton: true,
      confirmButtonText: "Ya, selesaikan",
      cancelButtonText: "Batal",
    });
    if (!ask.isConfirmed) return;
    try {
      await endSessionAdmin(participantTestId).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Sesi diselesaikan.",
      });
      void refetchMonitor();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menyelesaikan",
        text: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async function handleReopen(participantTestId: number, nama: string) {
    const ask = await Swal.fire({
      icon: "question",
      title: "Izinkan mengerjakan lagi?",
      text: `Peserta "${nama}" akan bisa lanjut lagi.`,
      showCancelButton: true,
      confirmButtonText: "Ya, izinkan",
      cancelButtonText: "Batal",
    });
    if (!ask.isConfirmed) return;
    try {
      await regenerateTest(participantTestId).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Dibuka lagi",
        text: "Peserta bisa lanjut lagi.",
      });
      void refetchMonitor();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal membuka",
        text: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const tableRows: TestRow[] = useMemo(
    () => (data?.data as TestRow[]) ?? [],
    [data]
  );

  const ongoingList: ParticipantHistoryItem[] = ongoingResp?.data ?? [];
  const completedList: ParticipantHistoryItem[] = completedResp?.data ?? [];
  return (
    <>
      <SiteHeader title="Ujian Online" />
      <div className="p-4 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Daftar Ujian Online</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Buat Ujian Online
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-2"
                  value={paginate}
                  onChange={(e) => {
                    setPaginate(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="ml-auto w-full flex gap-2">
                <Input
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && refetch()}
                />

                {/* Filter Prodi */}
                <div className="flex items-center gap-2 w-full md:w-80">
                  <div className="flex w-full gap-2">
                    <Combobox<School>
                      value={schoolId}
                      onChange={(v) => {
                        setSchoolId(v);
                        setPage(1);
                      }}
                      onSearchChange={setSchoolSearch}
                      data={schools}
                      isLoading={loadingSchools}
                      placeholder="Semua Prodi"
                      getOptionLabel={(s) => s.name}
                    />
                    {schoolId !== null && (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setSchoolId(null);
                          setPage(1);
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    if (isSuperadmin) {
                      setSearchBySpecific("");
                    }
                    setSchoolId(null);
                    setPage(1);
                    refetch();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3">Judul</th>
                    <th className="p-3">Prodi</th>
                    <th className="p-3">Pengawas</th>
                    <th className="p-3">Waktu (detik)</th>
                    <th className="p-3">Shuffle</th>
                    <th className="p-3">Mulai</th>
                    <th className="p-3">Berakhir</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="p-4" colSpan={10}>
                        Loading…
                      </td>
                    </tr>
                  ) : tableRows.length ? (
                    tableRows.map((t) => {
                      const name =
                        t.pengawas_name ??
                        (t.user_id ? pengawasMap.get(t.user_id) : undefined) ??
                        "-";
                      return (
                        <tr key={t.id} className="border-t align-top">
                          <td className="p-3">
                            <div className="font-medium">{t.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {t.sub_title || "-"}
                            </div>
                          </td>
                          <td className="p-3">{t.school_name}</td>
                          <td className="p-3">{name}</td>
                          <td className="p-3">
                            {t.timer_type === "per_category" ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              t.total_time
                            )}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={
                                t.shuffle_questions ? "default" : "secondary"
                              }
                            >
                              {t.shuffle_questions ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {t.start_date ? displayDate(t.start_date) : "-"}
                          </td>
                          <td className="p-3">
                            {t.end_date ? displayDate(t.end_date) : "-"}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-end">
                              <Link
                                href={`/cms/tryout/paket-latihan/${t.id}/questions-category`}
                              >
                                <ActionIcon label="Bank Soal">
                                  <ListChecks className="h-4 w-4" />
                                </ActionIcon>
                              </Link>

                              <Link href={`/cms/tryout/rank?test_id=${t.id}`}>
                                <ActionIcon label="Rank">
                                  <Trophy className="h-4 w-4" />
                                </ActionIcon>
                              </Link>

                              {/* tombol monitoring */}
                              <ActionIcon
                                label="Monitoring Peserta"
                                onClick={() => {
                                  setMonitoringTest(t);
                                }}
                              >
                                <UsersIcon className="h-4 w-4" />
                              </ActionIcon>

                              <ActionIcon
                                label="Export"
                                onClick={() => onExport(t.id)}
                                disabled={exportingId === t.id}
                              >
                                <FileDown className="h-4 w-4" />
                              </ActionIcon>

                              <ActionIcon
                                label="Edit"
                                onClick={() => openEdit(t)}
                              >
                                <PenLine className="h-4 w-4" />
                              </ActionIcon>
                              <ActionIcon
                                label="Hapus"
                                onClick={() => onDelete(t.id, t.title)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </ActionIcon>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="p-4" colSpan={10}>
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pager
              page={data?.current_page ?? 1}
              lastPage={data?.last_page ?? 1}
              onChange={setPage}
            />
          </CardContent>
        </Card>

        {/* Dialog + Form */}
        <Dialog
          open={open}
          onOpenChange={(v) => {
            if (!v) setEditing(null);
            setOpen(v);
          }}
        >
          <DialogContent className="max-h-[98vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl xl:max-w-5xl">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? "Form Ubah Ujian Online"
                  : "Form Tambah Ujian Online"}
              </DialogTitle>
            </DialogHeader>

            <TryoutForm
              key={editing ? editing.id : "new"}
              initial={
                editing
                  ? toForm(editing)
                  : !isSuperadmin && isPengawas
                  ? { ...emptyForm, user_id: myId }
                  : emptyForm
              }
              submitting={creating || updating}
              onCancel={() => {
                setOpen(false);
                setEditing(null);
              }}
              onSubmit={async (values) => {
                const ok = await onSubmit(values);
                if (ok) {
                  setOpen(false);
                  setEditing(null);
                }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog Monitoring */}
        <Dialog
          open={!!monitoringTest}
          onOpenChange={(v) => {
            if (!v) {
              setMonitoringTest(null);
            }
          }}
        >
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Monitoring Ujian
                {monitoringTest ? ` – ${monitoringTest.title}` : ""}
              </DialogTitle>
            </DialogHeader>

            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-muted-foreground">
                {isSuperadmin
                  ? "Anda melihat semua peserta."
                  : "Anda melihat peserta pada ujian yang diawasi Anda."}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchMonitor()}
                disabled={loadingMonitor}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* Sedang mengerjakan */}
            <div className="mb-6 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline">Sedang mengerjakan</Badge>
                <span className="text-xs text-muted-foreground">
                  {ongoingList.length} peserta
                </span>
              </h3>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="p-2 text-left">Peserta</th>
                      <th className="p-2 text-left">Mulai</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMonitor ? (
                      <tr>
                        <td className="p-3" colSpan={4}>
                          Memuat...
                        </td>
                      </tr>
                    ) : ongoingList.length ? (
                      ongoingList.map((p) => {
                        const nama = getParticipantName(p);
                        return (
                          <tr key={p.id} className="border-t">
                            <td className="p-2">
                              <div className="font-medium">{nama}</div>
                              <div className="text-[10px] text-muted-foreground">
                                User ID: {p.user_id}
                              </div>
                            </td>
                            <td className="p-2 text-xs">
                              {p.started_at ? displayDate(p.started_at) : "-"}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="bg-amber-50">
                                Ongoing
                              </Badge>
                            </td>
                            <td className="p-2 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleForceFinish(p.id, nama)}
                                disabled={endingAdmin}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Selesaikan
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="p-3" colSpan={4}>
                          Tidak ada yang sedang mengerjakan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sudah selesai */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50">
                  Sudah selesai
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {completedList.length} peserta
                </span>
              </h3>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="p-2 text-left">Peserta</th>
                      <th className="p-2 text-left">Selesai</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingMonitor ? (
                      <tr>
                        <td className="p-3" colSpan={4}>
                          Memuat...
                        </td>
                      </tr>
                    ) : completedList.length ? (
                      completedList.map((p) => {
                        const nama = getParticipantName(p);
                        return (
                          <tr key={p.id} className="border-t">
                            <td className="p-2">
                              <div className="font-medium">{nama}</div>
                              <div className="text-[10px] text-muted-foreground">
                                User ID: {p.user_id}
                              </div>
                            </td>
                            <td className="p-2 text-xs">
                              {p.ended_at ? displayDate(p.ended_at) : "-"}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant="outline"
                                className="bg-emerald-50"
                              >
                                Completed
                              </Badge>
                            </td>
                            <td className="p-2 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReopen(p.id, nama)}
                                disabled={continuingAdmin}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Buka lagi
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="p-3" colSpan={4}>
                          Belum ada yang selesai.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setMonitoringTest(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
