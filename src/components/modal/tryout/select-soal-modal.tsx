"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";

import { useGetQuestionListQuery } from "@/services/bank-questions/questions.service";
import { useCreateTestQuestionMutation } from "@/services/tryout/test-questions.service";
import type { Questions } from "@/types/bank-questions/questions";
// ⛔️ Hapus import TestQuestion karena tidak dipakai lagi
// import type { TestQuestion } from "@/types/tryout/test-questions";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: number;
  testQuestionCategoryId: number;
  questionCategoryId: number;
};

// ✅ Payload yang benar untuk endpoint: kumpulan ID soal
type TestQuestionCreatePayload = {
  question_ids: number[];
};

export default function SelectSoalModal({
  open,
  onOpenChange,
  testId,
  testQuestionCategoryId,
  questionCategoryId,
}: Props) {
  const [page, setPage] = useState(1);
  const [paginate] = useState(10);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  useMemo(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const {
    data: bankResp,
    isFetching,
    refetch,
  } = useGetQuestionListQuery({ page, paginate, search: query });

  const [create, { isLoading }] = useCreateTestQuestionMutation();

  const bankRows: Questions[] = (bankResp?.data ?? []).filter(
    (q) => q.question_category_id === questionCategoryId
  );

  const addSoal = async (q: Questions) => {
    const payload: TestQuestionCreatePayload = {
      question_ids: [q.id],
    };

    await create({
      test_id: testId,
      test_question_category_id: testQuestionCategoryId,
      payload,
    }).unwrap();

    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pilih Soal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <span className="text-xs font-medium">Pencarian</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Cari pertanyaan…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {isFetching && bankRows.length === 0 ? (
              <div className="rounded-lg border p-6 text-center">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat data…
                </div>
              </div>
            ) : bankRows.length === 0 ? (
              <div className="rounded-lg border p-6 text-center text-muted-foreground">
                Tidak ada soal untuk kategori ini.
              </div>
            ) : (
              bankRows.map((q) => (
                <Card key={q.id} className="overflow-hidden">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {q.type.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: q.question }}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addSoal(q)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Menambah..." : "Tambahkan"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs text-muted-foreground">Jawaban</div>
                    <div className="rounded-md border p-3 text-sm">
                      {q.answer || "-"}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}