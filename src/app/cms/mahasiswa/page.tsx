"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  CalendarRange,
  Pencil,
  Trash2,
  Plus,
  GraduationCap,
  BookOpen,
  Upload,
  FileDown,
} from "lucide-react";

import {
  useGetStudentListQuery,
  useDeleteStudentMutation,
  useGetStudentImportTemplateQuery,
  useImportStudentsMutation,
  useExportStudentsMutation,
} from "@/services/admin/student.service";
import type { StudentRead } from "@/services/admin/student.service";

import { useGetSchoolListQuery } from "@/services/master/school.service";
import { useGetClassListQuery } from "@/services/master/class.service";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { SiteHeader } from "@/components/site-header";
import { Combobox } from "@/components/ui/combo-box";

import StudentForm from "@/components/form-modal/master/student-form";

const ROLE_STUDENT_ID = 3;

type StatusFilter = "all" | "active" | "inactive";
type SchoolItem = { id: number | string; name?: string; school_name?: string };
type ClassItem = { id: number | string; name?: string; class_name?: string };

/* -------------------------- Helpers aman untuk TS -------------------------- */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return undefined;
}

/** Overloads supaya return type selalu tepat (tanpa `never`) */
function read(obj: unknown, key: string, as: "string"): string | undefined;
function read(obj: unknown, key: string, as: "number"): number | undefined;
function read(
  obj: unknown,
  key: string,
  as: "object"
): Record<string, unknown> | undefined;
function read(
  obj: unknown,
  key: string,
  as: "string" | "number" | "object"
): string | number | Record<string, unknown> | undefined {
  if (!isRecord(obj) || !(key in obj)) return undefined;
  const v = (obj as Record<string, unknown>)[key];

  if (as === "string") {
    return typeof v === "string" ? v : undefined;
  }
  if (as === "number") {
    return toNumber(v);
  }
  // as === "object"
  return isRecord(v) ? v : undefined;
}

/** Ekstrak info error/sukses dari berbagai bentuk error RTKQ / fetchBaseQuery */
function extractPayload(err: unknown): {
  code?: number;
  message?: string;
  data?: unknown;
} {
  const root = isRecord(err) ? err : undefined;
  const dataObj = read(root, "data", "object") ?? root;

  const code =
    read(dataObj, "code", "number") ??
    read(root, "status", "number") ??
    read(root, "originalStatus", "number");

  const message =
    read(dataObj, "message", "string") ??
    read(root, "message", "string") ??
    read(dataObj, "error", "string");

  const innerData = ((): unknown => {
    if (!dataObj) return undefined;
    if ("data" in (dataObj as Record<string, unknown>)) {
      return (dataObj as Record<string, unknown>).data;
    }
    return undefined;
  })();

  return { code, message, data: innerData };
}

/* ------------------------------ Komponen ------------------------------- */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "U";
}

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const paginate = 10;

  // Filters
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Optional date range (untuk export)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Remote search for combobox
  const [schoolSearch, setSchoolSearch] = useState<string>("");
  const [classSearch, setClassSearch] = useState<string>("");

  // File input for Import
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ===== List Prodi & Kelas =====
  const { data: schoolListResp, isFetching: loadingSchools } =
    useGetSchoolListQuery({ page: 1, paginate: 100, search: schoolSearch });
  const { data: classListResp, isFetching: loadingClasses } =
    useGetClassListQuery({ page: 1, paginate: 100, search: classSearch });

  const schoolOptions: Array<{ id: number; label: string }> = useMemo(() => {
    const raw = ((
      schoolListResp as unknown as { data?: { data?: SchoolItem[] } }
    )?.data?.data ??
      (schoolListResp as unknown as { data?: SchoolItem[] })?.data ??
      []) as SchoolItem[];
    return raw.map((s) => ({
      id: Number(s.id),
      label: String(s.name ?? s.school_name ?? `ID: ${s.id}`),
    }));
  }, [schoolListResp]);

  const classOptions: Array<{ id: number; label: string }> = useMemo(() => {
    const raw = ((classListResp as unknown as { data?: { data?: ClassItem[] } })
      ?.data?.data ??
      (classListResp as unknown as { data?: ClassItem[] })?.data ??
      []) as ClassItem[];
    return raw.map((c) => ({
      id: Number(c.id),
      label: String(c.name ?? c.class_name ?? `ID: ${c.id}`),
    }));
  }, [classListResp]);

  // ===== Server query (satu searchBySpecific) =====
  const searchBySpecific: "class_id" | "school_id" | "status" | undefined =
    classId != null
      ? "class_id"
      : schoolId != null
      ? "school_id"
      : statusFilter !== "all"
      ? "status"
      : undefined;

  const serverSearch =
    searchBySpecific === "class_id"
      ? String(classId)
      : searchBySpecific === "school_id"
      ? String(schoolId)
      : searchBySpecific === "status"
      ? statusFilter === "active"
        ? "1"
        : "0"
      : search;

  const { data, isFetching, refetch } = useGetStudentListQuery(
    {
      page,
      paginate,
      search: serverSearch,
      role_id: ROLE_STUDENT_ID,
      searchBySpecific,
    },
    { refetchOnMountOrArgChange: true }
  );

  const serverRows: StudentRead[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.current_page ?? 1;
  const lastPage = data?.last_page ?? 1;

  // ===== Client-side narrowing =====
  const rows = useMemo(() => {
    let out = [...serverRows];

    if (schoolId != null && searchBySpecific !== "school_id") {
      out = out.filter(
        (r) =>
          Number((r as unknown as { school_id?: number }).school_id) ===
          Number(schoolId)
      );
    }
    if (classId != null && searchBySpecific !== "class_id") {
      out = out.filter(
        (r) =>
          Number((r as unknown as { class_id?: number }).class_id) ===
          Number(classId)
      );
    }
    if (statusFilter !== "all" && searchBySpecific !== "status") {
      const wantActive = statusFilter === "active";
      out = out.filter((r) => Boolean(r.status) === wantActive);
    }

    const text = searchInput.trim().toLowerCase();
    if (text) {
      out = out.filter((r) => {
        const hay = [
          r.name,
          r.email,
          r.phone ? String(r.phone) : "",
          (r as unknown as { school_name?: string }).school_name ?? "",
          (r as unknown as { class_name?: string }).class_name ?? "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(text);
      });
    }
    return out;
  }, [
    serverRows,
    schoolId,
    classId,
    statusFilter,
    searchBySpecific,
    searchInput,
  ]);

  const start = rows.length ? (currentPage - 1) * paginate + 1 : 0;
  const end = rows.length ? (currentPage - 1) * paginate + rows.length : 0;

  const [remove, { isLoading: deleting }] = useDeleteStudentMutation();

  // ==== Hooks Import / Export / Template ====
  const { data: templateUrl } = useGetStudentImportTemplateQuery();
  const [importStudents, { isLoading: importing }] =
    useImportStudentsMutation();
  const [exportStudents, { isLoading: exporting }] =
    useExportStudentsMutation();

  /* ------------------------------ Alerts ------------------------------ */

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
    });
  };

  const alertError = (title: string, text?: string) => {
    void Swal.fire({
      icon: "error",
      title,
      text,
    });
  };

  const showImportSuccess = (
    payload: { code?: number | string; message?: string; data?: unknown },
    fileName?: string
  ) => {
    const title = payload?.message || "Success";
    const desc =
      typeof payload?.data === "string"
        ? payload.data
        : fileName
        ? `File: ${fileName}`
        : undefined;
    alertSuccess(title, desc);
  };

  /* ------------------------------ Actions ----------------------------- */

  const resetFilters = () => {
    setSchoolId(null);
    setClassId(null);
    setStatusFilter("all");
    setSchoolSearch("");
    setClassSearch("");
    setSearchInput("");
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
    void refetch();
  };

  const triggerImport = () => importInputRef.current?.click();

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const clear = () => {
      e.currentTarget.value = "";
    };

    try {
      // Skenario normal: unwrap resolve → sukses
      const resp = await importStudents({ file }).unwrap();
      showImportSuccess(resp, file.name);
      void refetch();
    } catch (err: unknown) {
      // Jika wrapper salah menandai error, cek payload:
      const { code, message, data: inner } = extractPayload(err);

      if (code === 200) {
        // Perlakukan sebagai sukses
        showImportSuccess(
          { code, message: message ?? "Success", data: inner },
          file.name
        );
        void refetch();
      } else {
        const fallback = message ?? "Gagal mengimport data.";
        alertError("Import gagal", fallback);
      }
    } finally {
      clear();
    }
  };

  const handleExport = async () => {
    try {
      const payload: {
        from_date?: string;
        to_date?: string;
        school_id?: number;
        class_id?: number;
      } = {};
      if (fromDate) payload.from_date = fromDate;
      if (toDate) payload.to_date = toDate;
      if (typeof schoolId === "number") payload.school_id = schoolId;
      if (typeof classId === "number") payload.class_id = classId;

      const resp = await exportStudents(payload).unwrap();
      alertSuccess("Export", resp?.data ?? resp?.message ?? "Diproses.");
    } catch (err: unknown) {
      const info = extractPayload(err);
      const msg = info.message ?? "Gagal memulai export.";
      alertError("Export gagal", msg);
    }
  };

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StudentRead | null>(null);

  const onCreate = () => {
    setEditId(null);
    setOpenForm(true);
  };
  const onEdit = (id: number) => {
    setEditId(id);
    setOpenForm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      const name = pendingDelete.name;
      await remove(pendingDelete.id).unwrap();
      setPendingDelete(null);
      alertSuccess("Berhasil Dihapus", `Mahasiswa "${name}" telah dihapus.`);
      refetch();
    } catch (err: unknown) {
      const info = extractPayload(err);
      const msg = info.message ?? "Terjadi kesalahan saat menghapus.";
      alertError("Gagal Menghapus", msg);
    }
  };

  const getSchoolLabel = (id: number | null): string =>
    id == null
      ? "Semua Prodi"
      : schoolOptions.find((s) => s.id === id)?.label ?? `ID: ${id}`;
  const getClassLabel = (id: number | null): string =>
    id == null
      ? "Semua Kelas"
      : classOptions.find((c) => c.id === id)?.label ?? `ID: ${id}`;

  /* ------------------------------- Render ------------------------------ */

  return (
    <>
      <SiteHeader title="Mahasiswa" />
      <main className="space-y-6 px-4 py-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="gap-3 md:flex md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">
                Mahasiswa
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Daftar akun <span className="font-medium">Mahasiswa</span>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Import */}
              <input
                ref={importInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleImportChange}
              />
              <Button
                variant="outline"
                onClick={triggerImport}
                title="Import Mahasiswa"
                disabled={importing}
              >
                <Upload
                  className={`mr-2 h-4 w-4 ${importing ? "animate-spin" : ""}`}
                />
                {importing ? "Mengunggah…" : "Import"}
              </Button>

              {/* Template */}
              <a
                href={templateUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                download
                onClick={(e) => {
                  if (!templateUrl) e.preventDefault();
                }}
              >
                <Button variant="outline" title="Unduh Template Excel">
                  <FileDown className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </a>

              {/* Export */}
              <Button
                variant="outline"
                onClick={handleExport}
                title="Export Mahasiswa"
                disabled={exporting}
              >
                <FileDown
                  className={`mr-2 h-4 w-4 ${exporting ? "animate-spin" : ""}`}
                />
                {exporting ? "Memulai…" : "Export"}
              </Button>

              {/* Reset Filter */}
              <Button
                variant="secondary"
                onClick={resetFilters}
                title="Reset filter"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>

              <Button
                variant="outline"
                size="icon"
                title="Refresh"
                onClick={() => refetch()}
              >
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
              {/* Global Search */}
              <div className="relative lg:col-span-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Cari nama / email / telepon…"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Filter Prodi */}
              <div className="lg:col-span-3">
                <Combobox
                  value={schoolId}
                  onChange={(v) => {
                    setSchoolId(v);
                    setPage(1);
                  }}
                  onSearchChange={setSchoolSearch}
                  data={schoolOptions.map((s) => ({
                    id: s.id,
                    label: s.label,
                  }))}
                  isLoading={loadingSchools}
                  placeholder={getSchoolLabel(schoolId)}
                  getOptionLabel={(item: { id: number; label: string }) =>
                    item.label
                  }
                />
              </div>

              {/* Filter Kelas */}
              <div className="lg:col-span-3">
                <Combobox
                  value={classId}
                  onChange={(v) => {
                    setClassId(v);
                    setPage(1);
                  }}
                  onSearchChange={setClassSearch}
                  data={classOptions.map((c) => ({ id: c.id, label: c.label }))}
                  isLoading={loadingClasses}
                  placeholder={getClassLabel(classId)}
                  getOptionLabel={(item: { id: number; label: string }) =>
                    item.label
                  }
                />
              </div>

              {/* Filter Status */}
              <div className="lg:col-span-2">
                <Select
                  value={statusFilter}
                  onValueChange={(v: StatusFilter) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-background">
              <div className="overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader className="sticky top-0 bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                    <TableRow>
                      <TableHead className="w-[320px]">Akun</TableHead>
                      <TableHead className="w-[320px]">NIM</TableHead>
                      <TableHead className="w-[160px]">Prodi</TableHead>
                      <TableHead className="w-[180px]">Kelas</TableHead>
                      <TableHead className="w-[160px]">Telepon</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="text-right w-[120px]">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isFetching && rows.length === 0 && (
                      <>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} className="hover:bg-transparent">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-44" />
                                  <Skeleton className="h-3 w-56" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-40" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20 rounded-full" />
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

                    {!isFetching && rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-28 text-center">
                          <div className="mx-auto max-w-md space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Tidak ada data yang cocok.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Coba ubah kata kunci atau perbesar jumlah data per
                              halaman.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {rows.map((u, idx) => (
                      <TableRow
                        key={u.id}
                        className={idx % 2 === 1 ? "bg-muted/20" : undefined}
                      >
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <div className="font-medium leading-none">
                                {u.name}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            {u.nim}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                            {u.school_name}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            {u.class_name}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {u.phone ?? "-"}
                          </div>
                        </TableCell>

                        <TableCell>
                          {u.status ? (
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

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="inline-flex gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => onEdit(u.id)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => setPendingDelete(u)}
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={() => onEdit(u.id)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPendingDelete(u)}
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
                  {rows.length !== (data?.data?.length ?? rows.length) && (
                    <>
                      {" "}
                      (<span className="font-medium">{rows.length}</span>{" "}
                      tersaring pada halaman ini)
                    </>
                  )}
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
        <StudentForm
          key={editId ?? "create"}
          open={openForm}
          onOpenChange={(v) => {
            setOpenForm(v);
            if (!v) setEditId(null);
          }}
          onSuccess={(mode) => {
            setOpenForm(false);
            setEditId(null);
            refetch();
            if (mode === "create") {
              Swal.fire({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1600,
                icon: "success",
                title: "Berhasil Dibuat",
              });
            } else {
              Swal.fire({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1600,
                icon: "success",
                title: "Berhasil Diperbarui",
              });
            }
          }}
          studentId={editId ?? undefined}
        />

        {/* Confirm Delete */}
        <AlertDialog
          open={!!pendingDelete}
          onOpenChange={(o) => !o && setPendingDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Mahasiswa?</AlertDialogTitle>
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