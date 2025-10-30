"use client";

import { Fragment, useMemo } from "react";
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
import { useGetParticipantHistoryByIdQuery } from "@/services/student/tryout.service";
import type {
  ParticipantHistoryItem,
  ParticipantQuestionCategory,
  QuestionDetails,
  QuestionType,
} from "@/types/student/tryout";

type ParticipantQuestionFromApi = {
  id: number;
  participant_test_id: number;
  participant_test_question_category_id: number;
  question_id: number;
  question_details: QuestionDetails;
  user_answer: string | null;
  point: number | null;
  is_correct: boolean | null;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
};

type ParticipantQuestionCategoryWithQuestions = ParticipantQuestionCategory & {
  participant_questions?: ParticipantQuestionFromApi[];
};

type ParticipantHistoryWithQuestions = ParticipantHistoryItem & {
  participant_question_categories?: ParticipantQuestionCategoryWithQuestions[];
};

type ParticipantHistoryDetailProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  participantTestId: number | null;
};

export function ParticipantHistoryDetail({
  open,
  onOpenChange,
  participantTestId,
}: ParticipantHistoryDetailProps) {
  const shouldFetch = open && typeof participantTestId === "number";

  const { data, isLoading, isError, refetch } =
    useGetParticipantHistoryByIdQuery(
      shouldFetch && participantTestId ? participantTestId : skipToken
    );

  const detail: ParticipantHistoryWithQuestions | undefined = data
    ? (data as ParticipantHistoryWithQuestions)
    : undefined;

  const title =
    detail?.test_details?.title ?? "Detail hasil pengerjaan peserta";

  const categories: ParticipantQuestionCategoryWithQuestions[] = useMemo(
    () => detail?.participant_question_categories ?? [],
    [detail]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col gap-4 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {detail ? (
              <>
                Peserta:{" "}
                <span className="font-medium">
                  {detail.participant_name} ({detail.participant_email})
                </span>{" "}
                • Mulai:{" "}
                {detail.start_date
                  ? new Date(detail.start_date).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    })
                  : "-"}{" "}
                • Selesai:{" "}
                {detail.end_date
                  ? new Date(detail.end_date).toLocaleString("id-ID", {
                      timeZone: "Asia/Jakarta",
                    })
                  : "-"}
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
          ) : !detail ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Tidak ada data.
            </div>
          ) : (
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Peserta ini belum punya kategori soal atau datanya belum
                    direkam.
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="rounded-xl border bg-muted/20 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {cat.question_category_details?.name ??
                            "Kategori Soal"}
                        </h3>
                        <Badge variant="outline">
                          {cat.question_category_details?.code ?? "No Code"}
                        </Badge>
                        <Badge variant={cat.end_date ? "default" : "secondary"}>
                          {cat.end_date ? "Selesai" : "Belum selesai"}
                        </Badge>
                      </div>

                      {/* daftar soal */}
                      <div className="space-y-3">
                        {(cat.participant_questions ?? []).map((q) => (
                          <QuestionItem key={q.id} question={q} />
                        ))}
                        {(cat.participant_questions ?? []).length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            Tidak ada pertanyaan pada kategori ini.
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
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

function QuestionItem({ question }: { question: ParticipantQuestionFromApi }) {
  const qd = question.question_details;
  const type: QuestionType = qd.type;
  const userAns = question.user_answer;
  const isCorrect = question.is_correct;

  return (
    <div className="rounded-lg bg-white/70 p-3 ring-1 ring-muted/40">
      <div className="mb-2 flex items-start justify-between gap-4">
        <p className="text-sm font-medium leading-relaxed">
          {/* karena question bisa HTML, minimal tampilkan apa adanya */}
          {qd.question}
        </p>
        <Badge variant="outline" className="shrink-0">
          {type}
        </Badge>
      </div>

      {/* jawaban user */}
      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Jawaban kamu:</span>
        <Badge
          variant={isCorrect ? "default" : "secondary"}
          className={isCorrect ? "bg-emerald-500 hover:bg-emerald-500" : ""}
        >
          {userAns && userAns.trim() !== "" ? userAns : "—"}
        </Badge>
        {isCorrect === false && (
          <span className="text-xs text-muted-foreground">
            Kunci: {qd.answer ?? "—"}
          </span>
        )}
      </div>

      {/* kalau tipe multiple choice, tampilkan opsi */}
      {qd.type === "multiple_choice" ||
      qd.type === "true_false" ||
      qd.type === "multiple_choice_multiple_answer" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {(qd.options ?? []).map((opt) => {
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