// src/app/admin/absen/guru/page.tsx (Lanjutan dari kode sebelumnya)
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import Swal from "sweetalert2";

// --- DEFINISI TIPE YANG HILANG (BARU/DIPERBAIKI) ---
type QuestionDetails = {
    id: number;
    type: string; // 'essay', 'multiple_choice', dll.
    answer: string | null;
    options: Array<{ option: string; text: string }> | null;
    question: string;
};

// Ganti import service sesuai kebutuhan grading
import { 
    useGetParticipantHistoryByIdEssayQuery,
    useGradeEssayMutation
} from "@/services/student/tryout.service"; 
import { ParticipantHistoryItem } from "@/types/student/tryout";

// --- Interface dari Service ---
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
  is_graded: boolean; 
  // Properti dari API datar
  test_details: { title: string }; // Perbaikan tipe
  test_id: number;
  user_id: number;
  participant_name?: string; 
  participant_email?: string; 
  created_at: string;
  updated_at: string;
};

// Interface yang sudah diproses untuk tampilan
type GroupedCategory = {
    id: number;
    name: string;
    code: string;
    end_date: string | null;
    participant_questions: ParticipantQuestionFromApi[];
};

type ParticipantHistoryDetailProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  participantTestId: number | null;
  testId: number | null;
};

// --- State untuk Grading ---
type GradeFormData = {
    point: number;
};

type GradingTarget = ParticipantQuestionFromApi | null;

export function ParticipantHistoryDetail({
  open,
  onOpenChange,
  participantTestId,
  testId,
}: ParticipantHistoryDetailProps) {
  // State untuk modal grading
  const [gradingTarget, setGradingTarget] = useState<GradingTarget>(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  const shouldFetch = open && typeof participantTestId === "number";

  const { data: rawData, isLoading, isError, refetch } =
    useGetParticipantHistoryByIdEssayQuery(
      shouldFetch && participantTestId !== null && testId !== null
        ? { participant_test_id: participantTestId, test_id: testId }
        : skipToken
    );

    
  // --- Hook Grading ---
  const [gradeEssay, { isLoading: isGrading }] = useGradeEssayMutation();


  // --- Pemrosesan Data Datar ke Grup Kategori ---
  const { categories, participantInfo } = useMemo(() => {
    if (!rawData || !rawData.data || rawData.data.length === 0) {
      return { categories: [], participantInfo: {} };
    }

    const questions: ParticipantHistoryItem[] = rawData.data;
    const firstQuestion = questions[0]; // Aman karena kita sudah cek length > 0

    // Mengelompokkan berdasarkan participant_test_question_category_id
    const groupedData = questions.reduce((acc, q) => {
      // Mengambil ID Kategori
      const catId = q.participant_test_question_category_id;
      
      if (typeof catId === "number") {
        if (!acc[catId]) {
          // Karena API tidak menyediakan detail kategori penuh, kita menggunakan placeholder
          acc[catId] = {
            id: catId,
            name: `Kategori #${catId}`, 
            code: `CAT-${catId}`, 
            end_date: null, 
            participant_questions: [],
          };
        }
        acc[catId].participant_questions.push(q as unknown as ParticipantQuestionFromApi);
      }
      return acc;
    }, {} as Record<number, GroupedCategory>);

    // Mengambil info peserta dari item pertama
    const participantInfo = {
        // PERBAIKAN LINE 172 (Menggunakan data yang tersedia)
        participant_name: firstQuestion.participant_name || `User ID ${firstQuestion.user_id}`,
        // PERBAIKAN LINE 138 (Menggunakan data yang tersedia)
        test_details: firstQuestion.test_details, 
        // PERBAIKAN LINE 175, 176 (Menggunakan data yang tersedia)
        start_date: firstQuestion.created_at, 
    };

    return {
        categories: Object.values(groupedData),
        participantInfo: participantInfo,
    };
  }, [rawData]);

  // PERBAIKAN LINE 138 (Akses properti di luar useMemo)
  const title = "Detail hasil pengerjaan peserta";


  // --- Grading Handlers ---
  const handleOpenGrading = (question: ParticipantQuestionFromApi) => {
    setGradingTarget(question);
    setIsGradingModalOpen(true);
  };
  
  const handleGradeSubmit = async (data: GradeFormData) => {
      if (!gradingTarget) return;
      try {
          // PERBAIKAN PAYLOAD GRADING: Menggunakan signature yang disederhanakan
          await gradeEssay({ 
              id: gradingTarget.id, 
              point: data.point, 
              is_graded: 1 
          }).unwrap();
          
          Swal.fire("Sukses", "Nilai berhasil diperbarui.", "success");
          setIsGradingModalOpen(false);
          setGradingTarget(null);
          refetch(); // Refresh data untuk melihat nilai baru
      } catch (error) {
          console.error(error);
          Swal.fire("Gagal", "Gagal menyimpan nilai.", "error");
      }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col gap-4 p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="text-xs">
            {participantInfo ? (
              <>
                Peserta:{" "}
                <span className="font-medium">
                  {/* PERBAIKAN LINE 172 */}
                  {participantInfo && "participant_name" in participantInfo
                    ? participantInfo.participant_name
                    : "-"}
                </span>{" "}
                • Mulai:{" "}
                {/* PERBAIKAN LINE 175, 176 */}
                {"start_date" in participantInfo && participantInfo.start_date
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
                    // PERBAIKAN LINE 103 (Menggunakan categories yang sudah diproses)
                    <div
                      key={cat.id}
                      className="rounded-xl border bg-muted/20 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          {cat.name}
                        </h3>
                        <Badge variant="outline">
                          {cat.code}
                        </Badge>
                      </div>

                      {/* daftar soal */}
                      <div className="space-y-3">
                        {(cat.participant_questions ?? []).map((q) => (
                          <QuestionItem 
                            key={q.id} 
                            question={q} 
                            onGradeClick={handleOpenGrading} 
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
      
      {/* Modal Grading */}
      <GradeEssayModal
        open={isGradingModalOpen}
        onOpenChange={setIsGradingModalOpen}
        target={gradingTarget}
        onSubmit={handleGradeSubmit}
        isSubmitting={isGrading}
      />
    </Dialog>
  );
}

// --- Komponen Pembantu (QuestionItem) ---

function QuestionItem({ question, onGradeClick }: { question: ParticipantQuestionFromApi, onGradeClick: (q: ParticipantQuestionFromApi) => void }) {
  const qd = question.question_details;
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
                {type.replace('_', ' ').toUpperCase()}
            </Badge>
            {type === 'essay' && (
                <Button 
                    variant={isGraded ? "default" : "secondary"} 
                    size="sm" 
                    onClick={() => onGradeClick(question)}
                    className="h-7 text-xs"
                >
                    <Edit3 className="h-3 w-3 mr-1" />
                    {isGraded ? 'Edit Nilai' : 'Nilai'}
                </Button>
            )}
        </div>
      </div>

      {/* Jawaban User */}
      <div className="mb-1 text-xs">
        <span className="text-muted-foreground block mb-1">Jawaban Peserta:</span>
        <div className="p-2 border rounded-md bg-gray-50 max-h-32 overflow-y-auto whitespace-pre-wrap">
            {userAns && userAns.trim() !== "" ? userAns : "— (Tidak menjawab)"}
        </div>
      </div>
      
      {/* Status & Nilai */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
        {type === 'essay' ? (
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
                    variant={isCorrect ? "default" : isCorrect === false ? "destructive" : "secondary"}
                    className={isCorrect ? "bg-emerald-500 hover:bg-emerald-500" : ""}
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


// --- Komponen Pembantu (Modal Grading Esai) ---

type GradeModalProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    target: GradingTarget;
    onSubmit: (data: GradeFormData) => void;
    isSubmitting: boolean;
}

function GradeEssayModal({ open, onOpenChange, target, onSubmit, isSubmitting }: GradeModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<GradeFormData>({
        defaultValues: { point: target?.point ?? 0 }
    });
    
    // Reset form value ketika target berubah
    useEffect(() => {
        if (target) {
            reset({ point: target.point ?? 0 });
        }
    }, [target, reset]);

    const handleLocalSubmit: SubmitHandler<GradeFormData> = (data) => {
        // Pastikan point adalah angka non-negatif
        if (data.point < 0) {
            Swal.fire("Validasi", "Nilai tidak boleh negatif.", "warning");
            return;
        }
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Nilai Esai</DialogTitle>
                    <DialogDescription>
                        Berikan nilai untuk jawaban esai ini.
                    </DialogDescription>
                </DialogHeader>

                {target && (
                    <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Soal: <span dangerouslySetInnerHTML={{ __html: target.question_details.question }} />
                            </p>
                            <p className="text-sm font-medium">
                                Jawaban Peserta: 
                            </p>
                            <div className="p-2 border rounded-md bg-gray-50 max-h-24 overflow-y-auto whitespace-pre-wrap text-xs">
                                {target.user_answer || "—"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="point">Nilai yang Diberikan</Label>
                            <Input
                                id="point"
                                type="number"
                                step="1"
                                min="0"
                                {...register("point", { required: "Nilai wajib diisi", valueAsNumber: true })}
                            />
                            {errors.point && <p className="text-xs text-red-500">{errors.point.message}</p>}
                        </div>

                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                type="button"
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan Nilai'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}