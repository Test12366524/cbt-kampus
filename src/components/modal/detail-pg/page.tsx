"use client";

import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// --- Service Import ---
import {
  useGetParticipantHistoryByIdQuery,
} from "@/services/student/tryout.service"; // Pastikan path ini benar

// --- DEFINISI TIPE BARU (Berdasarkan JSON Response Anda) ---

type QuestionDetails = {
  id: number;
  type: string; // 'essay', 'multiple_choice', dll.
  answer: string | null;
  options: Array<{ option: string; text: string }> | null;
  question: string;
};

// Tipe untuk satu soal yang dijawab peserta
type ApiParticipantQuestion = {
  id: number; // Ini adalah participant_question ID (untuk grading)
  participant_test_id: number;
  participant_test_question_category_id: number;
  question_id: number;
  question_details: QuestionDetails;
  user_answer: string | null;
  point: number | null;
  is_correct: boolean | null;
  is_flagged: boolean;
  is_graded: boolean;
  created_at: string;
  updated_at: string;
};


// Tipe untuk detail tes dari JSON
type ApiTestDetails = {
  id: number;
  slug: string;
  title: string;
  sub_title: string;
  // ... field lain jika ada
};


// --- Tipe Internal Komponen ---

// Tipe yang sudah diproses untuk tampilan Kategori
type GroupedCategory = {
  id: number; // participant_category_id
  name: string;
  code: string;
  end_date: string | null;
  participant_questions: ApiParticipantQuestion[]; // Gunakan tipe yang sudah benar
};

// Tipe untuk info peserta di header modal
type ParticipantInfo = {
  participant_name: string;
  test_details: ApiTestDetails;
  start_date: string;
};

// --- Props Komponen Utama ---
type ParticipantHistoryDetailPGProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  participantTestId: number | null;
  testId: number | null; // testId sepertinya tidak digunakan untuk fetch, tapi ada di props
};


export function ParticipantHistoryDetailPG({
  open,
  onOpenChange,
  participantTestId,
}: ParticipantHistoryDetailPGProps) {
  // State untuk modal grading
  const shouldFetch = open && typeof participantTestId === "number";

  // --- Memanggil Hook RTK Query ---
  // Tipe `rawData` sekarang adalah `ApiParticipantHistoryItem` (berkat transformResponse di service)
  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
  } = useGetParticipantHistoryByIdQuery(participantTestId ?? skipToken, {
    skip: !shouldFetch,
  });

  // --- [PERBAIKAN UTAMA] Pemrosesan Data (useMemo) ---
  const { categories, participantInfo } = useMemo(() => {
    // Jika tidak ada data (rawData adalah objek, BUKAN {data: []})
    if (!rawData) {
      return { categories: [], participantInfo: null };
    }

    // `rawData` adalah objek `ApiParticipantHistoryItem`
    // Ekstrak info peserta
    const pInfo: ParticipantInfo = {
      participant_name:
        rawData.participant_name || `User ID ${rawData.user_id}`,
      test_details: {
        ...rawData.test_details,
        sub_title: rawData.test_details.sub_title ?? "",
      },
      start_date: rawData.start_date ?? "", // pastikan selalu string
    };

    // Ekstrak dan proses kategori
    const groupedCategories: GroupedCategory[] = (
      rawData.participant_question_categories || []
    ).map((cat) => ({
      id: cat.id,
      name:
        cat.question_category_details?.name || `Kategori #${cat.id}`,
      code:
        cat.question_category_details?.code || `CAT-${cat.id}`,
      end_date: cat.end_date,
      // `participant_questions` sudah dalam format yang benar (ApiParticipantQuestion[])
      participant_questions: cat.participant_questions || [],
    }));

    return {
      categories: groupedCategories,
      participantInfo: pInfo,
    };
  }, [rawData]); // Dependensi hanya pada rawData

  // Judul modal
  const title =
    participantInfo?.test_details?.title || "Detail Pengerjaan Peserta";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] flex-col gap-4 p-0" style={{ maxWidth: "1000px" }}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {participantInfo ? (
              <>
                Peserta:{" "}
                <span className="font-medium">
                  {participantInfo.participant_name}
                </span>{" "}
                • Mulai:{" "}
                {participantInfo.start_date
                  ? new Date(participantInfo.start_date).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    })
                  : "-"}{" "}
              </>
            ) : (
              "Detail pengerjaan siswa"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengambil detail…
            </div>
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-red-600">
              <p>Gagal memuat data.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Tidak ada data pengerjaan esai yang ditemukan.
            </div>
          ) : (
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-4">
                {categories.map((cat) => (
                  // Loop dari categories yang sudah diproses
                  <div
                    key={cat.id}
                    className="rounded-xl border bg-muted/20 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{cat.name}</h3>
                      <Badge variant="outline">{cat.code}</Badge>
                    </div>

                    {/* daftar soal */}
                    <div className="space-y-3">
                      {(cat.participant_questions ?? []).map((q) => (
                        <QuestionItem
                          key={q.id}
                          question={q}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t bg-background px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Komponen Pembantu (QuestionItem) ---

function QuestionItem({
  question,
}: {
  question: ApiParticipantQuestion; // Ganti tipe ke ApiParticipantQuestion
}) {
  const qd = question.question_details;
  if (!qd) {
    // Safety check jika question_details tidak ada
    return (
      <div className="rounded-lg bg-red-100 p-3 ring-1 ring-red-300 text-red-700 text-xs">
        Data soal (question_details) tidak ditemukan untuk soal ID: {question.id}
      </div>
    );
  }
  
  const type: string = qd.type;
  const userAns = question.user_answer;
  const isCorrect = question.is_correct;
  const isGraded = question.is_graded;

  return (
    <div className="rounded-lg bg-white/70 p-3 ring-1 ring-muted/40">
      <div className="mb-2 flex items-start justify-between gap-4">
        <p className="text-sm font-medium leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: qd.question }} />
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline">
            {type.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Jawaban User */}
      <div className="mb-1 text-xs">
        <span className="text-muted-foreground block mb-1">
          Jawaban Peserta:
        </span>
        <div className="p-2 border rounded-md bg-gray-50 max-h-32 overflow-y-auto whitespace-pre-wrap">
          {userAns && userAns.trim() !== "" ? userAns : "— (Tidak menjawab)"}
        </div>
      </div>

      {/* Status & Nilai */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
        {type === "essay" ? (
          <>
            <span className="text-muted-foreground">Status Nilai:</span>
            <Badge variant={isGraded ? "default" : "destructive"}>
              {isGraded ? "SUDAH DINILAI" : "BELUM DINILAI"}
            </Badge>
            {isGraded && (
              <span className="text-sm font-bold text-primary">
                Nilai: {question.point ?? 0}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-muted-foreground">Status:</span>
            <Badge
              variant={
                isCorrect ? "default" : isCorrect === false ? "destructive" : "secondary"
              }
              className={
                isCorrect ? "bg-emerald-500 hover:bg-emerald-500" : ""
              }
            >
              {isCorrect ? "BENAR" : isCorrect === false ? "SALAH" : "—"}
            </Badge>
            {isCorrect === false && (
              <span className="text-xs text-muted-foreground">
                Kunci: {qd.answer ?? "—"}
              </span>
            )}
          </>
        )}
      </div>

      {/* Opsi untuk Multiple Choice (Jika diperlukan) */}
      {qd.type === "multiple_choice" ||
      qd.type === "true_false" ||
      qd.type === "multiple_choice_multiple_answer" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {(qd.options ?? []).map((opt: { option: string; text: string }) => {
            const isUserPick = userAns
              ? userAns
                  .split(",")
                  .map((s) => s.trim())
                  .includes(opt.option)
              : false;
            const isKey =
              typeof qd.answer === "string" &&
              qd.answer
                .split(",")
                .map((s) => s.trim())
                .includes(opt.option);

            return (
              <Badge
                key={opt.option}
                variant={isUserPick ? "default" : "outline"}
                className={
                  isKey
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                    : ""
                }
              >
                {opt.text}
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
