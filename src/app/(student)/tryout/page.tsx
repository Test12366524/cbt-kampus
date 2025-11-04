"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  BarChart3,
  Play,
  Loader2,
  Search,
  Clock3,
  ListChecks,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetTestListQuery } from "@/services/tryout/test.service";
import {
  useGenerateTestMutation,
  useGetParticipantHistoryListQuery,
} from "@/services/student/tryout.service";
import type { Test } from "@/types/tryout/test";
import Swal from "sweetalert2";

const PER_PAGE = 10;

function formatDurationFromSeconds(seconds?: number) {
  if (!seconds || seconds <= 0) return "-";
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} menit`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} jam${m ? ` ${m} menit` : ""}`;
}

export default function TryoutListPage() {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [q, setQ] = useState<string>("");

  const { data, isFetching, isLoading } = useGetTestListQuery({
    page,
    paginate: PER_PAGE,
    search: q,
    is_active: 1
  });

  // ongoing & completed (pakai service history)
  const { data: ongoing } = useGetParticipantHistoryListQuery({
    page: 1,
    paginate: 10,
    is_ongoing: 1,
  });
  const { data: completed } = useGetParticipantHistoryListQuery({
    page: 1,
    paginate: 10,
    is_completed: 1,
  });

  const ongoingMap = useMemo(() => {
    const out = new Map<number, number>();
    (ongoing?.data ?? []).forEach((h) => {
      if (h.test_id && h.id) out.set(h.test_id, h.id);
    });
    return out;
  }, [ongoing]);

  const completedSet = useMemo(() => {
    const s = new Set<number>();
    (completed?.data ?? []).forEach((h) => s.add(h.test_id));
    return s;
  }, [completed]);

  const [generateTest, { isLoading: starting }] = useGenerateTestMutation();

  const items: Test[] = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const working = isLoading || isFetching;

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q]);

  async function handleStart(testId: number) {
    try {
      void Swal.fire({
        title: "Mempersiapkan tryout…",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await generateTest({ test_id: testId }).unwrap();

      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "Sesi dibuat",
        text: "Mengalihkan ke halaman instruksi…",
        timer: 900,
        showConfirmButton: false,
      });

      router.push(`/tryout/session/${res.id}/start`);
    } catch (e) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Gagal memulai tryout",
        text:
          e instanceof Error
            ? e.message
            : "Terjadi kesalahan pada server. Coba lagi nanti.",
      });
    }
  }

  function handleContinue(participantTestId: number) {
    router.push(`/tryout/session/${participantTestId}/start`);
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-500 via-sky-400 to-sky-600 p-6 text-white shadow-lg ring-1 ring-white/20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Tryout
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Pilih paket tryout dan mulai kerjakan secara real-time.
          </p>

          <div className="mt-4 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-80" />
              <Input
                placeholder="Cari Tryout…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl border-0 bg-white px-9 py-2 text-slate-900 shadow-sm outline-none ring-2 ring-transparent focus:ring-sky-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {working && !items.length
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="h-28 animate-pulse rounded-xl bg-zinc-100" />
                <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
                <div className="mt-5 h-9 w-full animate-pulse rounded-lg bg-zinc-100" />
              </div>
            ))
          : items.map((t) => {
              const contId = ongoingMap.get(t.id);
              const isContinuable = !!contId;
              const isCompleted = completedSet.has(t.id);

              return (
                <article
                  key={t.id}
                  className="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-zinc-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="absolute right-4 top-4 rounded-xl bg-sky-50 p-2 text-sky-600 ring-1 ring-sky-100/70">
                    <FolderOpen className="h-5 w-5" />
                  </div>

                  <h3 className="pr-10 text-lg font-semibold text-zinc-900">
                    {t.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {t.sub_title ?? "-"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-zinc-600">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200/70">
                      <Clock3 className="h-4 w-4 text-sky-600" />
                      <span>
                        Durasi:{" "}
                        <strong className="text-zinc-800">
                          {t.timer_type === "per_category"
                            ? "Per kategori"
                            : formatDurationFromSeconds(t.total_time)}
                        </strong>
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 ring-1 ring-zinc-200/70">
                      <ListChecks className="h-4 w-4 text-sky-600" />
                      <span>
                        Soal:{" "}
                        <strong className="text-zinc-800">
                          {t.total_questions ?? 0}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {/* <Button
                      variant="outline"
                      className="justify-center gap-2"
                      asChild
                    >
                      <Link href={`/tryout/result/${t.id}`}>
                        <BarChart3 className="h-4 w-4" />
                        Hasil Tryout
                      </Link>
                    </Button> */}

                    {isContinuable ? (
                      <Button
                        onClick={() => handleContinue(contId!)}
                        className="justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Lanjutkan Tryout
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleStart(t.id)}
                        disabled={starting || isCompleted}
                        title={
                          isCompleted
                            ? "Tryout ini sudah diselesaikan"
                            : undefined
                        }
                        className="justify-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300"
                      >
                        {starting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memulai...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Mulai Tryout
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="skyblue"
                      className="w-full justify-center gap-2"
                      asChild
                    >
                      <Link href={`/tryout/rank-student?test_id=${t.id}`}>
                        <BarChart3 className="h-4 w-4" />
                        Peringkat
                      </Link>
                    </Button>
                  </div>

                  {/* Tombol Peringkat */}
                  {/* <div className="mt-2">
                  </div> */}
                </article>
              );
            })}

        {!working && items.length === 0 && (
          <div className="col-span-full rounded-2xl border bg-white p-10 text-center text-zinc-600">
            Tidak ada tryout yang tersedia.
          </div>
        )}
      </section>

      {/* Pagination */}
      {lastPage > 1 && (
        <nav className="flex items-center justify-between rounded-2xl border bg-white p-3 shadow-sm">
          <div className="text-sm text-zinc-600">
            Total {total} data • Halaman {page} dari {lastPage}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
            >
              Berikutnya
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}