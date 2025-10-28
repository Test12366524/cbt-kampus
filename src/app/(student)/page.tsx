"use client";

import { useMemo } from "react";
import { Trophy, AlertCircle, User2 } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetParticipantHistoryListQuery } from "@/services/student/tryout.service";
import type { ParticipantHistoryItem } from "@/types/student/tryout";
import { useSession } from "next-auth/react";


/** ===== Utils ===== */
function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(d);
  } catch {
    return iso ?? "—";
  }
}

/** ===== Page ===== */
export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const nameUser = user?.name;
  const emailUser = user?.email;

  // Query hanya jalan kalau user tersedia
  const queryArg =
    user != null
      ? {
          user_id: user.id,
          paginate: 10,
          orderBy: "updated_at" as const,
        }
      : skipToken;

  const {
    data: history,
    isLoading,
    isError,
  } = useGetParticipantHistoryListQuery(queryArg);

  // Normalisasi & sortir terbaru, lalu ambil 5 teratas
  const latestTop5 = useMemo(() => {
    const items = (history?.data ?? []).slice();
    const ts = (r: ParticipantHistoryItem): number => {
      const pick =
        r.updated_at ?? r.end_date ?? r.start_date ?? r.created_at ?? null;
      return pick ? new Date(pick).getTime() : 0;
    };
    items.sort((a, b) => ts(b) - ts(a));
    return items.slice(0, 5);
  }, [history]);

  // Hitung nilai terbesar & terkecil dari 5 terbaru
  const { maxScore, minScore, maxMeta, minMeta } = useMemo(() => {
    const withScore = latestTop5.filter(
      (r) => typeof r.grade === "number" && !Number.isNaN(r.grade)
    );
    if (withScore.length === 0) {
      return {
        maxScore: null as number | null,
        minScore: null as number | null,
        maxMeta: undefined as ParticipantHistoryItem | undefined,
        minMeta: undefined as ParticipantHistoryItem | undefined,
      };
    }
    const grades = withScore.map((r) => r.grade as number);
    const max = Math.max(...grades);
    const min = Math.min(...grades);
    const maxRow = withScore.find((r) => r.grade === max);
    const minRow = withScore.find((r) => r.grade === min);
    return { maxScore: max, minScore: min, maxMeta: maxRow, minMeta: minRow };
  }, [latestTop5]);

  const totalHistory = history?.total ?? 0;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border bg-white/80 px-5 py-4 text-center shadow-sm">
          <p className="text-sm text-zinc-700">
            Kamu belum masuk. Silakan login agar data dashboard dapat dimuat
            dari session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.06),transparent_40%)]">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-[240px,1fr] md:gap-6">
        <main className="space-y-6">
          {/* Welcome */}
          <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-zinc-100 shadow-sm backdrop-blur md:p-6">
            <div className="flex flex-wrap items-center gap-3 rounded-xl">
              <div className="inline-grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200">
                <User2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold md:text-xl">
                  Selamat Datang {nameUser}
                </p>
                <p className="truncate text-sm text-sky-700">{emailUser}</p>
              </div>
            </div>

            {/* Cards row */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card
                tone="sky"
                title="Total Paket Saya"
                value={String(totalHistory)}
                subtitle="Riwayat pengerjaan"
              />

              <Card
                tone="indigo"
                title="Nilai Ujian Terbesar"
                value={maxScore !== null ? String(maxScore) : "—"}
                subtitle={
                  maxMeta
                    ? `${maxMeta.test_details?.title ?? "—"} • ${formatDateTime(
                        maxMeta.end_date ??
                          maxMeta.updated_at ??
                          maxMeta.start_date ??
                          null
                      )}`
                    : "Belum ada nilai"
                }
                icon={<Trophy className="h-4 w-4" />}
              />

              <Card
                tone="soft"
                title="Nilai Ujian Terendah"
                value={minScore !== null ? String(minScore) : "—"}
                subtitle={
                  minMeta
                    ? `${minMeta.test_details?.title ?? "—"} • ${formatDateTime(
                        minMeta.end_date ??
                          minMeta.updated_at ??
                          minMeta.start_date ??
                          null
                      )}`
                    : "Belum ada nilai"
                }
                icon={<AlertCircle className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Hasil Latihan Terbaru */}
          <div className="rounded-2xl bg-white/80 ring-1 ring-zinc-100 shadow-sm backdrop-blur">
            <div className="border-b border-zinc-100 px-4 py-3 md:px-6">
              <h3 className="font-semibold">Hasil Latihan Terbaru</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-sky-50/60 text-zinc-700">
                    <Th>Test</Th>
                    <Th>Mulai</Th>
                    <Th>Selesai</Th>
                    <Th align="right">Nilai</Th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr
                        key={`skeleton-${i}`}
                        className={i % 2 ? "bg-zinc-50/40" : "bg-white/50"}
                      >
                        <Td>
                          <div className="h-4 w-56 animate-pulse rounded bg-zinc-200" />
                        </Td>
                        <Td>
                          <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
                        </Td>
                        <Td>
                          <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
                        </Td>
                        <Td align="right">
                          <div className="ml-auto h-5 w-10 animate-pulse rounded bg-zinc-200" />
                        </Td>
                      </tr>
                    ))}

                  {isError && (
                    <tr>
                      <Td colSpan={4}>
                        <span className="text-red-600">Gagal memuat data.</span>
                      </Td>
                    </tr>
                  )}

                  {!isLoading && !isError && latestTop5.length === 0 && (
                    <tr>
                      <Td colSpan={4}>
                        <span className="text-zinc-600">
                          Belum ada hasil latihan.
                        </span>
                      </Td>
                    </tr>
                  )}

                  {!isLoading &&
                    !isError &&
                    latestTop5.map((r, i) => {
                      const score =
                        typeof r.grade === "number" && !Number.isNaN(r.grade)
                          ? String(r.grade)
                          : "—";
                      return (
                        <tr
                          key={r.id}
                          className={i % 2 ? "bg-zinc-50/40" : "bg-white/50"}
                        >
                          <Td>
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-indigo-500/70" />
                              {r.test_details?.title ?? "—"}
                            </span>
                          </Td>
                          <Td>{formatDateTime(r.start_date)}</Td>
                          <Td>
                            {formatDateTime(r.end_date ?? r.updated_at ?? null)}
                          </Td>
                          <Td align="right">
                            <span
                              className={`inline-flex min-w-[36px] justify-center rounded-md px-2 py-0.5 font-semibold ${
                                score === "—"
                                  ? "bg-zinc-100 text-zinc-500"
                                  : "bg-indigo-600/10 text-indigo-700 ring-1 ring-indigo-600/15"
                              }`}
                            >
                              {score}
                            </span>
                          </Td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/** ===== UI bits ===== */
function Card({
  tone,
  title,
  value,
  subtitle,
  icon,
}: {
  tone: "sky" | "indigo" | "soft";
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  const theme =
    tone === "sky"
      ? {
          wrap: "bg-sky-100/70 ring-sky-200/70",
          value: "text-sky-700",
          chip: "bg-white/60 text-sky-700 ring-1 ring-white/70",
        }
      : tone === "indigo"
      ? {
          wrap: "bg-indigo-700 text-white ring-indigo-800/60",
          value: "text-white",
          chip: "bg-white/10 text-white/90 ring-1 ring-white/20",
        }
      : {
          wrap: "bg-zinc-100/70 ring-zinc-200/80",
          value: "text-zinc-900",
          chip: "bg-sky-600/10 text-sky-700 ring-1 ring-sky-600/20",
        };

  return (
    <div className={`rounded-2xl p-4 ring-1 shadow-sm ${theme.wrap}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm/5 font-medium opacity-80">{title}</p>
          <div className={`mt-1 text-4xl font-semibold ${theme.value}`}>
            {value}
          </div>
          {subtitle && <p className="mt-1 text-xs opacity-80">{subtitle}</p>}
        </div>
        {icon && <div className={`rounded-xl p-2 ${theme.chip}`}>{icon}</div>}
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  colSpan,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 text-zinc-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}