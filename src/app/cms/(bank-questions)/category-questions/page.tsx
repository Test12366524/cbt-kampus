"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetQuestionCategoryListQuery,
  useDeleteQuestionCategoryMutation,
} from "@/services/bank-questions/category-questions.service";
import type { CategoryQuestion } from "@/types/bank-questions/category-questions";
import CategoryQuestionForm from "@/components/form-modal/bank-questions-form/category-questions-form";
import { Loader2, Plus, RefreshCw, Search, Pencil, Trash2 } from "lucide-react";
import { displayDate } from "@/lib/format-utils";

export default function CategoryQuestionsPage() {
  const itemsPerPage = 10;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // debounced trigger

  const { data, isFetching, refetch } = useGetQuestionCategoryListQuery({
    page,
    paginate: itemsPerPage,
    search: query || undefined,
  });

  const [remove, { isLoading: deleting }] = useDeleteQuestionCategoryMutation();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<CategoryQuestion | null>(null);

  const rows = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  // simple debounce
  useMemo(() => {
    const t = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id: number) => {
    const ok = confirm("Hapus kategori ini?");
    if (!ok) return;
    try {
      await remove(id).unwrap();
      refetch();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus data.");
    }
  };

  return (
    <>
      <SiteHeader title="Kategori Soal" />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold w-full">
              {/* Search */}
              <div className="mb-4 w-full flex items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari code/name…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh"
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpenForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="sticky top-0 z-10 bg-muted/50 text-left text-sm">
                  <tr className="border-b">
                    <th className="p-3 font-medium">Kode</th>
                    <th className="p-3 font-medium">Kategori Bank Soal</th>
                    <th className="p-3 font-medium">Deskripsi</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Tanggal Dibuat</th>
                    <th className="p-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetching && rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Memuat data…
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-muted-foreground"
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    rows.map((item) => {
                      const active =
                        typeof item.status === "number"
                          ? item.status === 1
                          : Boolean(item.status);
                      return (
                        <tr
                          key={item.id}
                          className="border-b hover:bg-muted/30"
                        >
                          <td className="p-3 font-mono">{item.code}</td>
                          <td className="p-3">{item.name}</td>
                          <td className="p-3">
                            {item.description ? (
                              item.description
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            {active ? (
                              <Badge className="px-2">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="px-2">
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {displayDate(item.created_at)}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setEditing(item);
                                  setOpenForm(true);
                                }}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDelete(item.id)}
                                disabled={deleting}
                                title="Delete"
                              >
                                {deleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Total:{" "}
                <span className="font-medium text-foreground">{total}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                >
                  Prev
                </Button>
                <div className="min-w-[80px] text-center text-sm">
                  Halaman <span className="font-medium">{page}</span> /{" "}
                  {lastPage}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage || isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modal Form */}
      <CategoryQuestionForm
        open={openForm}
        onOpenChange={(v) => setOpenForm(v)}
        initial={editing}
        onSuccess={() => {
          setEditing(null);
          refetch();
        }}
      />
    </>
  );
}