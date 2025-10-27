// app/(cms)/cms/tryout/paket-latihan/[testId]/questions-category/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";

import {
  useGetTestCategoryListQuery,
  useCreateTestCategoryMutation,
  useUpdateTestCategoryMutation,
  useDeleteTestCategoryMutation,
} from "@/services/tryout/test-category.service";
import { useGetTestByIdQuery } from "@/services/tryout/test.service";
import { useGetQuestionCategoryListQuery } from "@/services/bank-questions/category-questions.service";

import type { TestCategory } from "@/types/tryout/test-category";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Pager from "@/components/ui/tryout-pagination";
import ActionIcon from "@/components/ui/action-icon";
import { ArrowLeft, ListChecks, PenLine, Plus, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Combobox } from "@/components/ui/combo-box";

type FormState = {
  question_category_id: number;
  total_questions: number;
  total_time: number; // detik, wajib jika timer_type per_category
  order: number;
};

const emptyForm: FormState = {
  question_category_id: 0,
  total_questions: 0,
  total_time: 600,
  order: 1,
};

type QuestionCategoryOption = {
  id: number;
  code: string;
  name: string;
};

const showZeroAsEmpty = (n: number) => (n === 0 ? "" : String(n));

export default function TestCategoriesPage() {
  const params = useParams<{ testId: string }>();
  const testId = Number(params.testId);
  const router = useRouter();

  const [page, setPage] = useState<number>(1);
  const [paginate, setPaginate] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  // detail test → untuk tahu timer_type
  const { data: testDetail } = useGetTestByIdQuery(testId);

  const { data, isLoading, refetch } = useGetTestCategoryListQuery({
    test_id: testId,
    page,
    paginate,
    search,
  });

  const [createCat, { isLoading: creating }] = useCreateTestCategoryMutation();
  const [updateCat, { isLoading: updating }] = useUpdateTestCategoryMutation();
  const [deleteCat] = useDeleteTestCategoryMutation();

  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<TestCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // list kategori soal untuk combobox
  const [catQuery, setCatQuery] = useState<string>("");
  const { data: catListResp, isLoading: loadingCats } =
    useGetQuestionCategoryListQuery({
      page: 1,
      paginate: 50,
      search: catQuery,
    });

  const catOptions: QuestionCategoryOption[] = useMemo(
    () =>
      (catListResp?.data ?? []).map(
        (c: { id: number; code: string; name: string }) => ({
          id: c.id,
          code: c.code,
          name: c.name,
        })
      ),
    [catListResp]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row: TestCategory) => {
    setEditing(row);
    setForm({
      question_category_id: row.question_category_id,
      total_questions: row.total_questions,
      total_time: row.total_time,
      order: row.order,
    });
    setOpen(true);
  };

  const validate = (): string | null => {
    if (!form.question_category_id) return "Kategori wajib dipilih.";
    if (form.total_questions <= 0) return "Total pertanyaan harus > 0.";
    if (
      testDetail?.timer_type === "per_category" &&
      (!form.total_time || form.total_time <= 0)
    ) {
      return "Total durasi per kategori wajib diisi dan > 0 saat Timer Type = Per Category.";
    }
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      await Swal.fire({ icon: "warning", title: "Validasi", text: err });
      return;
    }
    try {
      if (editing) {
        await updateCat({
          test_id: testId,
          id: editing.id,
          payload: form,
        }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Kategori diperbarui.",
        });
      } else {
        await createCat({ test_id: testId, payload: form }).unwrap();
        await Swal.fire({
          icon: "success",
          title: "Created",
          text: "Kategori ditambahkan.",
        });
      }
      setOpen(false);
      refetch();
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e) });
    }
  };

  const onDelete = async (row: TestCategory) => {
    const ask = await Swal.fire({
      icon: "warning",
      title: "Hapus Kategori?",
      text: row.question_category_name,
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
    });
    if (!ask.isConfirmed) return;
    try {
      await deleteCat({ test_id: testId, id: row.id }).unwrap();
      await Swal.fire({ icon: "success", title: "Terhapus" });
      refetch();
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e) });
    }
  };

  return (
    <>
      <SiteHeader title="Kategori Soal" />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-semibold">
            Paket Latihan - Kategori Bank Soal
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
          <div className="flex items-center gap-2">
            <Label>Records</Label>
            <select
              className="h-9 rounded-md border bg-background px-2"
              value={paginate}
              onChange={(e) => {
                setPaginate(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div className="ml-auto w-full md:w-72 flex gap-2">
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && refetch()}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setPage(1);
                refetch();
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3">Paket</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Total Soal</th>
                <th className="p-3">Urutan</th>
                <th className="p-3">Durasi (detik)</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-4" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : data?.data?.length ? (
                data.data.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3">
                      {row.question_category_name.split(" - ")[0] || "-"}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {row.question_category_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.question_category_code}
                      </div>
                    </td>
                    <td className="p-3">{row.total_questions}</td>
                    <td className="p-3">{row.order}</td>
                    <td className="p-3">
                      {testDetail?.timer_type === "per_category" ? (
                        row.total_time
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/cms/tryout/paket-latihan/${testId}/${
                            row.id
                          }/select-soal?qcat=${
                            row.question_category_id
                          }&qcat_name=${encodeURIComponent(
                            row.question_category_name
                          )}`}
                        >
                          <ActionIcon label="Soal">
                            <ListChecks className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                        <ActionIcon label="Edit" onClick={() => openEdit(row)}>
                          <PenLine className="h-4 w-4" />
                        </ActionIcon>
                        <ActionIcon label="Hapus" onClick={() => onDelete(row)}>
                          <Trash2 className="h-4 w-4" />
                        </ActionIcon>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4" colSpan={6}>
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pager
          page={data?.current_page ?? 1}
          lastPage={data?.last_page ?? 1}
          onChange={setPage}
        />

        {/* Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Kategori" : "Tambah Kategori"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-3">
              <div className="space-y-2">
                <Label>Kategori Soal *</Label>
                <Combobox<QuestionCategoryOption>
                  value={form.question_category_id || null}
                  onChange={(val) =>
                    setForm({ ...form, question_category_id: val })
                  }
                  data={catOptions}
                  isLoading={loadingCats}
                  placeholder="Pilih kategori"
                  onSearchChange={setCatQuery}
                  getOptionLabel={(item) => `${item.name} (${item.code})`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Total Pertanyaan *</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={showZeroAsEmpty(form.total_questions)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_questions:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order *</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={showZeroAsEmpty(form.order)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        order:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button onClick={onSubmit} disabled={creating || updating}>
                {editing ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}