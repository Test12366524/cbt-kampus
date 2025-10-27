"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import type { SubMapel } from "@/types/master/submapel";

import {
  useCreateSubjectSubMutation,
  useUpdateSubjectSubMutation,
} from "@/services/master/submapel.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

type Mode = "create" | "edit";

/** Tambahkan info subject dari API untuk mode edit */
type SubMapelWithSubjectInfo = SubMapel & {
  subject_name?: string | null;
  subject_code?: string | null;
};

export interface SubMapelFormProps {
  mode: Mode;
  initialData?: SubMapelWithSubjectInfo;
  onSuccess?: (saved: SubMapel) => void;
  onCancel?: () => void;

  /** dipakai saat create (dipilih di page toolbar) */
  subjectPresetId: number | null;
  subjectPresetName: string | null;
}

interface FormValues {
  subject_id: number | null;
  code: string;
  name: string;
  description: string;
  status: boolean;
}

export default function SubMapelForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
  subjectPresetId,
  subjectPresetName,
}: SubMapelFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      subject_id: subjectPresetId ?? null,
      code: "",
      name: "",
      description: "",
      status: true,
    },
  });

  const [createSub, { isLoading: creating }] = useCreateSubjectSubMutation();
  const [updateSub, { isLoading: updating }] = useUpdateSubjectSubMutation();

  // Prefill ketika edit / sinkron preset create
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setValue("subject_id", initialData.subject_id);
      setValue("code", initialData.code ?? "");
      setValue("name", initialData.name);
      setValue("description", initialData.description ?? "");
      setValue(
        "status",
        typeof initialData.status === "number"
          ? initialData.status === 1
          : Boolean(initialData.status)
      );
    } else {
      setValue("subject_id", subjectPresetId ?? null);
    }
  }, [mode, initialData, subjectPresetId, setValue]);

  const onSubmit = async (values: FormValues) => {
    if (!values.subject_id) return;

    const payload = {
      subject_id: values.subject_id,
      code: values.code ? values.code : null,
      name: values.name,
      description: values.description ? values.description : null,
      status: values.status,
    };

    const saved =
      mode === "create"
        ? await createSub(payload).unwrap()
        : initialData
        ? await updateSub({ id: initialData.id, payload }).unwrap()
        : null;

    if (saved) onSuccess?.(saved);
  };

  const loading = isSubmitting || creating || updating;

  // === Tampilan label subject ===
  const subjectLabel =
    mode === "edit"
      ? // Saat edit, gunakan langsung dari API
        initialData?.subject_name
        ? initialData.subject_code
          ? `${initialData.subject_name} — ${initialData.subject_code}`
          : initialData.subject_name
        : `#${initialData?.subject_id}`
      : // Saat create, gunakan preset dari page
        subjectPresetName ?? "Belum dipilih (pilih di toolbar halaman)";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Subject readonly */}
      <div className="grid gap-1">
        <Label>Jurusan</Label>
        <div className="text-sm font-medium">{subjectLabel}</div>
        {/* Hidden actual field untuk submit */}
        <input type="hidden" {...register("subject_id", { required: true })} />
        {!subjectPresetId && mode === "create" ? (
          <p className="text-xs text-destructive mt-1">
            Pilih Subject di toolbar halaman sebelum menambah Mata Kuliah.
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="code">Kode</Label>
        <Input
          id="code"
          placeholder="e.g. MATH-A1"
          {...register("code")}
          disabled={loading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Nama Mata Kuliah</Label>
        <Input
          id="name"
          placeholder="Aljabar Linear"
          {...register("name", { required: "Nama wajib diisi" })}
          disabled={loading}
        />
        {errors.name?.message ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Deskripsi singkat…"
          rows={4}
          {...register("description")}
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label>Status Aktif</Label>
          <p className="text-sm text-muted-foreground">
            Nonaktifkan jika belum digunakan.
          </p>
        </div>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked)}
              disabled={loading}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={loading || (mode === "create" && !subjectPresetId)}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Simpan" : "Update"}
        </Button>
      </div>
    </form>
  );
}