"use client";

import type React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  useGetLmsDetailsQuery,
  useDeleteLmsDetailMutation,
} from "@/services/lms-detail.service";
import { useGetLmsByIdQuery } from "@/services/lms.service";
import type { LmsDetail } from "@/types/lms-detail";

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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Link2,
  FileVideo2,
  FileAudio2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import Swal from "sweetalert2";
import { SiteHeader } from "@/components/site-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import LmsDetailForm from "@/components/form-modal/lms-detail-form";
import { displayDate } from "@/lib/format-utils";

export default function LmsDetailPage() {
  const params = useSearchParams();
  const lmsId = Number(params.get("id") ?? "0");

  const [page, setPage] = useState(1);
  const [paginate] = useState(10);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<LmsDetail | null>(null);

  // ⬇️ Ambil metadata LMS untuk header (title, subtitle, subject & sub subject)
  const { data: lmsinfo, isFetching: loadingLmsInfo } = useGetLmsByIdQuery(
    lmsId,
    { skip: !lmsId }
  );

  // ⬇️ List detail by lms_id
  const { data, isFetching, refetch } = useGetLmsDetailsQuery(
    { page, paginate, search, lms_id: lmsId },
    { skip: !lmsId }
  );
  const [removeDetail, { isLoading: isDeleting }] =
    useDeleteLmsDetailMutation();

  const rows = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;

  const paging = useMemo(
    () => ({ canPrev: page > 1, canNext: page < lastPage }),
    [page, lastPage]
  );

  const onDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Hapus item?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      await removeDetail(id).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Item dihapus.",
      });
      refetch();
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Tidak dapat menghapus item.",
      });
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (item: LmsDetail) => {
    setEditing(item);
    setOpenForm(true);
  };

  const onSaved = () => {
    setOpenForm(false);
    setEditing(null);
    refetch();
  };

  // izinkan interaksi tooltip/popover di dalam dialog non-modal
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

  const TypeIcon: Record<LmsDetail["type"], React.ReactNode> = {
    video: <FileVideo2 className="h-3.5 w-3.5" />,
    audio: <FileAudio2 className="h-3.5 w-3.5" />,
    pdf: <FileText className="h-3.5 w-3.5" />,
    image: <ImageIcon className="h-3.5 w-3.5" />,
    external_link: <Link2 className="h-3.5 w-3.5" />,
  };

  return (
    <>
      <SiteHeader title="Detail Konten LMS" />
      <div className="space-y-6 px-4 py-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              {/* ⬇️ Title & sub title dari LMS yang dipilih */}
              <CardTitle className="text-xl font-semibold tracking-tight">
                {loadingLmsInfo
                  ? "Memuat…"
                  : lmsinfo?.title ?? (lmsId ? `LMS #${lmsId}` : "Konten LMS")}
              </CardTitle>
              {lmsinfo?.sub_title && (
                <p className="text-sm text-muted-foreground">
                  {lmsinfo.sub_title}
                </p>
              )}

              {/* ⬇️ Badges untuk subject & sub subject */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {lmsinfo?.subject_name && (
                  <Badge className="gap-1" variant="secondary">
                    <span className="text-xs">
                      {lmsinfo.subject_code ?? "-"}
                    </span>
                    <span className="mx-1">•</span>
                    <span className="text-xs font-medium">
                      {lmsinfo.subject_name}
                    </span>
                  </Badge>
                )}
                {lmsinfo?.subject_sub_name && (
                  <Badge className="gap-1" variant="outline">
                    <span className="text-xs">
                      {lmsinfo.subject_sub_code ?? "-"}
                    </span>
                    <span className="mx-1">•</span>
                    <span className="text-xs font-medium">
                      {lmsinfo.subject_sub_name}
                    </span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/cms/lms">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
              <Button
                onClick={handleCreate}
                className="gap-2"
                disabled={!lmsId}
              >
                <Plus className="h-4 w-4" /> Tambah
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
                  placeholder="Cari judul / slug…"
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
                variant="outline"
                onClick={() => {
                  setPage(1);
                  refetch();
                }}
              >
                Cari
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="overflow-x-auto">
                <Table className="min-w-[920px]">
                  <TableHeader className="sticky top-0 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                    <TableRow>
                      <TableHead className="w-[320px]">Judul</TableHead>
                      <TableHead className="w-[140px]">Tipe</TableHead>
                      <TableHead className="w-[140px]">Status</TableHead>
                      <TableHead className="w-[200px]">Dibuat</TableHead>
                      <TableHead className="text-right w-[140px]">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rows.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className="font-medium leading-tight">
                            {d.title}
                          </div>
                          {d.sub_title && (
                            <div className="text-xs text-muted-foreground">
                              {d.sub_title}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {d.slug}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="inline-flex items-center gap-1 text-sm">
                            {TypeIcon[d.type]}
                            <span className="capitalize">
                              {d.type.replace("_", " ")}
                            </span>
                          </div>
                          {d.type === "external_link" && d.link && (
                            <div className="mt-1 truncate text-xs text-muted-foreground">
                              {d.link}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          {d.status ? (
                            <Badge className="gap-1">Aktif</Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              Nonaktif
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {displayDate(d.created_at)}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <TooltipProvider>
                            <div className="inline-flex gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    title="Edit"
                                    onClick={() => handleEdit(d)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    title="Hapus"
                                    onClick={() => onDelete(d.id)}
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-4 w-4" />
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
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Tidak ada data.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Footer / pagination */}
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="text-xs text-muted-foreground">
                  Halaman {data?.current_page ?? 1} / {lastPage} — Total{" "}
                  {data?.total ?? 0} item
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!paging.canPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    asChild
                  >
                    <PaginationPrevious href="#" />
                  </Button>
                  <div className="rounded-md border px-3 py-1 text-sm">
                    {data?.current_page ?? 1} / {lastPage}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!paging.canNext}
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    asChild
                  >
                    <PaginationNext href="#" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overlay visual non-blocking */}
        {openForm && (
          <div
            aria-hidden
            className="fixed inset-0 z-[48] bg-black/40 pointer-events-none"
          />
        )}

        {/* Dialog Create/Update (non-modal) */}
        <Dialog open={openForm} onOpenChange={setOpenForm} modal={false}>
          <DialogContent
            className="sm:max-w-2xl md:max-w-3xl xl:max-w-5xl"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={handleInteractOutside}
          >
            <DialogHeader>
              <DialogTitle>{editing ? "Ubah Detail" : "Tambah Detail"}</DialogTitle>
            </DialogHeader>
            <LmsDetailForm
              lmsId={lmsId}
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