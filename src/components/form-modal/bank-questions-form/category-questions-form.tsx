"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CategoryQuestion } from "@/types/bank-questions/category-questions";
import {
  useCreateQuestionCategoryMutation,
  useUpdateQuestionCategoryMutation,
} from "@/services/bank-questions/category-questions.service";
import { Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: CategoryQuestion | null; // jika ada => edit
  onSuccess?: () => void;
};

export default function CategoryQuestionForm({
  open,
  onOpenChange,
  initial,
  onSuccess,
}: Props) {
  const isEdit = !!initial;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);

  const [createCategory, { isLoading: creating }] =
    useCreateQuestionCategoryMutation();
  const [updateCategory, { isLoading: updating }] =
    useUpdateQuestionCategoryMutation();

  const submitting = useMemo(() => creating || updating, [creating, updating]);

  useEffect(() => {
    if (initial) {
      setCode(initial.code ?? "");
      setName(initial.name ?? "");
      setDescription(initial.description ?? "");
      // API menerima boolean|number → normalize ke boolean
      const st =
        typeof initial.status === "number"
          ? initial.status === 1
          : Boolean(initial.status);
      setStatus(st);
    } else {
      setCode("");
      setName("");
      setDescription("");
      setStatus(true);
    }
  }, [initial, open]);

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) {
      alert("Code dan Name wajib diisi.");
      return;
    }

    try {
      if (isEdit && initial) {
        await updateCategory({
          id: initial.id,
          payload: {
            code: code.trim(),
            name: name.trim(),
            // description nullable → jika kosong, biarkan undefined
            ...(description.trim() ? { description: description.trim() } : {}),
            status: status ? 1 : 0,
          },
        }).unwrap();
      } else {
        await createCategory({
          code: code.trim(),
          name: name.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          status: status ? 1 : 0,
        }).unwrap();
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan data.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kategori Soal" : "Tambah Kategori Soal"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Kode</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: IPS"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Kategori Soal</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: IPS"
              disabled={submitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dasar"
              disabled={submitting}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-xs text-muted-foreground">
                Aktif/non-aktif kategori
              </div>
            </div>
            <Switch
              checked={status}
              onCheckedChange={(v) => setStatus(v)}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}