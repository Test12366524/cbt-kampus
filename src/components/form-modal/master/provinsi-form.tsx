"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Provinsi } from "@/types/master/provinsi";

// Definisikan tipe props yang lebih spesifik untuk form ini
interface ProvinsiFormProps {
  form: Partial<Provinsi>;
  setForm: (data: Partial<Provinsi>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function ProvinsiForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: ProvinsiFormProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Tampilkan skeleton loading jika komponen belum di-mount di client
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Loading...</h2>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
            <div className="h-24 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {readonly
            ? "Detail Provinsi"
            : form.id
            ? "Edit Provinsi"
            : "Tambah Provinsi"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          ✕
        </Button>
      </div>

      {/* Content */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex-1 overflow-y-auto p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          {/* ID */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={form.id ?? ""}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              readOnly={readonly}
              required
            />
          </div>

          {/* Nama */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              readOnly={readonly}
              required
            />
          </div>

        </div>
      </form>

      {/* Footer */}
      {!readonly && (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}
