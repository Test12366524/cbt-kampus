"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

import { Combobox } from "@/components/ui/combo-box";
import type { CategoryQuestion } from "@/types/bank-questions/category-questions";
import type { TestCategory } from "@/types/tryout/test-category";

import { useGetQuestionCategoryListQuery } from "@/services/bank-questions/category-questions.service";
import {
  useGetTestCategoryListQuery,
  useCreateTestCategoryMutation,
} from "@/services/tryout/test-category.service";
import SelectSoalModal from "./select-soal-modal";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: number;
};

export default function BankSoalModal({ open, onOpenChange, testId }: Props) {
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TestCategory | null>(null);

  const { data: catListResp, refetch } = useGetTestCategoryListQuery(
    { test_id: testId, page: 1, paginate: 50, search: "" },
    { skip: !testId }
  );

  const rows = catListResp?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bank Soal — Test #{testId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Kelola kategori bank soal untuk tryout ini.
            </div>
            <Button size="sm" onClick={() => setOpenCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create
            </Button>
          </div>

          {rows.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Belum ada kategori terpasang.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <CardTitle className="text-base">
                      {r.question_category_name}
                    </CardTitle>
                    <Badge variant="secondary">Urutan: {r.order}</Badge>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Durasi (detik):{" "}
                      <span className="font-medium">{r.total_time}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedRow(r)}
                    >
                      Pilih Soal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>

      <CreateKategoriModal
        open={openCreate}
        onOpenChange={setOpenCreate}
        testId={testId}
        onSaved={() => {
          setOpenCreate(false);
          refetch();
        }}
      />

      {selectedRow && (
        <SelectSoalModal
          open={!!selectedRow}
          onOpenChange={(v) => !v && setSelectedRow(null)}
          testId={testId}
          testQuestionCategoryId={selectedRow.id}
          questionCategoryId={selectedRow.question_category_id}
        />
      )}
    </Dialog>
  );
}

function CreateKategoriModal({
  open,
  onOpenChange,
  testId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  testId: number;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(600);
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<"active" | "inactive">("active"); // UI only

  const { data: catResp, isFetching } = useGetQuestionCategoryListQuery({
    page: 1,
    paginate: 100,
    search: "",
  });
  const categories: CategoryQuestion[] = catResp?.data ?? [];

  const [createCat, { isLoading }] = useCreateTestCategoryMutation();

  const save = async () => {
    if (!categoryId) return;
    const payload: Pick<
      TestCategory,
      "question_category_id" | "total_time" | "order"
    > = {
      question_category_id: categoryId,
      total_time: duration,
      order,
    };
    await createCat({ test_id: testId, payload }).unwrap();
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Paket Latihan – Kategori Bank Soal</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Kategori Bank Soal *</Label>
            <Combobox<CategoryQuestion>
              value={categoryId}
              onChange={setCategoryId}
              data={categories}
              isLoading={isFetching}
              placeholder="--Pilih Bank Soal---"
              getOptionLabel={(i) => `${i.name} (${i.code})`}
            />
          </div>

          <div className="grid gap-2">
            <Label>Durasi (Detik) *</Label>
            <Input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value || 0))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Urutan *</Label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value || 0))}
              placeholder="Urutan"
            />
          </div>

          <div className="grid gap-2">
            <Label>Status *</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              (UI saja; tidak dikirim karena tidak ada di interface.)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Reset
          </Button>
          <Button onClick={save} disabled={isLoading || !categoryId}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}