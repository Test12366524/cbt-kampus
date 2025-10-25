// /app/lms/view/[detailId]/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetLmsDetailByIdQuery } from "@/services/lms-detail.service";
import {
  ArrowLeft,
  FileVideo2,
  FileAudio2,
  FileText,
  Image as ImageIcon,
  Link2,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LmsDetail } from "@/types/lms-detail";

const TypeIcon: Record<LmsDetail["type"], React.ReactNode> = {
  video: <FileVideo2 className="h-5 w-5" />,
  audio: <FileAudio2 className="h-5 w-5" />,
  pdf: <FileText className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  external_link: <Link2 className="h-5 w-5" />,
};

export default function LmsViewerPage() {
  const params = useParams<{ detailId: string }>();
  const router = useRouter();
  const detailId = Number(params.detailId);

  const { data, isFetching, isError } = useGetLmsDetailByIdQuery(detailId, {
    skip: !detailId,
  });

  const activeType = data?.type;
  const activeFile = data?.file ?? data?.media?.[0]?.original_url ?? null;
  const activeLink = data?.link ?? null;

  // 🔽 atur tinggi viewer di sini
  const VIEW_H = "h-[68vh] max-h-[68vh]";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold md:text-xl">
                {isFetching
                  ? "Memuat materi…"
                  : data?.title ?? `Materi #${detailId}`}
              </h1>
              {data?.sub_title && (
                <p className="text-sm text-sky-700">{data.sub_title}</p>
              )}
              {activeType && (
                <div className="mt-1 inline-flex items-center gap-2 text-sm text-sky-700">
                  {TypeIcon[activeType]}
                  <span className="capitalize">
                    {activeType.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="rounded-xl border-sky-200 text-sky-700"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>

        {/* Viewer */}
        <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
          {isFetching ? (
            <div className={`rounded-xl bg-zinc-100 ${VIEW_H}`} />
          ) : isError || !data ? (
            <div className="rounded-xl border border-dashed border-sky-200 p-6 text-red-600">
              Materi tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky-100 bg-white p-2">
                {/* PDF */}
                {activeType === "pdf" && activeFile && (
                  <iframe
                    src={`${activeFile}#toolbar=1&navpanes=0`}
                    className={`w-full rounded-lg ${VIEW_H}`}
                    title="PDF Viewer"
                  />
                )}

                {/* Video */}
                {activeType === "video" && (activeFile || activeLink) && (
                  <video
                    className={`w-full rounded-lg ${VIEW_H}`}
                    src={activeFile ?? activeLink ?? undefined}
                    controls
                  />
                )}

                {/* Audio (tinggi alami) */}
                {activeType === "audio" && (activeFile || activeLink) && (
                  <audio
                    className="w-full"
                    src={activeFile ?? activeLink ?? undefined}
                    controls
                  />
                )}

                {/* Image */}
                {activeType === "image" && activeFile && (
                  <div
                    className={`flex w-full justify-center overflow-auto ${VIEW_H}`}
                  >
                    <img
                      src={activeFile}
                      alt={data.title}
                      className="max-h-full rounded-lg object-contain"
                    />
                  </div>
                )}

                {/* External link */}
                {activeType === "external_link" && activeLink && (
                  <div className="rounded-lg border border-sky-100 bg-sky-50 p-4 text-sky-700">
                    Materi tersedia pada tautan eksternal:&nbsp;
                    <a
                      href={activeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline"
                    >
                      Buka tautan
                    </a>
                  </div>
                )}

                {!activeType && (
                  <div className="text-sm text-zinc-600">
                    Tipe materi tidak dikenali.
                  </div>
                )}
              </div>

              {data.description && (
                <div className="prose prose-sm max-w-none prose-a:text-sky-600">
                  <div dangerouslySetInnerHTML={{ __html: data.description }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}