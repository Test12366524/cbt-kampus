"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/services/users-management.service";
import Swal from "sweetalert2";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  id?: number;
  defaultRoleId?: number; // e.g. 2 (student)
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  status: boolean;
};

export default function UsersForm({
  open,
  mode,
  id,
  defaultRoleId = 2,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const { data: detail, isFetching } = useGetUserByIdQuery(id ?? 0, {
    skip: !isEdit || !id,
  });

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const initial: FormState = useMemo(
    () => ({
      name: detail?.name ?? "",
      email: detail?.email ?? "",
      phone: detail?.phone ?? "",
      password: "",
      password_confirmation: "",
      status: true,
    }),
    [detail]
  );

  const [form, setForm] = useState<FormState>(initial);
  // ⬇️ perbaikan dependency
  useEffect(() => setForm(initial), [initial]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      await Swal.fire({ icon: "warning", title: "Nama wajib diisi" });
      return;
    }
    if (!form.email.trim()) {
      await Swal.fire({ icon: "warning", title: "Email wajib diisi" });
      return;
    }
    if (!isEdit && !form.password) {
      await Swal.fire({ icon: "warning", title: "Password wajib diisi" });
      return;
    }
    if (!isEdit && form.password !== form.password_confirmation) {
      await Swal.fire({
        icon: "warning",
        title: "Konfirmasi password tidak sama",
      });
      return;
    }

    try {
      if (isEdit && id) {
        await updateUser({
          id,
          payload: {
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            status: form.status ? 1 : 0, // opsional, sesuai backend
          },
        }).unwrap();
        await Swal.fire({ icon: "success", title: "User diperbarui" });
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          phone: form.phone || "",
          role_id: defaultRoleId,
          status: form.status ? 1 : 0, // opsional
          password: form.password,
          password_confirmation: form.password_confirmation,
        }).unwrap();
        await Swal.fire({ icon: "success", title: "User dibuat" });
      }
      onSuccess();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: isEdit ? "Gagal memperbarui" : "Gagal membuat",
        text: e instanceof Error ? e.message : "Terjadi kesalahan.",
      });
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit User" : "Tambah User"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nama</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@domain.com"
              />
            </div>
            <div>
              <Label>Nomor HP</Label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="08xxxx"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                />
              </div>
              <div>
                <Label>Konfirmasi Password</Label>
                <Input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => set("password_confirmation", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="status"
              type="checkbox"
              checked={form.status}
              onChange={(e) => set("status", e.target.checked)}
            />
            <Label htmlFor="status">Aktif</Label>
          </div>

          <div className="rounded-xl border bg-sky-50 px-3 py-2 text-sm text-sky-800">
            Role akan diset ke <b>role_id={defaultRoleId}</b> (Student/User).
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
              {isEdit ? "Simpan Perubahan" : "Buat User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}