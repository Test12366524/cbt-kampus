"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import {
  useCreateRoleMutation,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
} from "@/services/users.service";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  guard_name: string;
};

export default function RolesForm({
  open,
  mode,
  id,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetRoleByIdQuery(id ?? 0, {
    skip: !isEdit || !id,
  });

  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

  const initial: FormState = useMemo(
    () => ({
      name: (detail?.name as string) ?? "",
      guard_name: (detail?.guard_name as string) ?? "web",
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);
  useEffect(() => setForm(initial), [initial]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      await Swal.fire({ icon: "warning", title: "Nama role wajib diisi" });
      return;
    }
    if (!form.guard_name.trim()) {
      await Swal.fire({ icon: "warning", title: "Guard name wajib diisi" });
      return;
    }

    try {
      if (isEdit && id) {
        await updateRole({
          id,
          payload: { name: form.name, guard_name: form.guard_name },
        }).unwrap();
        await Swal.fire({ icon: "success", title: "Role diperbarui" });
      } else {
        await createRole({
          name: form.name,
          guard_name: form.guard_name,
        }).unwrap();
        await Swal.fire({ icon: "success", title: "Role dibuat" });
      }
      onSuccess();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: isEdit ? "Gagal memperbarui role" : "Gagal membuat role",
        text: e instanceof Error ? e.message : "Terjadi kesalahan.",
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Role" : "Tambah Role"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama Role</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="mis. admin, editor, student"
            />
          </div>
          <div>
            <Label>Guard Name</Label>
            <Input
              value={form.guard_name}
              onChange={(e) => set("guard_name", e.target.value)}
              placeholder="mis. web atau api"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-sky-600 hover:bg-sky-700"
              disabled={creating || updating || (isEdit && isFetching)}
            >
              {isEdit ? "Simpan Perubahan" : "Buat Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}