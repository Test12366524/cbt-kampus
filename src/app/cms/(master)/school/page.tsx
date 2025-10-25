"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  useGetSchoolListQuery,
  useDeleteSchoolMutation,
} from "@/services/master/school.service";
import type { School } from "@/types/master/school";
import { displayDate } from "@/lib/format-utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import SchoolForm from "@/components/form-modal/master/school-form";
import { SiteHeader } from "@/components/site-header";
import Swal from "sweetalert2";

export default function SchoolPage() {
  const [page, setPage] = useState(1);
  const [paginate, setPaginate] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<School | null>(null);

  // debounce
  useMemo(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isFetching, refetch } = useGetSchoolListQuery(
    { page, paginate, search },
    { refetchOnMountOrArgChange: true }
  );
  const [remove, { isLoading: deleting }] = useDeleteSchoolMutation();

  const rows: School[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;

  const start = rows.length ? (currentPage - 1) * paginate + 1 : 0;
  const end = rows.length ? (currentPage - 1) * paginate + rows.length : 0;

  const onCreate = () => {
    setEditId(null);
    setOpenForm(true);
  };

  const onEdit = (id: number) => {
    setEditId(id);
    setOpenForm(true);
  };

  // ✅ Helper alert sukses
  const alertSuccess = (title: string, text?: string) => {
    void Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title,
      text,
      timer: 1600,
      timerProgressBar: true,
      showConfirmButton: false,
      backdrop: false,
      allowOutsideClick: true,
      allowEscapeKey: true,
      showCloseButton: false,
    });
  };

  // ✅ Tampilkan SweetAlert sukses: bedakan create vs update pakai editId saat form dibuka
  const onSaved = () => {
    const wasEdit = editId !== null;
    setOpenForm(false);
    setEditId(null);
    refetch();
    alertSuccess(
      wasEdit ? "Berhasil Diperbarui" : "Berhasil Dibuat",
      wasEdit
        ? "Data sekolah berhasil diperbarui."
        : "Data sekolah berhasil ditambahkan."
    );
  };

  // ✅ Hapus + SweetAlert sukses (dengan penanganan error yang aman)
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      const name = pendingDelete.name;
      await remove(pendingDelete.id).unwrap();
      setPendingDelete(null);
      refetch();
      alertSuccess("Berhasil Dihapus", `Sekolah "${name}" telah dihapus.`);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Terjadi kesalahan saat menghapus.";
      void Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: message,
      });
    }
  };

  return (
    <>
      <SiteHeader title="Sekolah" />
      <main className="space-y-6 px-4 py-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-3 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-semibold tracking-tight">
                Sekolah
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
              <Button onClick={onCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Cari nama/desk…"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="sm:ml-auto">
                <Select
                  value={String(paginate)}
                  onValueChange={(v) => {
                    setPaginate(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Per halaman" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} / halaman
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="overflow-x-auto">
                <Table className="min-w-[920px]">
                  <TableHeader className="sticky top-0 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                    <TableRow>
                      <TableHead className="w-[240px]">Nama</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="w-[260px]">Wilayah</TableHead>{" "}
                      <TableHead className="w-[140px]">Status</TableHead>
                      <TableHead className="w-[160px]">Dibuat</TableHead>
                      <TableHead className="text-right w-[120px]">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {/* Skeleton */}
                    {isFetching && rows.length === 0 && (
                      <>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} className="hover:bg-transparent">
                            <TableCell>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-52" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-24 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}

                    {/* Empty */}
                    {!isFetching && rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-28 text-center">
                          <p className="text-sm text-muted-foreground">
                            Tidak ada data.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Rows */}
                    {rows.map((s, idx) => (
                      <TableRow
                        key={s.id}
                        className={idx % 2 === 1 ? "bg-muted/20" : undefined}
                      >
                        <TableCell>
                          <div className="font-medium leading-none">
                            {s.name}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div
                            className="line-clamp-2 text-sm text-muted-foreground"
                            title={s.description ?? ""}
                          >
                            {s.description ?? "-"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {s.province_name ?? "-"}
                            </div>
                            <div className="text-muted-foreground">
                              {s.regency_name ?? "-"}
                              {s.district_name ? ` / ${s.district_name}` : ""}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {s.status ? (
                            <Badge className="gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <XCircle className="h-3.5 w-3.5" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>{displayDate(s.created_at)}</TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="inline-flex gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => onEdit(s.id)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => setPendingDelete(s)}
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={() => onEdit(s.id)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPendingDelete(s)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer / pagination */}
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="text-xs text-muted-foreground">
                  Menampilkan <span className="font-medium">{start || 0}</span>–
                  <span className="font-medium">{end || 0}</span> dari{" "}
                  <span className="font-medium">{total}</span> data
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <div className="rounded-md border px-3 py-1 text-sm">
                    {currentPage} / {lastPage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= lastPage}
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Create/Edit */}
        <SchoolForm
          open={openForm}
          onOpenChange={(v) => {
            setOpenForm(v);
            if (!v) setEditId(null);
          }}
          onSuccess={onSaved}
          schoolId={editId ?? undefined}
        />

        {/* Confirm Delete */}
        <AlertDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Sekolah?</AlertDialogTitle>
              <AlertDialogDescription>
                Aksi ini tidak bisa dibatalkan. Item:
                <span className="font-semibold"> {pendingDelete?.name}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}