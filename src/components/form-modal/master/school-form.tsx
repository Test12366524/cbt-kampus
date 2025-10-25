"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useGetSchoolByIdQuery,
} from "@/services/master/school.service";
import type { School } from "@/types/master/school";

import { useGetProvinsiListQuery } from "@/services/master/provinsi.service";
import { useGetKotaListQuery } from "@/services/master/kota.service";
import { useGetKecamatanListQuery } from "@/services/master/kecamatan.service";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RegionPickers } from "@/components/admin-components/region-pickers";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  schoolId?: number | null; // jika ada → edit mode
};

type SchoolUpsert = Pick<School, "name" | "description" | "status"> & {
  province_id: string | null;
  regency_id: string | null;
  district_id: string | null;
};

export default function SchoolForm({
  open,
  onOpenChange,
  onSuccess,
  schoolId,
}: Props) {
  const isEdit = typeof schoolId === "number";

  const [form, setForm] = useState<SchoolUpsert>({
    name: "",
    description: "",
    status: true,
    province_id: null,
    regency_id: null,
    district_id: null,
  });

  const { data: detail, isFetching } = useGetSchoolByIdQuery(schoolId ?? 0, {
    skip: !isEdit,
  });

  // ==== Region data (default 5; search >=2) ====
  const [qProv, setQProv] = useState("");
  const [qReg, setQReg] = useState("");
  const [qDis, setQDis] = useState("");

  const { data: provResp, isFetching: loadingProv } = useGetProvinsiListQuery({
    page: 1,
    paginate: 5,
    search: qProv.length >= 2 ? qProv : "",
  });

  const { data: regResp, isFetching: loadingReg } = useGetKotaListQuery(
    {
      page: 1,
      paginate: 5,
      search: qReg.length >= 2 ? qReg : "",
      province_id: form.province_id ?? "",
    },
    { skip: !form.province_id }
  );

  const { data: disResp, isFetching: loadingDis } = useGetKecamatanListQuery(
    {
      page: 1,
      paginate: 5,
      search: qDis.length >= 2 ? qDis : "",
      regency_id: form.regency_id ?? "",
    },
    { skip: !form.regency_id }
  );

  const provinces = useMemo(
    () =>
      (provResp?.data ?? []).map((p: { id: string; name: string }) => ({
        id: p.id,
        name: p.name,
      })),
    [provResp]
  );
  const regencies = useMemo(
    () =>
      (regResp?.data ?? []).map((r: { id: string; name: string }) => ({
        id: r.id,
        name: r.name,
      })),
    [regResp]
  );
  const districts = useMemo(
    () =>
      (disResp?.data ?? []).map((d: { id: string; name: string }) => ({
        id: d.id,
        name: d.name,
      })),
    [disResp]
  );

  useEffect(() => {
    if (detail && isEdit) {
      setForm({
        name: detail.name,
        description: detail.description,
        status: detail.status,
        province_id: detail.province_id ?? null,
        regency_id: detail.regency_id ?? null,
        district_id: detail.district_id ?? null,
      });
    } else if (!isEdit) {
      setForm({
        name: "",
        description: "",
        status: true,
        province_id: null,
        regency_id: null,
        district_id: null,
      });
    }
  }, [detail, isEdit, open]);

  const [createSchool, { isLoading: creating }] = useCreateSchoolMutation();
  const [updateSchool, { isLoading: updating }] = useUpdateSchoolMutation();

  const update = <K extends keyof SchoolUpsert>(k: K, v: SchoolUpsert[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async () => {
    if (!form.province_id || !form.regency_id || !form.district_id) return;

    const payload = {
      name: form.name,
      description: form.description,
      status: form.status,
      province_id: form.province_id,
      regency_id: form.regency_id,
      district_id: form.district_id,
    };

    if (isEdit && schoolId != null) {
      await updateSchool({ id: schoolId, payload }).unwrap();
    } else {
      await createSchool(payload).unwrap();
    }
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      {/* Custom overlay: visual masking tanpa blokir klik */}
      {open ? (
        <div className="fixed inset-0 z-[999] bg-black/60 pointer-events-none" />
      ) : null}

      {/* Pastikan content di atas overlay */}
      <DialogContent className="sm:max-w-2xl md:max-w-3xl xl:max-w-5xl z-[1000]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Sekolah" : "Tambah Sekolah"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nama *</Label>
            <Input
              placeholder="Nama sekolah"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              disabled={isFetching}
            />
          </div>

          <div className="grid gap-2">
            <Label>Deskripsi</Label>
            <Textarea
              placeholder="Deskripsi singkat (opsional)"
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              disabled={isFetching}
            />
          </div>

          {/* Wilayah */}
          <div className="grid gap-2">
            <Label>Wilayah *</Label>
            <RegionPickers
              provinceId={form.province_id}
              regencyId={form.regency_id}
              districtId={form.district_id}
              onProvinceChange={(id) => update("province_id", id)}
              onRegencyChange={(id) => update("regency_id", id)}
              onDistrictChange={(id) => update("district_id", id)}
              provinces={provinces}
              regencies={regencies}
              districts={districts}
              isLoadingProvince={loadingProv}
              isLoadingRegency={loadingReg}
              isLoadingDistrict={loadingDis}
              onSearchProvince={setQProv}
              onSearchRegency={setQReg}
              onSearchDistrict={setQDis}
              disableRegency={!form.province_id}
              disableDistrict={!form.regency_id}
            />
            {!form.province_id || !form.regency_id || !form.district_id ? (
              <p className="text-xs text-muted-foreground">
                Pilih berurutan: Provinsi → Kabupaten/Kota → Kecamatan.
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.status}
              onCheckedChange={(v) => update("status", v)}
              disabled={isFetching}
            />
            <Label>Status aktif</Label>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              creating ||
              updating ||
              isFetching ||
              !form.province_id ||
              !form.regency_id ||
              !form.district_id
            }
          >
            {creating || updating ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}