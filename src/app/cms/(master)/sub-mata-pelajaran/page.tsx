"use client";

import { useMemo, useState } from "react";
import {
  useGetSubjectSubListQuery,
  useDeleteSubjectSubMutation,
} from "@/services/master/submapel.service";
import { useGetSubjectListQuery } from "@/services/master/mapel.service";

import type { SubMapel } from "@/types/master/submapel";
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
import SubMapelForm from "@/components/form-modal/master/sub-mata-pelajaran-form";
import { Combobox } from "@/components/ui/combo-box";
import { SiteHeader } from "@/components/site-header";

export default function SubMapelPage() {
  // paging & search utk list sub-mapel
  const [page, setPage] = useState<number>(1);
  const [paginate] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  // filter & preset subject yang dipakai form
  const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);

  // dialog form state
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editRow, setEditRow] = useState<SubMapel | null>(null);

  // load sub-mapel list (with optional subject_id)
  const { data, isLoading, isFetching, refetch } = useGetSubjectSubListQuery({
    page,
    paginate,
    search: query || undefined,
    subject_id: filterSubjectId ?? undefined,
  });

  const rows: SubMapel[] = useMemo(() => data?.data ?? [], [data]);
  const totalPage = data?.last_page ?? 1;

  const [deleteSub, { isLoading: deleting }] = useDeleteSubjectSubMutation();

  // Subject list for toolbar combobox (filter + preset form)
  const [subjectSearch, setSubjectSearch] = useState<string>("");
  const { data: subjectListResp, isFetching: subjectLoading } =
    useGetSubjectListQuery({
      page: 1,
      paginate: 20,
      search: subjectSearch || undefined,
    });
  const subjects: Mapel[] = useMemo(
    () => subjectListResp?.data ?? [],
    [subjectListResp]
  );

  const currentSubject = filterSubjectId
    ? subjects.find((s) => s.id === filterSubjectId) ?? null
    : null;

  const openCreate = () => {
    setEditRow(null);
    setOpenForm(true);
  };

  const openEdit = (row: SubMapel) => {
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
    await deleteSub(id).unwrap();
    if (rows.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      refetch();
    }
  };

  return (
    <>
      <SiteHeader title="Sub Mata Pelajaran" />{" "}
      <div className="space-y-6 px-4 py-6">
        {/* Toolbar: Search + Filter Subject + Add */}
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
              {/* Filter/Preset Subject */}
              <div className="w-full md:w-80">
                <Combobox<Mapel>
                  value={filterSubjectId}
                  onChange={(val) => {
                    setFilterSubjectId(val);
                    setPage(1);
                  }}
                  onSearchChange={setSubjectSearch}
                  data={subjects}
                  isLoading={subjectLoading}
                  placeholder="Pilih Mata Pelajaran (filter & preset form)"
                  getOptionLabel={(item) =>
                    `${item.name}${item.code ? ` — ${item.code}` : ""}`
                  }
                />
              </div>
              <Button onClick={openCreate} disabled={!filterSubjectId}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Sub Mata Pelajaran
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Daftar Sub Mata Pelajaran{" "}
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
                    <th className="py-2 px-3">Mata Pelajaran</th>
                    <th className="py-2 px-3">Kode</th>
                    <th className="py-2 px-3">Sub Mata Pelajaran</th>
                    <th className="py-2 px-3">Deskripsi</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 w-[110px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Memuat data…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => {
                      const subjectName =
                        subjects.find((s) => s.id === row.subject_id)?.name ??
                        `#${row.subject_id}`;
                      return (
                        <tr key={row.id} className="border-b">
                          <td className="py-2 px-3">
                            {(page - 1) * 10 + idx + 1}
                          </td>
                          <td className="py-2 px-3">{subjectName}</td>
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
                                      Hapus Sub Mapel?
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
                      );
                    })
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
          <DialogContent className="sm:max-w-lg" key={editRow?.id ?? "create"}>
            <DialogHeader>
              <DialogTitle>
                {editRow ? "Edit Sub Mapel" : "Tambah Sub Mapel"}
              </DialogTitle>
            </DialogHeader>

            <SubMapelForm
              mode={editRow ? "edit" : "create"}
              initialData={editRow ?? undefined}
              onSuccess={onSaved}
              onCancel={onCloseForm}
              subjectPresetId={filterSubjectId}
              subjectPresetName={currentSubject?.name ?? null}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
