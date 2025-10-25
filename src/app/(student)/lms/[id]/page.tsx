"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useGetLmsByIdQuery } from "@/services/lms.service";
import { useGetLmsDetailsQuery } from "@/services/lms-detail.service";

import {
  ArrowLeft,
  Search,
  FileVideo2,
  FileAudio2,
  FileText,
  Image as ImageIcon,
  Link2,
  BookOpen,
  Play,
  Sparkles,
  Info,
  Filter,
} from "lucide-react";

/* ========= Type-safe keys ========= */
type TypeKey = "video" | "audio" | "pdf" | "image" | "external_link";
const TYPE_KEYS: TypeKey[] = [
  "video",
  "audio",
  "pdf",
  "image",
  "external_link",
];

const TypeIcon: Record<TypeKey, React.ReactNode> = {
  video: <FileVideo2 className="h-4 w-4" />,
  audio: <FileAudio2 className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  external_link: <Link2 className="h-4 w-4" />,
};

const typeChipClass: Record<TypeKey, { wrap: string; iconWrap: string }> = {
  video: {
    wrap: "bg-gradient-to-br from-sky-50 to-sky-100 ring-sky-200",
    iconWrap: "bg-sky-100 text-sky-700 ring-sky-200",
  },
  audio: {
    wrap: "bg-gradient-to-br from-cyan-50 to-cyan-100 ring-cyan-200",
    iconWrap: "bg-cyan-100 text-cyan-700 ring-cyan-200",
  },
  pdf: {
    wrap: "bg-gradient-to-br from-indigo-50 to-indigo-100 ring-indigo-200",
    iconWrap: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  },
  image: {
    wrap: "bg-gradient-to-br from-blue-50 to-blue-100 ring-blue-200",
    iconWrap: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  external_link: {
    wrap: "bg-gradient-to-br from-teal-50 to-teal-100 ring-teal-200",
    iconWrap: "bg-teal-100 text-teal-700 ring-teal-200",
  },
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/* ========= Page ========= */
export default function LmsDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const lmsId = Number(params.id);

  const [page, setPage] = useState(1);
  const [paginate] = useState(12);
  const [search, setSearch] = useState("");

  // filter tipe lokal
  const [typeFilter, setTypeFilter] = useState<"all" | TypeKey>("all");

  // Meta LMS
  const { data: lmsInfo, isFetching: loadingLms } = useGetLmsByIdQuery(lmsId, {
    skip: !lmsId,
  });

  // List detail
  const {
    data: detailsPage,
    isFetching: loadingList,
    refetch,
  } = useGetLmsDetailsQuery(
    { page, paginate, search, lms_id: lmsId },
    { skip: !lmsId }
  );

  const rows = detailsPage?.data ?? [];
  const lastPage = detailsPage?.last_page ?? 1;

  const canPrev = page > 1;
  const canNext = page < lastPage;

  const onSearch = () => {
    setPage(1);
    refetch();
  };

  // client-side filter by type
  const filteredRows = useMemo(() => {
    if (typeFilter === "all") return rows;
    return rows.filter((r) => (r.type as TypeKey) === typeFilter);
  }, [rows, typeFilter]);

  // jumlah per tipe (type-safe)
  const countsByType = useMemo<Record<TypeKey, number>>(() => {
    return rows.reduce<Record<TypeKey, number>>(
      (acc, r) => {
        const key = r.type as TypeKey;
        if (TYPE_KEYS.includes(key)) acc[key] += 1;
        return acc;
      },
      { video: 0, audio: 0, pdf: 0, image: 0, external_link: 0 }
    );
  }, [rows]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* ===== Hero header ===== */}
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 p-1 shadow-md"
        >
          <div className="rounded-[22px] bg-white/10 p-4 backdrop-blur-sm md:p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-start gap-3">
                <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="text-white">
                  <h1 className="text-xl font-semibold md:text-2xl">
                    {loadingLms ? "Memuat…" : lmsInfo?.title ?? `LMS #${lmsId}`}
                  </h1>
                  {lmsInfo?.sub_title && (
                    <p className="text-sm/6 text-sky-100">
                      {lmsInfo.sub_title}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {lmsInfo?.subject_name && (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
                        {lmsInfo.subject_name}
                      </span>
                    )}
                    {lmsInfo?.subject_sub_name && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-sky-50 ring-1 ring-white/20">
                        {lmsInfo.subject_sub_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => router.push("/lms")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
              </div>
            </div>

            {/* Search & filter bar */}
            <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
                  <Input
                    className="rounded-xl border-white/20 bg-white/15 pl-9 text-white placeholder:text-white/70 focus-visible:ring-white/50"
                    placeholder="Cari judul/slug detail…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1 text-xs text-white/90">
                    <Filter className="h-3.5 w-3.5" /> Filter tipe:
                  </span>

                  {(
                    [
                      ["all", "Semua"],
                      ["video", `Video (${countsByType.video})`],
                      ["audio", `Audio (${countsByType.audio})`],
                      ["pdf", `PDF (${countsByType.pdf})`],
                      ["image", `Gambar (${countsByType.image})`],
                      ["external_link", `Link (${countsByType.external_link})`],
                    ] as [typeof typeFilter, string][]
                  ).map(([key, label]) => {
                    const active = typeFilter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setTypeFilter(key)}
                        className={
                          active
                            ? "rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm"
                            : "rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur hover:bg-white/20"
                        }
                      >
                        {label}
                      </button>
                    );
                  })}

                  <Button
                    variant="outline"
                    className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                    onClick={onSearch}
                  >
                    Cari
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ===== List Detail ===== */}
        <section className="mt-6">
          {loadingList && rows.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-2xl bg-sky-100" />
                    <div className="w-full">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
                      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
                      <div className="mt-3 h-9 w-28 animate-pulse rounded bg-zinc-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-sky-200 bg-white p-8 text-center text-zinc-600">
              <Info className="h-5 w-5 text-sky-600" />
              <p className="text-sm">
                Tidak ada konten yang cocok dengan pencarian / filter.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-sky-200 text-sky-700"
                  onClick={() => setTypeFilter("all")}
                >
                  Hapus Filter
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {filteredRows.map((d) => {
                  const key = d.type as TypeKey;
                  const theme = typeChipClass[key];

                  return (
                    <motion.article
                      key={d.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-sky-100/80"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 grid h-12 w-12 place-items-center rounded-2xl ring-1 ${theme.iconWrap}`}
                        >
                          {TypeIcon[key]}
                        </div>

                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">
                            {d.title}
                          </h3>
                          {d.sub_title && (
                            <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600">
                              {d.sub_title}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium text-zinc-700 ring-1 ${theme.wrap}`}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span className="capitalize">
                                {key.replace("_", " ")}
                              </span>
                            </span>

                            <span className="text-xs text-zinc-500">
                              Dibuat: {fmtDate(d.created_at)}
                            </span>

                            {key === "external_link" && d.link && (
                              <span className="truncate text-xs text-zinc-500">
                                • {d.link}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          className="w-full rounded-xl bg-sky-500 font-medium hover:bg-sky-600"
                          onClick={() => router.push(`/lms/view/${d.id}`)}
                          title="Lihat materi"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Lihat materi
                        </Button>
                      </div>

                      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-100 opacity-0 blur-xl transition group-hover:opacity-60" />
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pager */}
          {detailsPage?.last_page && detailsPage.last_page > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-sky-200 text-sky-700"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <div className="rounded-lg border border-sky-200 bg-white px-3 py-1 text-sm text-sky-700">
                {detailsPage.current_page} / {detailsPage.last_page} •{" "}
                <span className="text-zinc-600">
                  {filteredRows.length} dari {rows.length} item
                </span>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-sky-200 text-sky-700"
                disabled={!canNext}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}