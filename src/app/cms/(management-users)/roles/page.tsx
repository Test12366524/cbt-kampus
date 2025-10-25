"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Shield } from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
} from "@/services/users.service";
import type { Role } from "@/types/user";
import RolesForm from "@/components/form-modal/roles-form";

const PER_PAGE = 10;

function formatDate(s?: string | null) {
  if (!s) return "-";
  return new Date(s).toLocaleString("id-ID");
}

export default function RolesPage() {
  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(PER_PAGE);
  const [q, setQ] = useState<string>("");

  const { data, isFetching, refetch } = useGetRolesQuery({
    page,
    paginate,
    search: q,
  });

  // hasil getRoles diasumsikan: { data: Role[]; last_page; total; ... }
  const items: Role[] = useMemo(() => data?.data ?? [], [data]);
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // dialog
  const [openForm, setOpenForm] = useState<{
    mode: "create" | "edit";
    id?: number;
  } | null>(null);

  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  // debounce saat search / paginate
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 250);
    return () => clearTimeout(t);
  }, [q, paginate]);

  async function handleDelete(id: number) {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Hapus role?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0ea5e9",
    });
    if (!ask.isConfirmed) return;

    try {
      await deleteRole(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Role dihapus.",
      });
      void refetch();
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal menghapus",
        text: e instanceof Error ? e.message : "Terjadi kesalahan.",
      });
    }
  }

  return (
    <>
      <SiteHeader title="Manajemen Role" />
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" />
              <Input
                placeholder="Cari nama role…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl pl-9"
              />
            </div>
            <select
              className="h-9 rounded-xl border bg-background px-2"
              value={paginate}
              onChange={(e) => setPaginate(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setQ("");
                setPage(1);
                void refetch();
              }}
            >
              Reset
            </Button>
          </div>

          <Button
            variant="default"
            onClick={() => setOpenForm({ mode: "create" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Role
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left font-semibold">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Guard</th>
                  <th className="px-4 py-3">Dibuat</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFetching && !items.length ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-zinc-500"
                      colSpan={4}
                    >
                      Memuat data…
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((r) => (
                    <tr key={r.id} className="align-top hover:bg-zinc-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 opacity-70" />
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{r.guard_name}</td>
                      <td className="px-4 py-3">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setOpenForm({ mode: "edit", id: r.id })
                            }
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(r.id)}
                            disabled={deleting}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-zinc-500"
                      colSpan={4}
                    >
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-zinc-600">
            <div>
              {" "}
              Total {total} data • Halaman {page} dari {lastPage}{" "}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>

        {/* Create / Edit */}
        {openForm && (
          <RolesForm
            open
            mode={openForm.mode}
            id={openForm.id}
            onClose={() => setOpenForm(null)}
            onSuccess={() => {
              setOpenForm(null);
              void refetch();
            }}
          />
        )}
      </div>
    </>
  );
}
