"use client";

import { useEffect, useMemo, useState } from "react";
import type { LmsDetail } from "@/types/lms-detail";

import {
  useCreateLmsDetailMutation,
  useUpdateLmsDetailMutation,
} from "@/services/lms-detail.service";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SunRichText from "../ui/rich-text";
import {
  CheckCircle2,
  Loader2,
  X,
  XCircle,
  Link2,
  FileVideo2,
  FileAudio2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  lmsId: number; // ⬅️ wajib dikirim dari page
  initialData?: LmsDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type ContentType = "video" | "audio" | "pdf" | "image" | "external_link";

export default function LmsDetailForm({
  lmsId,
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subTitle, setSubTitle] = useState(initialData?.sub_title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [status, setStatus] = useState<boolean>(
    Boolean(initialData?.status ?? true)
  );
  const [type, setType] = useState<ContentType>(
    (initialData?.type as ContentType) ?? "video"
  );
  const [link, setLink] = useState(initialData?.link ?? "");

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(
    typeof initialData?.file === "string" ? (initialData?.file as string) : null
  );

  const [createItem, { isLoading: creating }] = useCreateLmsDetailMutation();
  const [updateItem, { isLoading: updating }] = useUpdateLmsDetailMutation();
  const isSaving = creating || updating;

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const acceptAttr = useMemo(() => {
    switch (type) {
      case "video":
        return "video/*";
      case "audio":
        return "audio/*";
      case "pdf":
        return "application/pdf";
      case "image":
        return "image/*";
      default:
        return undefined;
    }
  }, [type]);

  const showFileInput = type !== "external_link";
  const showLinkInput = type === "external_link";

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("lms_id", String(lmsId));
    fd.append("title", title);
    fd.append("sub_title", subTitle);
    fd.append("description", description ?? "");
    fd.append("status", status ? "1" : "0");
    fd.append("type", type);
    if (showLinkInput) fd.append("link", link ?? "");
    if (showFileInput && file) fd.append("file", file);
    return fd;
  };

  const onSubmit = async () => {
    // Validasi hanya saat CREATE
    if (!isEdit) {
      if (!title.trim()) {
        await Swal.fire({ icon: "warning", title: "Judul wajib diisi" });
        return;
      }
      if (!type) {
        await Swal.fire({ icon: "warning", title: "Tipe wajib dipilih" });
        return;
      }
      if (type === "external_link") {
        if (!link.trim()) {
          await Swal.fire({ icon: "warning", title: "Link wajib diisi" });
          return;
        }
        try {
          // quick URL check
          new URL(link.trim());
        } catch {
          await Swal.fire({
            icon: "warning",
            title: "Format link tidak valid (URL)",
          });
          return;
        }
      } else {
        if (!file) {
          await Swal.fire({ icon: "warning", title: "File wajib diunggah" });
          return;
        }
      }
    }

    try {
      const payload = buildFormData();
      if (isEdit) {
        await updateItem({ id: initialData!.id, payload }).unwrap();
      } else {
        await createItem(payload).unwrap();
      }

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data tersimpan.",
      });
      onSuccess?.(); // page yang menutup modal & refetch
    } catch (e) {
      console.error(e);
      // ❗ Tidak menutup modal saat error
      const message =
        (e as { data?: { message?: string } })?.data?.message ??
        "Tidak dapat menyimpan data.";
      await Swal.fire({ icon: "error", title: "Gagal", text: message });
    }
  };

  return (
    <div className="space-y-4 w-full max-h-[80vh] overflow-y-auto">
      {/* Baris 1: Title & Sub Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Sub Title</Label>
          <Input
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Tipe konten */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Tipe Konten</Label>
          <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">
                <div className="inline-flex items-center gap-2">
                  <FileVideo2 className="h-4 w-4" /> Video
                </div>
              </SelectItem>
              <SelectItem value="audio">
                <div className="inline-flex items-center gap-2">
                  <FileAudio2 className="h-4 w-4" /> Audio
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" /> PDF
                </div>
              </SelectItem>
              <SelectItem value="image">
                <div className="inline-flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image
                </div>
              </SelectItem>
              <SelectItem value="external_link">
                <div className="inline-flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> External Link
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status elegan */}
        <div className="rounded-2xl border bg-gradient-to-br from-muted/40 to-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {status ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
                <Label htmlFor="status" className="text-base font-semibold">
                  Status Konten
                </Label>
                <Badge
                  variant={status ? "default" : "secondary"}
                  className={
                    status ? "bg-emerald-600 hover:bg-emerald-600" : ""
                  }
                >
                  {status ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs tabular-nums ${
                  status ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {status ? "ON" : "OFF"}
              </span>
              <Switch
                id="status"
                checked={status}
                onCheckedChange={setStatus}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Link (hanya external_link) */}
      {showLinkInput && (
        <div className="space-y-2">
          <Label>Link</Label>
          <Input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://contoh.com/resource"
          />
        </div>
      )}

      {/* File (tipe selain external_link) */}
      {showFileInput && (
        <div className="space-y-2">
          <Label>File</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept={acceptAttr}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {filePreview && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFile(null);
                  setFilePreview(
                    typeof initialData?.file === "string"
                      ? (initialData.file as string)
                      : null
                  );
                }}
                title="Hapus"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Preview sederhana */}
          {filePreview && type === "image" && (
            <img
              src={filePreview}
              alt="Preview"
              className="mt-2 h-32 w-48 object-cover rounded border"
            />
          )}
          {filePreview && type !== "image" && (
            <div className="mt-2 text-xs text-muted-foreground break-all">
              File saat ini:{" "}
              <a
                href={filePreview}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Buka
              </a>
            </div>
          )}
        </div>
      )}

      {/* Description (Rich Text) */}
      <div>
        <Label>Description</Label>
        <SunRichText
          value={description}
          onChange={setDescription}
          minHeight={220}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan
        </Button>
      </div>
    </div>
  );
}