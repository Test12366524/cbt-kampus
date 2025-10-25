"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Kota } from "@/types/master/kota";
import {
  useGetProvinsiListQuery,
} from "@/services/master/provinsi.service";
import { Loader2 } from "lucide-react";

// --- MOCK IMPLEMENTATION ---
// This mock simulates the API call since the original path could not be resolved.
// Replace this with your actual `useGetProvinsiListQuery` import when the path is corrected.

// --- END MOCK IMPLEMENTATION ---


// Definisikan tipe props yang lebih spesifik untuk form ini
interface KotaFormProps {
  form: Partial<Kota>;
  setForm: (data: Partial<Kota>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function KotaForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: KotaFormProps) {
  const [mounted, setMounted] = useState(false);
 
  const [provinsiSearch, setProvinsiSearch] = useState("");
  const { data: provinsiData, isLoading: isProvinsiLoading } = useGetProvinsiListQuery({
    page: 1,
    paginate: 100,
    search: provinsiSearch,
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Cari dan set nama provinsi awal jika form dalam mode edit/readonly
    if (form.province_id && provinsiData?.data) {
      const selectedProvinsi = provinsiData.data.find(p => p.id === form.province_id);
      if (selectedProvinsi) {
        setProvinsiSearch(selectedProvinsi.name);
      }
    }
  }, [form.province_id, provinsiData]);
  
  // Menutup dropdown saat klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const filteredProvinsi = useMemo(() => {
    if (!provinsiData?.data || provinsiSearch.length < 2) {
      return [];
    }
    return provinsiData.data.filter((provinsi) =>
      provinsi.name.toLowerCase().includes(provinsiSearch.toLowerCase())
    );
  }, [provinsiSearch, provinsiData]);
  
  const handleProvinsiSelect = (provinsi: { id: string; name: string }) => {
    setForm({ ...form, province_id: provinsi.id });
    setProvinsiSearch(provinsi.name);
    setDropdownOpen(false);
  };

  if (!mounted) {
    // Skeleton loading
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Loading...</h2>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl min-h-[400px] max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {readonly ? "Detail Kota" : form.id ? "Edit Kota" : "Tambah Kota"}
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
        <div className="grid grid-cols-1 gap-4">
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

          {/* Provinsi Searchable Dropdown */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownRef}>
            <Label htmlFor="province_id">Provinsi</Label>
            <div className="relative">
              <Input
                id="province_id"
                placeholder="Ketik min 2 huruf untuk mencari provinsi..."
                value={provinsiSearch}
                onChange={(e) => {
                  setProvinsiSearch(e.target.value);
                  setDropdownOpen(true);
                   // Hapus province_id jika input diubah
                  if (form.province_id) {
                    setForm({ ...form, province_id: undefined });
                  }
                }}
                onFocus={() => setDropdownOpen(true)}
                readOnly={readonly}
                required
                autoComplete="off"
              />
              {isDropdownOpen && !readonly && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isProvinsiLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : provinsiSearch.length < 2 ? (
                     <p className="text-sm text-gray-500 p-3">Ketik minimal 2 huruf...</p>
                  ) : filteredProvinsi.length > 0 ? (
                    filteredProvinsi.map((provinsi) => (
                      <button
                        type="button"
                        key={provinsi.id}
                        onClick={() => handleProvinsiSelect(provinsi)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {provinsi.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">Provinsi tidak ditemukan.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nama Kota */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="name">Nama Kota</Label>
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
          <Button onClick={onSubmit} disabled={isLoading || !form.province_id}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}
