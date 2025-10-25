"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Kecamatan } from "@/types/master/kecamatan";
import {
  useGetKotaListQuery,
} from "@/services/master/kota.service";
import { Loader2 } from "lucide-react";

// --- MOCK IMPLEMENTATION ---
// This mock simulates the API call since the original path could not be resolved.
// Replace this with your actual `useGetKotaListQuery` import when the path is corrected.

// --- END MOCK IMPLEMENTATION ---


// Definisikan tipe props yang lebih spesifik untuk form ini
interface KecamatanFormProps {
  form: Partial<Kecamatan>;
  setForm: (data: Partial<Kecamatan>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  readonly?: boolean;
  isLoading?: boolean;
}

export default function KecamatanForm({
  form,
  setForm,
  onCancel,
  onSubmit,
  readonly = false,
  isLoading = false,
}: KecamatanFormProps) {
  const [mounted, setMounted] = useState(false);
 
  const [kotaSearch, setKotaSearch] = useState("");
  const { data: kotaData, isLoading: isKotaLoading } = useGetKotaListQuery({
    page: 1,
    paginate: 100,
    search: kotaSearch,
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Cari dan set nama kota awal jika form dalam mode edit/readonly
    if (form.regency_id && kotaData?.data) {
      const selectedKota = kotaData.data.find(p => p.id === form.regency_id);
      if (selectedKota) {
        setKotaSearch(selectedKota.name);
      }
    }
  }, [form.regency_id, kotaData]);
  
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


  const filteredKota = useMemo(() => {
    if (!kotaData?.data || kotaSearch.length < 2) {
      return [];
    }
    return kotaData.data.filter((kota) =>
      kota.name.toLowerCase().includes(kotaSearch.toLowerCase())
    );
  }, [kotaSearch, kotaData]);
  
  const handleKotaSelect = (kota: { id: string; name: string }) => {
    setForm({ ...form, regency_id: kota.id });
    setKotaSearch(kota.name);
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
          {readonly ? "Detail Kecamatan" : form.id ? "Edit Kecamatan" : "Tambah Kecamatan"}
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

          {/* Kota Searchable Dropdown */}
          <div className="flex flex-col gap-y-1.5" ref={dropdownRef}>
            <Label htmlFor="regency_id">Kota</Label>
            <div className="relative">
              <Input
                id="regency_id"
                placeholder="Ketik min 2 huruf untuk mencari kota..."
                value={kotaSearch}
                onChange={(e) => {
                  setKotaSearch(e.target.value);
                  setDropdownOpen(true);
                   // Hapus regency_id jika input diubah
                  if (form.regency_id) {
                    setForm({ ...form, regency_id: undefined });
                  }
                }}
                onFocus={() => setDropdownOpen(true)}
                readOnly={readonly}
                required
                autoComplete="off"
              />
              {isDropdownOpen && !readonly && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {isKotaLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : kotaSearch.length < 2 ? (
                     <p className="text-sm text-gray-500 p-3">Ketik minimal 2 huruf...</p>
                  ) : filteredKota.length > 0 ? (
                    filteredKota.map((kota) => (
                      <button
                        type="button"
                        key={kota.id}
                        onClick={() => handleKotaSelect(kota)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      >
                        {kota.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 p-3">Kota tidak ditemukan.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Nama Kecamatan */}
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="name">Nama Kecamatan</Label>
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
          <Button onClick={onSubmit} disabled={isLoading || !form.regency_id}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      )}
    </div>
  );
}
