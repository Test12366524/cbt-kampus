"use client";

import * as React from "react";
import Swal from "sweetalert2";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import type { Class } from "@/types/master/class";

import {
  useCreateClassMutation,
  useGetClassByIdQuery,
  useUpdateClassMutation,
} from "@/services/master/class.service";

type Mode = "create" | "update";

interface ClassFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (mode: Mode) => void;
  classId?: number;
}

export default function ClassForm({
  open,
  onOpenChange,
  onSuccess,
  classId,
}: ClassFormProps) {
  const isEdit = typeof classId === "number";

  // detail saat edit
  const { data: detail, isFetching: loadingDetail } = useGetClassByIdQuery(
    classId as number,
    { skip: !isEdit }
  );

  // form state
  const [name, setName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [status, setStatus] = React.useState<boolean>(true);

  // prefill edit
  React.useEffect(() => {
    if (detail && isEdit) {
      setName(detail.name ?? "");
      setDescription(detail.description ?? "");
      setStatus(Boolean(detail.status));
    }
  }, [detail, isEdit]);

  // reset saat create
  React.useEffect(() => {
    if (open && !isEdit) {
      setName("");
      setDescription("");
      setStatus(true);
    }
  }, [open, isEdit]);

  // mutations
  const [createClass, { isLoading: creating }] = useCreateClassMutation();
  const [updateClass, { isLoading: updating }] = useUpdateClassMutation();
  const submitting = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      void Swal.fire({ icon: "warning", title: "Nama wajib diisi" });
      return;
    }

    const payload: Partial<Class> = {
      name: name.trim(),
      description: description.trim() || null,
      status,
    };

    try {
      if (isEdit) {
        await updateClass({ id: classId as number, payload }).unwrap();
        onSuccess("update");
      } else {
        await createClass(payload).unwrap();
        onSuccess("create");
      }
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Terjadi kesalahan. Coba lagi.";
      void Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kelas" : "Tambah Kelas"}</DialogTitle>
        </DialogHeader>

        {loadingDetail && isEdit ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* name */}
            <div className="space-y-2">
              <Label>Nama Kelas</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: X IPA 1"
              />
            </div>

            {/* description */}
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Keterangan kelas (opsional)"
              />
            </div>

            {/* status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Status</div>
                <div className="text-xs text-muted-foreground">
                  Aktif/nonaktifkan kelas
                </div>
              </div>
              <Switch checked={status} onCheckedChange={setStatus} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}