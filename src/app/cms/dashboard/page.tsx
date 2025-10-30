"use client";

import Image from "next/image";
import { useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  Users2,
  FileText,
  GraduationCap,
  NotebookTabs,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { useGetDashboardAdminQuery } from "@/services/dashboard-admin.service";

const nf = new Intl.NumberFormat("id-ID");

export default function Page() {
  const { data, isLoading, isError, refetch } = useGetDashboardAdminQuery();

  // map dari response → ui
  const stats = useMemo(
    () => [
      {
        label: "Total Mahasiswa",
        value: data?.total_students ?? 0,
        icon: Users2,
        hint: "Semua mahasiswa aktif",
      },
      {
        label: "Total Ujian",
        value: data?.total_tests ?? 0,
        icon: FileText,
        hint: "Total paket ujian",
      },
      {
        label: "Total LMS",
        value: data?.total_lms ?? 0,
        icon: NotebookTabs,
        hint: "Modul pembelajaran",
      },
      {
        label: "Total Mata Kuliah",
        value: data?.total_subject ?? 0,
        icon: GraduationCap,
        hint: "Master mata kuliah",
      },
    ],
    [data]
  );

  return (
    <>
      <SiteHeader title="Dashboard" />

      <div className="relative flex flex-1 flex-col">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/wallpaper.jpeg"
            alt=""
            fill
            priority
            className="object-cover opacity-[0.06] dark:opacity-[0.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          <div className="absolute left-1/2 top-[-80px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        </div>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
          {/* Title row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Ringkasan aktivitas akademik hari ini
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500/90" />
              {isLoading
                ? "Memuat data dashboard…"
                : "Data terbaru dari server"}
              {!isLoading && (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="ml-1 inline-flex items-center gap-1 rounded-full bg-background/40 px-2 py-0.5 text-[10px] font-medium text-foreground/80 hover:bg-background/80"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <article
                  key={`skeleton-${i}`}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/40 p-5 shadow-sm backdrop-blur dark:bg-neutral-900/60"
                >
                  <div className="mb-3 h-4 w-28 animate-pulse rounded bg-muted/50" />
                  <div className="mb-2 h-10 w-32 animate-pulse rounded bg-muted/40" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted/30" />
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/15 blur-2xl" />
                </article>
              ))
            ) : isError ? (
              <div className="col-span-full rounded-2xl border border-red-200/70 bg-red-50/60 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
                Gagal memuat dashboard.
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="ml-3 inline-flex items-center gap-1 rounded-md bg-red-100/50 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  Coba lagi
                </button>
              </div>
            ) : (
              stats.map(({ label, value, icon: Icon, hint }) => (
                <article
                  key={label}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-white/65 p-5 shadow-sm backdrop-blur-lg transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900/60"
                >
                  {/* Subtle gradient border on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent transition group-hover:ring-primary/25" />

                  {/* Top right icon */}
                  <div className="absolute right-4 top-4 rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/20">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Label */}
                  <div className="text-sm font-medium text-muted-foreground">
                    {label}
                  </div>

                  {/* Value */}
                  <div className="mt-3 flex items-end gap-2">
                    <div className="text-4xl font-semibold leading-none tracking-tight md:text-5xl">
                      {nf.format(value)}
                    </div>
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                      <ArrowUpRight className="h-3 w-3" />
                      Stable
                    </span>
                  </div>

                  {/* Hint / caption */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {hint}
                  </div>

                  {/* Decorative wave / gradient at bottom */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-70" />

                  {/* Soft glow on hover */}
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/15 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                </article>
              ))
            )}
          </section>
        </main>
      </div>
    </>
  );
}