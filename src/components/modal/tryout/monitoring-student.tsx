"use client";

import { useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, RotateCcw } from "lucide-react";
import Pager from "@/components/ui/tryout-pagination";
import { displayDate } from "@/lib/format-utils";
import {
  useGetParticipantHistoryListQuery,
  useRegenerateTestMutation,
  useEndSessionMutation,
} from "@/services/student/tryout.service";
import type { ParticipantHistoryItem } from "@/types/student/tryout";
import Swal from "sweetalert2";

type TryoutMonitoringDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: { id: number; title: string } | null;
  isSuperadmin: boolean;
  myId: number;
};

const MONITOR_PER_PAGE = 10;
const DIALOG_ID = "tryout-monitoring-dialog";

type ParticipantPagination = {
  current_page: number;
  data: ParticipantHistoryItem[];
  last_page: number;
  total: number;
};

type ParticipantWrappedPagination = {
  code: number;
  message: string;
  data: ParticipantPagination;
};

function isParticipantPagination(
  value: unknown
): value is ParticipantPagination {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.current_page === "number" &&
    Array.isArray(v.data) &&
    typeof v.last_page === "number"
  );
}

function isParticipantWrappedPagination(
  value: unknown
): value is ParticipantWrappedPagination {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!("data" in v)) return false;
  const inner = v.data;
  return isParticipantPagination(inner);
}

function toParticipantPagination(
  value: unknown,
  fallbackPage: number
): ParticipantPagination {
  if (isParticipantPagination(value)) return value;
  if (isParticipantWrappedPagination(value)) return value.data;
  return {
    current_page: fallbackPage,
    data: [],
    last_page: 1,
    total: 0,
  };
}

function getParticipantName(p: ParticipantHistoryItem): string {
  const p1 = (p as { user_name?: string }).user_name;
  if (p1) return p1;
  const p2 = (p as { user?: { name?: string } }).user?.name;
  if (p2) return p2;
  const p3 = (p as { participant_name?: string }).participant_name;
  if (p3) return p3;
  return `User #${p.user_id}`;
}

export default function TryoutMonitoringDialog({
  open,
  onOpenChange,
  test,
  isSuperadmin,
  myId,
}: TryoutMonitoringDialogProps) {
  const [monitorTab, setMonitorTab] = useState<"ongoing" | "completed">(
    "ongoing"
  );
  const [monitorSearch, setMonitorSearch] = useState("");
  const [monitorPageOngoing, setMonitorPageOngoing] = useState(1);
  const [monitorPageCompleted, setMonitorPageCompleted] = useState(1);

  // SweetAlert instance ditempel ke dalam dialog agar bisa di-click dan tidak tertutup overlay
  const swal = Swal.mixin({
    target: `#${DIALOG_ID}`, // render di dalam DialogContent
    customClass: {
      container: "!z-[9999]",
      popup: "!z-[10000]",
    },
    // hindari layout shift saat swal muncul di dalam container yang scrollable
    scrollbarPadding: false,
    heightAuto: false,
  });

  const baseMonitor =
    open && test
      ? {
          test_id: test.id,
          ...(isSuperadmin ? {} : { user_id: myId }),
        }
      : skipToken;

  // --- query ongoing ---
  const {
    data: ongoingRespRaw,
    isFetching: loadingOngoing,
    refetch: refetchOngoing,
  } = useGetParticipantHistoryListQuery(
    baseMonitor !== skipToken
      ? {
          ...baseMonitor,
          page: monitorPageOngoing,
          paginate: MONITOR_PER_PAGE,
          is_ongoing: 1,
          ...(monitorSearch ? { search: monitorSearch } : {}),
        }
      : skipToken,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // --- query completed ---
  const {
    data: completedRespRaw,
    isFetching: loadingCompleted,
    refetch: refetchCompleted,
  } = useGetParticipantHistoryListQuery(
    baseMonitor !== skipToken
      ? {
          ...baseMonitor,
          page: monitorPageCompleted,
          paginate: MONITOR_PER_PAGE,
          is_completed: 1,
          ...(monitorSearch ? { search: monitorSearch } : {}),
        }
      : skipToken,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const ongoingResp = toParticipantPagination(
    ongoingRespRaw,
    monitorPageOngoing
  );
  const completedResp = toParticipantPagination(
    completedRespRaw,
    monitorPageCompleted
  );

  const ongoingList = ongoingResp.data;
  const ongoingCurrentPage = ongoingResp.current_page;
  const ongoingLastPage = ongoingResp.last_page;
  const ongoingTotal = ongoingResp.total;

  const completedList = completedResp.data;
  const completedCurrentPage = completedResp.current_page;
  const completedLastPage = completedResp.last_page;
  const completedTotal = completedResp.total;

  const [regenerateTest, { isLoading: continuingAdmin }] =
    useRegenerateTestMutation();
  const [endSessionAdmin, { isLoading: endingAdmin }] = useEndSessionMutation();

  const loadingMonitor = loadingOngoing || loadingCompleted;

  async function refetchMonitor() {
    await Promise.all([refetchOngoing(), refetchCompleted()]);
  }

  // === Ganti confirm/alert -> SweetAlert2 (klik-able di dalam dialog) ===
  async function handleForceFinish(participantTestId: number, nama: string) {
    const res = await swal.fire({
      icon: "warning",
      title: "Selesaikan ujian?",
      text: `Ujian milik ${nama} akan ditandai selesai.`,
      showCancelButton: true,
      confirmButtonText: "Ya, selesaikan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!res.isConfirmed) return;

    try {
      await endSessionAdmin(participantTestId).unwrap();
      await refetchMonitor();
      await swal.fire({
        icon: "success",
        title: "Berhasil diselesaikan",
        text: `Ujian ${nama} telah selesai.`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Gagal menyelesaikan sesi peserta.";
      await swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    }
  }

  async function handleReopen(participantTestId: number, nama: string) {
    const res = await swal.fire({
      icon: "question",
      title: "Buka lagi ujian?",
      text: `Peserta ${nama} akan bisa mengerjakan lagi.`,
      showCancelButton: true,
      confirmButtonText: "Ya, buka lagi",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!res.isConfirmed) return;

    try {
      await regenerateTest(participantTestId).unwrap();
      await refetchMonitor();
      await swal.fire({
        icon: "success",
        title: "Berhasil dibuka lagi",
        text: `Peserta ${nama} bisa mengerjakan kembali.`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Gagal membuka sesi peserta.";
      await swal.fire({
        icon: "error",
        title: "Gagal",
        text: message,
      });
    }
  }

  function handleClose() {
    setMonitorTab("ongoing");
    setMonitorSearch("");
    setMonitorPageOngoing(1);
    setMonitorPageCompleted(1);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) onOpenChange(true);
        else handleClose();
      }}
    >
      {/* id dipakai sebagai target swal supaya klik-able */}
      <DialogContent
        id={DIALOG_ID}
        className="max-h-[95vh] overflow-y-auto sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>
            Monitoring Ujian
            {test ? ` – ${test.title}` : ""}
          </DialogTitle>
        </DialogHeader>

        {/* top bar */}
        <div className="mb-3 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="text-sm text-muted-foreground">
            {isSuperadmin
              ? "Anda melihat semua peserta."
              : "Anda melihat peserta pada ujian yang diawasi Anda."}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Cari nama / user id…"
              value={monitorSearch}
              onChange={(e) => {
                const val = e.target.value;
                setMonitorSearch(val);
                setMonitorPageOngoing(1);
                setMonitorPageCompleted(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void refetchMonitor();
              }}
              className="h-9 w-48"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refetchMonitor()}
              disabled={loadingMonitor}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* tabs */}
        <div className="mb-4 flex gap-2 border-b">
          <button
            type="button"
            onClick={() => {
              setMonitorTab("ongoing");
              setMonitorPageOngoing(1);
            }}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
              monitorTab === "ongoing"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Sedang mengerjakan ({ongoingTotal})
          </button>
          <button
            type="button"
            onClick={() => {
              setMonitorTab("completed");
              setMonitorPageCompleted(1);
            }}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
              monitorTab === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Sudah selesai ({completedTotal})
          </button>
        </div>

        {/* TAB: SEDANG MENGERJAKAN */}
        {monitorTab === "ongoing" ? (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="w-[38%] p-2 text-left">Peserta</th>
                    <th className="p-2 text-left">Mulai</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="w-[140px] p-2 text-right">Aksi</th>
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
                            {p.start_date
                              ? displayDate(p.start_date)
                              : p.started_at
                              ? displayDate(p.started_at)
                              : "-"}
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

            <Pager
              page={ongoingCurrentPage}
              lastPage={ongoingLastPage}
              onChange={(p) => setMonitorPageOngoing(p)}
            />
          </div>
        ) : null}

        {/* TAB: SUDAH SELESAI */}
        {monitorTab === "completed" ? (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="w-[38%] p-2 text-left">Peserta</th>
                    <th className="p-2 text-left">Selesai</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="w-[140px] p-2 text-right">Aksi</th>
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
                            {p.end_date
                              ? displayDate(p.end_date)
                              : p.ended_at
                              ? displayDate(p.ended_at)
                              : "-"}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="bg-emerald-50">
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

            <Pager
              page={completedCurrentPage}
              lastPage={completedLastPage}
              onChange={(p) => setMonitorPageCompleted(p)}
            />
          </div>
        ) : null}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}