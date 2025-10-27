"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Mapel } from "@/types/master/mapel";
import {
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from "@/services/master/mapel.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

type Mode = "create" | "edit";

export interface MapelFormProps {
  mode: Mode;
  initialData?: Mapel;
  onSuccess?: (saved: Mapel) => void;
  onCancel?: () => void;
}

interface FormValues {
  code: string;
  name: string;
  description: string;
  status: boolean;
}

export default function MapelForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: MapelFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      status: true,
    },
  });

  const [createSubject, { isLoading: creating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: updating }] = useUpdateSubjectMutation();

  // Prefill ketika edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setValue("code", initialData.code ?? "");
      setValue("name", initialData.name);
      setValue("description", initialData.description ?? "");
      setValue(
        "status",
        typeof initialData.status === "number"
          ? initialData.status === 1
          : Boolean(initialData.status)
      );
    }
  }, [mode, initialData, setValue]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      code: values.code || null, // nullable
      name: values.name,
      description: values.description ? values.description : null,
      status: values.status,
    };

    if (mode === "create") {
      const saved = await createSubject(payload).unwrap();
      onSuccess?.(saved);
      return;
    }

    if (!initialData) return;
    const saved = await updateSubject({ id: initialData.id, payload }).unwrap();
    onSuccess?.(saved);
  };

  const loading = isSubmitting || creating || updating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="code">Kode</Label>
        <Input
          id="code"
          placeholder="e.g. MATH-01"
          {...register("code")}
          disabled={loading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Nama Jurusan</Label>
        <Input
          id="name"
          placeholder="Masukan nama jurusan"
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
          placeholder="Deskripsi singkat mapel…"
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

        {/* Controller untuk Switch (bukan input native) */}
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
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Simpan" : "Update"}
        </Button>
      </div>
    </form>
  );
}