"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  useGetTestListQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
} from "@/services/tryout/test.service";
import { useExportTestMutation } from "@/services/tryout/export-test.service";
import type { Test } from "@/types/tryout/test";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ListChecks,
  FileDown,
  PenLine,
  Trash2,
  Plus,
  PlayCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";
import Pager from "@/components/ui/tryout-pagination";
import ActionIcon from "@/components/ui/action-icon";
import { SiteHeader } from "@/components/site-header";
import { formatDate } from "@/lib/format-utils";
import TryoutForm, {
  FormState,
  TimerType,
  ScoreType,
  AssessmentType,
} from "@/components/form-modal/tryout-admin-form";

type TestPayload = {
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
};

const emptyForm: FormState = {
  title: "",
  sub_title: "",
  slug: "",
  description: "",
  total_time: 3600,
  total_questions: 0,
  pass_grade: 70,
  shuffle_questions: false,
  assessment_type: "irt",
  timer_type: "per_category",
  score_type: "irt",
  start_date: "",
  end_date: "",
  code: "",
  max_attempts: "",
  is_graded: false,
  is_explanation_released: false,
};

export default function TryoutPage() {
  const [page, setPage] = useState(1);
  const [paginate, setPaginate] = useState(10);
  const [search, setSearch] = useState("");
  const [searchBySpecific, setSearchBySpecific] = useState("");

  const { data, isLoading, refetch } = useGetTestListQuery({
    page,
    paginate,
    search,
    searchBySpecific,
  });

  const [createTest, { isLoading: creating }] = useCreateTestMutation();
  const [updateTest, { isLoading: updating }] = useUpdateTestMutation();
  const [deleteTest] = useDeleteTestMutation();
  const [exportTest] = useExportTestMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Test | null>(null);

  const toForm = (t: Test): FormState => ({
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
    start_date: t.start_date ?? "",
    end_date: t.end_date ?? "",
    code: t.code ?? "",
    max_attempts: t.max_attempts ?? "",
    is_graded: t.is_graded,
    is_explanation_released: t.is_explanation_released,
  });

  const toPayload = (f: FormState): TestPayload => ({
    title: f.title,
    sub_title: f.sub_title || null,
    shuffle_questions: f.shuffle_questions ? 1 : 0,
    timer_type: f.timer_type,
    score_type: f.score_type,
    ...(f.timer_type === "per_test"
      ? { total_time: Number(f.total_time || 0) }
      : {}),
    ...(f.score_type === "irt"
      ? { start_date: f.start_date, end_date: f.end_date }
      : {}),
    slug: f.slug,
    description: f.description,
    total_questions: f.total_questions,
    pass_grade: f.pass_grade,
    assessment_type: f.assessment_type,
    code: f.code || "",
    max_attempts: f.max_attempts || "",
    is_graded: f.is_graded,
    is_explanation_released: f.is_explanation_released,
  });

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (t: Test) => {
    setEditing(t);
    setOpen(true);
  };

  const onSubmit = async (values: FormState) => {
    try {
      if (editing) {
        const res = await updateTest({
          id: editing.id,
          payload: toPayload(values),
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: `Test "${res.title}" diperbarui.`,
        });
      } else {
        const res = await createTest(toPayload(values)).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Created",
          text: `Test "${res.title}" dibuat.`,
        });
      }
      setOpen(false);
      setEditing(null);
      refetch();
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e) });
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

  const onExport = async (id: number, filename: string) => {
    try {
      const blob = await exportTest({ test_id: id }).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || "export"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Export gagal",
        text: String(e),
      });
    }
  };

  const tableRows = useMemo(() => data?.data ?? [], [data]);

  return (
    <>
      <SiteHeader title="Tryout" />
      <div className="p-4 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Daftar Tryout</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Buat Tryout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Records</Label>
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
              <div className="ml-auto w-full md:w-80 flex gap-2">
                <Input
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && refetch()}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSearchBySpecific("");
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
                    <th className="p-3">Nama</th>
                    <th className="p-3">Waktu (detik)</th>
                    <th className="p-3">Timer</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Shuffle</th>
                    <th className="p-3">Mulai</th>
                    <th className="p-3">Berakhir</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td className="p-4" colSpan={9}>
                        Loading…
                      </td>
                    </tr>
                  ) : tableRows.length ? (
                    tableRows.map((t) => (
                      <tr key={t.id} className="border-t align-top">
                        <td className="p-3">
                          <div className="font-medium">{t.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {t.sub_title || "-"}
                          </div>
                        </td>
                        <td className="p-3">
                          {t.timer_type === "per_category" ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            t.total_time
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className="uppercase">
                            {t.timer_type.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className="uppercase">
                            {t.score_type}
                          </Badge>
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
                          {t.start_date ? formatDate(t.start_date) : "-"}
                        </td>
                        <td className="p-3">
                          {t.end_date ? formatDate(t.end_date) : "-"}
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
                            <Link
                              href={`/cms/tryout/paket-latihan/${t.id}/irt`}
                            >
                              <ActionIcon label="Penilaian IRT">
                                <PlayCircle className="h-4 w-4" />
                              </ActionIcon>
                            </Link>

                            {/* NEW: Rank */}
                            <Link href={`/cms/tryout/rank?test_id=${t.id}`}>
                              <ActionIcon label="Rank">
                                <Trophy className="h-4 w-4" />
                              </ActionIcon>
                            </Link>

                            <ActionIcon
                              label="Export"
                              onClick={() =>
                                onExport(t.id, t.slug || `test-${t.id}`)
                              }
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
                    ))
                  ) : (
                    <tr>
                      <td className="p-4" colSpan={9}>
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
                {editing ? "Form Ubah Tryout" : "Form Tambah Tryout"}
              </DialogTitle>
            </DialogHeader>

            <TryoutForm
              key={editing ? editing.id : "new"}
              initial={editing ? toForm(editing) : emptyForm}
              submitting={creating || updating}
              onCancel={() => setOpen(false)}
              onSubmit={onSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}