"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useModal from "@/hooks/use-modal";
import {
  useGetKelurahanListQuery,
  useCreateKelurahanMutation,
  useUpdateKelurahanMutation,
  useDeleteKelurahanMutation,
} from "@/services/master/kelurahan.service";
import { Kelurahan } from "@/types/master/kelurahan";
import FormKelurahan from "@/components/form-modal/master/kelurahan-form";
import { Input } from "@/components/ui/input";
import ActionsGroup from "@/components/admin-components/actions-group";
import { Plus } from "lucide-react";

export default function KelurahanPage() {
  const [form, setForm] = useState<Partial<Kelurahan>>({
    id: "",
    district_id: "",
    name: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [readonly, setReadonly] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading, refetch } = useGetKelurahanListQuery({
    page: currentPage,
    paginate: itemsPerPage,
    search: query,
  });

  const categoryList = useMemo(() => data?.data || [], [data]);
  const lastPage = useMemo(() => data?.last_page || 1, [data]);

  // Filter data based on query (if needed)
  const filteredData = useMemo(() => {
    if (!query) return categoryList;
    return categoryList.filter((item: Kelurahan) =>
      item.name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [categoryList, query]);

  const [createCategory, { isLoading: isCreating }] =
    useCreateKelurahanMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateKelurahanMutation();
  const [deleteCategory] = useDeleteKelurahanMutation();

  const handleSubmit = async () => {
    try {
      const payload = {
        id: form.id || "",
        district_id: form.district_id || "",
        name: form.name || ""
      };

      if (editingId) {
        await updateCategory({ id: editingId, payload }).unwrap();
        Swal.fire("Sukses", "Kelurahan diperbarui", "success");
      } else {
        await createCategory(payload).unwrap();
        Swal.fire("Sukses", "Kelurahan ditambahkan", "success");
      }

      setForm({ name: "" });
      setEditingId(null);
      await refetch();
      closeModal();
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal menyimpan data", "error");
    }
  };

  const handleEdit = (item: Kelurahan) => {
    setForm({ ...item });
    setEditingId(item.id);
    setReadonly(false);
    openModal();
  };

  const handleDetail = (item: Kelurahan) => {
    setForm(item);
    setReadonly(true);
    openModal();
  };

  const handleDelete = async (item: Kelurahan) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus Kelurahan?",
      text: item.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteCategory(item.id).unwrap();
        await refetch();
        Swal.fire("Berhasil", "Kelurahan dihapus", "success");
      } catch (error) {
        Swal.fire("Gagal", "Gagal menghapus Kelurahan", "error");
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-md bg-white p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Kiri: filter */}
          <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari kelurahan..."
              value={query}
              onChange={(e) => {
                const q = e.target.value;
                setQuery(q);
              }}
              className="w-full sm:max-w-xs"
            />
          </div>

          {/* Kanan: aksi */}
          <div className="shrink-0 flex flex-wrap items-center gap-2">
            {/* Tambah data (opsional) */}
            {openModal && <Button onClick={openModal}><Plus /> Kelurahan</Button>}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Provinsi</th>
                <th className="px-4 py-2">Kota / Kabupaten</th>
                <th className="px-4 py-2">Kecamatan</th>
                <th className="px-4 py-2">Kelurahan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <ActionsGroup
                          handleDetail={() => handleDetail(item)}
                          handleEdit={() => handleEdit(item)}
                          handleDelete={() => handleDelete(item)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">{item.province_name}</td>
                    <td className="px-4 py-2 font-medium">{item.regency_name}</td>
                    <td className="px-4 py-2 font-medium">{item.district_name}</td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="p-4 flex items-center justify-between bg-muted">
          <div className="text-sm">
            Halaman <strong>{currentPage}</strong> dari{" "}
            <strong>{lastPage}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <FormKelurahan
            form={form}
            setForm={setForm}
            onCancel={() => {
              setForm({ name: "" });
              setEditingId(null);
              setReadonly(false);
              closeModal();
            }}
            onSubmit={handleSubmit}
            readonly={readonly}
            isLoading={isCreating || isUpdating}
          />
        </div>
      )}
    </div>
  );
}
