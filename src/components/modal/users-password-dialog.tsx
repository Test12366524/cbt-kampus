"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { X } from "lucide-react";
import { useUpdateUserPasswordMutation } from "@/services/users-management.service";

type Props = {
  open: boolean;
  id: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PasswordDialog({
  open,
  id,
  onClose,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [updatePass, { isLoading }] = useUpdateUserPasswordMutation();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      await Swal.fire({ icon: "warning", title: "Password wajib diisi" });
      return;
    }
    if (password !== confirm) {
      await Swal.fire({
        icon: "warning",
        title: "Konfirmasi password tidak sama",
      });
      return;
    }
    try {
      await updatePass({
        id,
        payload: { password, password_confirmation: confirm },
      }).unwrap();
      await Swal.fire({ icon: "success", title: "Password diperbarui" });
      onSuccess();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal memperbarui password",
        text: e instanceof Error ? e.message : "Terjadi kesalahan.",
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ubah Password</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Password Baru</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Konfirmasi Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-sky-600 hover:bg-sky-700"
              disabled={isLoading}
            >
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}