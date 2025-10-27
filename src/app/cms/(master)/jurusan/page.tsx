"use client";

import { useMemo, useState } from "react";
import {
  useDeleteSubjectMutation,
  useGetSubjectListQuery,
} from "@/services/master/mapel.service";
import type { Mapel } from "@/types/master/mapel";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import MapelForm from "@/components/form-modal/master/mata-pelajaran-form";
import { SiteHeader } from "@/components/site-header";

export default function MapelPage() {
  const [page, setPage] = useState<number>(1);
  const [paginate] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<string>(""); // trigger untuk search

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editRow, setEditRow] = useState<Mapel | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetSubjectListQuery({
    page,
    paginate,
    search: query || undefined,
  });

  const [deleteSubject, { isLoading: deleting }] = useDeleteSubjectMutation();

  const rows: Mapel[] = useMemo(() => data?.data ?? [], [data]);
  const totalPage = data?.last_page ?? 1;

  const openCreate = () => {
    setEditRow(null);
    setOpenForm(true);
  };

  const openEdit = (row: Mapel) => {
    setEditRow(row);
    setOpenForm(true);
  };

  const onCloseForm = () => {
    setOpenForm(false);
  };

  const onSaved = () => {
    setOpenForm(false);
    if (!editRow) setPage(1);
    refetch();
  };

  const onConfirmDelete = async (id: number) => {
    await deleteSubject(id).unwrap();
    if (rows.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      refetch();
    }
  };

  return (
    <>
      <SiteHeader title="Manajemen Jurusan" />
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar */}
        <Card>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 w-full md:max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Cari nama / kode…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setQuery(search.trim());
                      setPage(1);
                    }
                  }}
                />
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery(search.trim());
                  setPage(1);
                }}
              >
                Cari
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Jurusan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Daftar Jurusan{" "}
              {isFetching ? (
                <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Kode</th>
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">Deskripsi</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 w-[110px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Memuat data…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={row.id} className="border-b">
                        <td className="py-2 px-3">
                          {(page - 1) * 10 + idx + 1}
                        </td>
                        <td className="py-2 px-3">{row.code ?? "-"}</td>
                        <td className="py-2 px-3 font-medium">{row.name}</td>
                        <td className="py-2 px-3">
                          <span className="line-clamp-2">
                            {row.description ?? "-"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {(
                            typeof row.status === "number"
                              ? row.status === 1
                              : Boolean(row.status)
                          ) ? (
                            <Badge>Aktif</Badge>
                          ) : (
                            <Badge variant="secondary">Nonaktif</Badge>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => openEdit(row)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  title="Hapus"
                                  disabled={deleting}
                                >
                                  {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Hapus Jurusan?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Data
                                    akan terhapus permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onConfirmDelete(row.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Halaman {data?.current_page ?? 0} dari {totalPage} — Total{" "}
                {data?.total ?? 0} data
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                  disabled={page >= totalPage || isFetching}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create / Edit Dialog */}
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          {/* key untuk remount ketika create <-> edit / ganti baris */}
          <DialogContent className="sm:max-w-lg" key={editRow?.id ?? "create"}>
            <DialogHeader>
              <DialogTitle>
                {editRow ? "Edit Jurusan" : "Tambah Jurusan"}
              </DialogTitle>
            </DialogHeader>
            <MapelForm
              mode={editRow ? "edit" : "create"}
              initialData={editRow ?? undefined}
              onSuccess={onSaved}
              onCancel={onCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
