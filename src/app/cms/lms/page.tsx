"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useGetLmsQuery, useDeleteLmsMutation } from "@/services/lms.service";
import { Lms } from "@/types/lms";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  Eye,
} from "lucide-react";

import Swal from "sweetalert2";
import LmsForm from "@/components/form-modal/lms-form";
import { SiteHeader } from "@/components/site-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LmsPage() {
  const [page, setPage] = useState(1);
  const [paginate] = useState(10);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Lms | null>(null);

  const { data, isFetching, refetch } = useGetLmsQuery({
    page,
    paginate,
    search,
  });
  const [deleteLms, { isLoading: isDeleting }] = useDeleteLmsMutation();

  const rows = data?.data ?? [];

  // ===== Derive pagination safely dari response =====
  const perPage = data?.per_page ?? paginate;
  const total = data?.total ?? 0;
  const currentPage = data?.current_page ?? page;
  const lastPageSafe =
    data?.last_page ?? (perPage ? Math.max(1, Math.ceil(total / perPage)) : 1);

  const start = total ? (currentPage - 1) * perPage + 1 : 0;
  const end = total ? Math.min(currentPage * perPage, total) : 0;

  const disabledPrev = total === 0 || currentPage <= 1;
  const disabledNext = total === 0 || currentPage >= lastPageSafe;
  // ==================================================

  const onDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus data?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      await deleteLms(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data dihapus.",
      });
      refetch();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak dapat menghapus data.",
      });
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (item: Lms) => {
    setEditing(item);
    setOpenForm(true);
  };

  const onSaved = () => {
    setOpenForm(false);
    setEditing(null);
    refetch();
  };

  const handleInteractOutside: React.ComponentProps<
    typeof DialogContent
  >["onInteractOutside"] = (e) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[cmdk-root]") ||
      target.closest("[data-radix-popover-content]") ||
      target.closest("[role=dialog] [role=listbox]")
    ) {
      e.preventDefault();
    }
  };

  return (
    <>
      <SiteHeader title="Manajemen LMS" />
      <div className="space-y-6 px-4 py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Manajemen LMS</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul"
                  className="pl-8 w-72"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      refetch();
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  setPage(1);
                  refetch();
                }}
              >
                Cari
              </Button>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Sub Mata Pelajaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.cover ? (
                          <img
                            src={
                              typeof item.cover === "string"
                                ? item.cover
                                : URL.createObjectURL(item.cover)
                            }
                            alt={item.title}
                            className="h-10 w-16 rounded object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-16 flex items-center justify-center border rounded text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.slug}
                        </div>
                        {item.sub_title && (
                          <div className="text-xs">{item.sub_title}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.subject_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.subject_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.subject_sub_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.subject_sub_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status ? "default" : "secondary"}>
                          {item.status ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <TooltipProvider>
                          <div className="flex gap-2 justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="icon"
                                  aria-label="Detail"
                                  title="Detail"
                                >
                                  <Link href={`/cms/lms/detail?id=${item.id}`}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Detail</span>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Detail</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  aria-label="Edit"
                                  title="Edit"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  aria-label="Hapus"
                                  title="Hapus"
                                  disabled={isDeleting}
                                  onClick={() => onDelete(item.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Hapus</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Hapus</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && !isFetching && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex w-full items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {total > 0 ? (
                  <>
                    Menampilkan <span className="font-medium">{start}</span>–
                    <span className="font-medium">{end}</span> dari{" "}
                    <span className="font-medium">{total}</span> data • Halaman{" "}
                    {currentPage} / {lastPageSafe}
                  </>
                ) : (
                  <>
                    Tidak ada data • Halaman {currentPage} / {lastPageSafe}
                  </>
                )}
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={disabledPrev}
                      asChild
                    >
                      <PaginationPrevious
                        href="#"
                        aria-disabled={disabledPrev}
                      />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(lastPageSafe, p + 1))
                      }
                      disabled={disabledNext}
                      asChild
                    >
                      <PaginationNext href="#" aria-disabled={disabledNext} />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        {openForm && (
          <div
            aria-hidden
            className="fixed inset-0 z-[48] bg-black/40 pointer-events-none"
          />
        )}

        <Dialog open={openForm} onOpenChange={setOpenForm} modal={false}>
          <DialogContent
            className="sm:max-w-2xl md:max-w-3xl xl:max-w-5xl"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={handleInteractOutside}
          >
            <DialogHeader>
              <DialogTitle>{editing ? "Ubah LMS" : "Tambah LMS"}</DialogTitle>
            </DialogHeader>
            <LmsForm
              initialData={editing ?? undefined}
              onSuccess={onSaved}
              onCancel={() => setOpenForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}