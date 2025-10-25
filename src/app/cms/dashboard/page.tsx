import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import {
  Package2,
  Users2,
  FileText,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

const nf = new Intl.NumberFormat("id-ID");
const cf = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function Page() {
  // TODO: Ganti dengan data asli dari API-mu
  const stats = [
    { label: "Total Paket", value: 0, icon: Package2, hint: "All time" },
    { label: "Total User", value: 470, icon: Users2, hint: "Terdaftar" },
    { label: "Total Transaksi", value: 0, icon: FileText, hint: "Selesai" },
    {
      label: "Total Revenue",
      value: 0,
      icon: DollarSign,
      hint: "Kumulatif",
      isCurrency: true,
    },
  ];

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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Analytics Dashboard
            </h1>

            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500/90" />
              Real-time Overview
            </div>
          </div>

          {/* KPI Cards */}
          <section className="mt-6 grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, isCurrency, hint }) => (
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
                    {isCurrency ? cf.format(value) : nf.format(value)}
                  </div>
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    Stable
                  </span>
                </div>

                {/* Hint / caption */}
                <div className="mt-2 text-xs text-muted-foreground">{hint}</div>

                {/* Decorative wave / gradient at bottom */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-70" />

                {/* Soft glow on hover */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/15 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              </article>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}