"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import {
  useGetParticipantHistoryByIdQuery,
  useGetActiveCategoryQuery,
  useContinueCategoryMutation,
} from "@/services/student/tryout.service";
import Swal from "sweetalert2";

function formatDurationFromSeconds(seconds?: number) {
  if (!seconds || seconds <= 0) return "-";
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} menit`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} jam${m ? ` ${m} menit` : ""}`;
}

/** Daftar aturan/larangan yang akan ditampilkan di halaman & modal konfirmasi */
const RULES: readonly string[] = [
  "Jangan refresh atau menutup tab selama ujian berlangsung",
  "Jangan keluar dari mode layar penuh dan jangan menekan tombol Esc",
  "Jangan berpindah tab atau meminimalkan jendela",
  "Jangan membuka Developer Tools (F12, Ctrl+Shift+I/J/C, Ctrl+U)",
  "Jangan menyalin, menempel, klik kanan, drag, atau menyeleksi teks",
  "Jangan menyimpan atau mencetak halaman (Ctrl+S / Ctrl+P)",
];

export default function StartTryoutPage() {
  const params = useParams<{ participantTestId: string }>();
  const participantTestId = Number(params.participantTestId);
  const router = useRouter();

  const { data: detail } = useGetParticipantHistoryByIdQuery(participantTestId);
  const { data: activeCategory, isFetching } =
    useGetActiveCategoryQuery(participantTestId);
  const [continueCategory, { isLoading: starting }] =
    useContinueCategoryMutation();

  async function handleStart() {
    if (!activeCategory) {
      await Swal.fire({
        icon: "info",
        title: "Tidak ada kategori aktif",
        text: "Sesi mungkin sudah selesai.",
      });
      return;
    }

    // Modal konfirmasi aturan
    const htmlList = `<ol style="text-align:left;margin:0 0 0 1em;padding:0;">
      ${RULES.map((r) => `<li style="margin:6px 0;">${r}</li>`).join("")}
      </ol>
      <p style="margin-top:10px"><strong>Pelanggaran berulang dapat membuat sesi otomatis terselesaikan.</strong></p>
      <p style="margin-top:4px">Menekan <strong>Esc</strong> akan memicu peringatan dan dapat langsung mensubmit ujian.</p>`;

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Konfirmasi Aturan Ujian",
      html: htmlList,
      confirmButtonText: "Saya mengerti dan setuju",
      cancelButtonText: "Batal",
      showCancelButton: true,
      reverseButtons: true,
      focusConfirm: false,
    });

    if (!confirm.isConfirmed) return;

    try {
      await continueCategory({
        participant_test_id: participantTestId,
        participant_category_id: activeCategory.id,
      }).unwrap();
      router.push(
        `/tryout/session/${participantTestId}/exam?category=${activeCategory.id}`
      );
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal memulai sesi kategori",
        text: e instanceof Error ? e.message : "Coba lagi.",
      });
    }
  }

  const isResume = !!activeCategory;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/tryout">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">
          {isResume ? "Lanjutkan Ujian" : "Selamat Datang"}
        </h1>
        <div />
      </div>

      <section className="overflow-hidden rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-gradient-to-br from-sky-600 to-sky-500 p-5 text-white shadow ring-1 ring-white/10">
          <h2 className="text-center text-lg font-semibold">
            Pastikan Anda siap sebelum {isResume ? "melanjutkan" : "memulai"}{" "}
            ujian
          </h2>

          <div className="mt-5 grid gap-4 rounded-xl bg-white p-5 text-zinc-900">
            <Row label="Nama Ujian" value={detail?.test_details.title ?? "-"} />
            <Row
              label="Durasi"
              value={
                detail?.test_details.timer_type === "per_category"
                  ? "Per kategori"
                  : formatDurationFromSeconds(detail?.test_details.total_time)
              }
            />
            <Row
              label="Total Soal"
              value={`${detail?.test_details.total_questions ?? 0}`}
            />
          </div>

          {/* Catatan penting / Larangan */}
          <div className="mt-6 text-sm">
            <p className="mb-2 font-semibold">Catatan penting:</p>
            <ul className="list-inside list-decimal space-y-1 text-white/90">
              {RULES.map((rule) => (
                <li key={rule}>{rule}.</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            className="rounded-xl bg-sky-600 px-6 hover:bg-sky-700"
            onClick={handleStart}
            disabled={isFetching || starting || !activeCategory}
          >
            {isResume ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Lanjutkan Ujian
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Mulai Ujian
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="col-span-1 text-zinc-600">{label}</div>
      <div className="col-span-2 font-medium">{value}</div>
    </div>
  );
}