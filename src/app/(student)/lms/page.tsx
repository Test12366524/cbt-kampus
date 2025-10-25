"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetLmsQuery } from "@/services/lms.service";
import type { Lms } from "@/types/lms";
import {
  Search,
  BookOpen,
  Image as ImageIcon,
  ChevronRight,
  BookCopy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ====== UI bits ====== */
function Badge({
  children,
  tone = "sky",
}: {
  children: React.ReactNode;
  tone?: "sky" | "outline";
}) {
  return tone === "sky" ? (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
      {children}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs text-sky-700 ring-1 ring-sky-200">
      {children}
    </span>
  );
}

/** Cover seragam tinggi tetap, tanpa ruang kosong (object-cover) */
function CardCover({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-sky-50">
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sky-600/70">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
      {/* overlay halus */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
    </div>
  );
}

/* ====== Skeleton untuk Suspense ====== */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-grid h-11 w-11 place-items-center rounded-xl bg-sky-200" />
            <div>
              <div className="h-6 w-48 rounded bg-zinc-200" />
              <div className="mt-2 h-4 w-64 rounded bg-zinc-200" />
            </div>
          </div>
          <div className="flex w-full max-w-lg gap-2 md:w-auto">
            <div className="relative w-full">
              <div className="h-10 w-full rounded-xl bg-zinc-200" />
            </div>
            <div className="h-10 w-16 rounded-xl bg-zinc-200" />
          </div>
        </header>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
            >
              <div className="h-44 w-full animate-pulse bg-zinc-200" />
              <div className="p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
                <div className="mt-4 h-9 w-28 animate-pulse rounded bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====== Inner yang pakai hooks searchParams (dibungkus Suspense) ====== */
function LmsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [paginate] = useState(12);

  // sinkron dengan ?search= dari URL
  const urlQuery = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(urlQuery);

  // setiap URL berubah (mis. dari header search), sync ke state & reset page
  useEffect(() => {
    setSearch(urlQuery);
    setPage(1);
  }, [urlQuery]);

  const { data, isFetching } = useGetLmsQuery({
    page,
    paginate,
    search,
  });

  const rows: Lms[] = data?.data ?? [];

  const pushSearch = () => {
    const term = search.trim();
    router.push(term ? `/lms?search=${encodeURIComponent(term)}` : "/lms");
    // RTK Query otomatis refetch karena state 'search' akan bereaksi lewat effect urlQuery
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">
                Materi Pembelajaran
              </h1>
              <p className="text-sm text-sky-700">
                Pilih materi dan pelajari dengan nyaman.
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-lg gap-2 md:w-auto">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600/70" />
              <input
                type="text"
                placeholder="Cari judul materi…"
                aria-label="Cari materi"
                className="w-full rounded-xl border-sky-200 pl-9 pr-9 py-2 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && pushSearch()}
              />
              {/* tombol clear kecil */}
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    router.push("/lms");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-white px-2 text-xs text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50"
                  aria-label="Bersihkan"
                >
                  ×
                </button>
              )}
            </div>
            <Button
              onClick={pushSearch}
              className="rounded-xl bg-sky-500 hover:bg-sky-600"
            >
              Cari
            </Button>
          </div>
        </header>

        {/* Grid */}
        <section>
          {isFetching && rows.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
                >
                  <div className="h-44 w-full animate-pulse bg-zinc-200" />
                  <div className="p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-4 h-9 w-28 animate-pulse rounded bg-zinc-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-sky-100 bg-white p-6 text-center text-zinc-600">
              Tidak ada materi.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <CardCover
                    src={typeof item.cover === "string" ? item.cover : ""}
                    alt={item.title}
                  />

                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    {item.sub_title && (
                      <p className="mt-1 line-clamp-2 min-h-[40px] text-sm text-zinc-600">
                        {item.sub_title}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.subject_name && (
                        <Badge tone="sky">{item.subject_name}</Badge>
                      )}
                      {item.subject_sub_name && (
                        <Badge tone="outline">{item.subject_sub_name}</Badge>
                      )}
                    </div>

                    <div className="mt-4">
                      <Button
                        asChild
                        className="w-full rounded-xl bg-sky-500 font-medium hover:bg-sky-600"
                      >
                        <Link
                          href={`/lms/${item.id}`}
                          className="inline-flex items-center justify-center gap-1.5"
                        >
                          <BookCopy className="h-4 w-4" />
                          Detail <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pagination sederhana (next/prev) */}
        {data?.last_page && data.last_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              className="rounded-xl border-sky-200 text-sky-700"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <div className="rounded-lg border border-sky-200 bg-white px-3 py-1 text-sm text-sky-700">
              {data.current_page} / {data.last_page}
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-sky-200 text-sky-700"
              disabled={page >= data.last_page}
              onClick={() =>
                setPage((p) => Math.min(data.last_page ?? p, p + 1))
              }
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== Export default dengan Suspense ====== */
export default function LmsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LmsPageInner />
    </Suspense>
  );
}