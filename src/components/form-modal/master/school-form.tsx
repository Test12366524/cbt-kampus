"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useGetSchoolByIdQuery,
} from "@/services/master/school.service";
import type { School } from "@/types/master/school";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RegionPickers } from "@/components/admin-components/region-pickers";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  schoolId?: number | null; // jika ada → edit mode
};

type SchoolUpsert = Pick<School, "name" | "description" | "status">;

export default function SchoolForm({
  open,
  onOpenChange,
  onSuccess,
  schoolId,
}: Props) {
  const isEdit = typeof schoolId === "number";

  const [form, setForm] = useState<SchoolUpsert>({
    name: "",
    description: "",
    status: true,
  });

  const { data: detail, isFetching } = useGetSchoolByIdQuery(schoolId ?? 0, {
    skip: !isEdit,
  });

  useEffect(() => {
    if (detail && isEdit) {
      setForm({
        name: detail.name,
        description: detail.description,
        status: detail.status,
      });
    } else if (!isEdit) {
      setForm({
        name: "",
        description: "",
        status: true,
      });
    }
  }, [detail, isEdit, open]);

  const [createSchool, { isLoading: creating }] = useCreateSchoolMutation();
  const [updateSchool, { isLoading: updating }] = useUpdateSchoolMutation();

  const update = <K extends keyof SchoolUpsert>(k: K, v: SchoolUpsert[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status,
    };

    if (isEdit && schoolId != null) {
      await updateSchool({ id: schoolId, payload }).unwrap();
    } else {
      await createSchool(payload).unwrap();
    }
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      {/* Custom overlay: visual masking tanpa blokir klik */}
      {open ? (
        <div className="fixed inset-0 z-[999] bg-black/60 pointer-events-none" />
      ) : null}

      {/* Pastikan content di atas overlay */}
      <DialogContent className="sm:max-w-2xl md:max-w-3xl xl:max-w-5xl z-[1000]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Prodi" : "Tambah Prodi"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nama *</Label>
            <Input
              placeholder="Nama prodi"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              disabled={isFetching}
            />
          </div>

          <div className="grid gap-2">
            <Label>Deskripsi</Label>
            <Textarea
              placeholder="Deskripsi singkat (opsional)"
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              disabled={isFetching}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.status}
              onCheckedChange={(v) => update("status", v)}
              disabled={isFetching}
            />
            <Label>Status aktif</Label>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              creating ||
              updating ||
              isFetching
            }
          >
            {creating || updating ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}