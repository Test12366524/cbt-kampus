"use client";

import * as React from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combo-box";

import type { School } from "@/types/master/school";

import { useGetSchoolListQuery } from "@/services/master/school.service";

/** === Shared enums (sinkron dgn service) === */
export type TimerType = string; //"per_test" | "per_category"
export type ScoreType = string;
export type AssessmentType = string;

/** === Form shape (entity-like, bukan payload API) === */
export type FormState = {
  school_id: number;
  title: string;
  sub_title: string;
  slug: string;
  description: string;
  total_time: number;
  total_questions: number;
  pass_grade: number;
  shuffle_questions: boolean | number;
  assessment_type: AssessmentType;
  timer_type: TimerType;
  score_type: ScoreType;
  start_date: string;
  end_date: string;
  code: string;
  max_attempts: string;
  is_graded: boolean;
  is_explanation_released: boolean;
};

type Props = {
  initial: FormState;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: FormState) => void | Promise<void>;
};

/** Load SunEditor (client only) */
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

/** Button list SunEditor */
type ButtonList = (string | string[])[];

const defaultButtons: ButtonList = [
  ["undo", "redo"],
  ["bold", "italic", "underline", "strike", "removeFormat"],
  ["font", "fontSize"],
  ["fontColor", "hiliteColor"],
  ["align", "list", "lineHeight"],
  ["blockquote", "link", "image", "video", "table"],
  ["codeView", "fullScreen"],
];

export default function TryoutForm({
  initial,
  submitting,
  onCancel,
  onSubmit,
}: Props) {
  // Kelola state LOKAL agar tak gampang reset saat parent re-render
  const [form, setForm] = React.useState<FormState>(initial);

  const [schoolId, setSchoolId] = React.useState<number | null>(null);

  const [schoolSearch, setSchoolSearch] = React.useState<string>("");
  const { data: schoolListResp, isFetching: loadingSchools } =
    useGetSchoolListQuery(
      { page: 1, paginate: 30, search: schoolSearch },
      { refetchOnMountOrArgChange: true }
    );
  const schools: School[] = schoolListResp?.data ?? [];
  // Jika "initial" berubah karena ganti mode (edit -> create, dsb)
  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  // VALIDASI kecil
  const validate = (): string | null => {
    if (!form.title.trim()) return "Judul wajib diisi.";
    if (
      form.timer_type === "per_test" &&
      (!form.total_time || form.total_time <= 0)
    ) {
      return "Total waktu wajib diisi dan > 0 saat Timer Type = Per Test.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (!form.school_id) {
      void Swal.fire({
        icon: "warning",
        title: "Pilih Prodi",
        text: "Field prodi wajib diisi.",
      });
      return;
    }
    if (err) {
      // biar minimal, pakai alert—silakan ganti Swal kalau mau di sini juga
      alert(err);
      return;
    }
    await onSubmit(form);
  };

  // ==== RICH TEXT: gunakan HANYA setContents + onChange (tanpa defaultValue) ====
  const handleRTChange = React.useCallback((html: string) => {
    setForm((prev) => ({ ...prev, description: html }));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Kiri */}
      <div className="space-y-3">
        <div>
          <Label>Prodi</Label>
          <div className="h-2" />
          <Combobox<School>
            value={form.school_id}
            onChange={(value) => setForm({ ...form, school_id: value })}
            onSearchChange={setSchoolSearch}
            data={schools}
            isLoading={loadingSchools}
            placeholder="Pilih Prodi"
            getOptionLabel={(s) => s.name}
          />
        </div>
        <div>
          <Label>Judul *</Label>
          <div className="h-2" />
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Sub Judul</Label>
          <div className="h-2" />
          <Input
            value={form.sub_title ?? ""}
            onChange={(e) => setForm({ ...form, sub_title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>
              Total Time (detik){" "}
              {form.timer_type === "per_test"
                ? "*"
                : "(diabaikan saat per category)"}
            </Label>
            <div className="h-2" />
            <Input
              type="number"
              disabled={form.timer_type !== "per_test"}
              value={form.timer_type === "per_test" ? form.total_time : 0}
              onChange={(e) =>
                setForm({ ...form, total_time: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Switch
              checked={form.is_graded}
              onCheckedChange={(v) => setForm({ ...form, is_graded: v })}
              id="graded"
            />
            <Label htmlFor="graded">Status: Active (Graded)</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Pass Grade</Label>
            <div className="h-2" />
            <Input
              type="number"
              value={form.pass_grade}
              onChange={(e) =>
                setForm({ ...form, pass_grade: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Switch
              id="shuffle"
              checked={Boolean(form.shuffle_questions)}
              onCheckedChange={
                (v) => setForm({ ...form, shuffle_questions: v })
              }
            />

            <Label htmlFor="shuffle">Shuffle Questions</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Access Code (opsional)</Label>
            <div className="h-2" />
            <Input
              value={form.code ?? ""}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>
          <div>
            <Label>Max Attempts (opsional)</Label>
            <div className="h-2" />
            <Input
              value={form.max_attempts ?? ""}
              onChange={(e) =>
                setForm({ ...form, max_attempts: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tanggal Mulai</Label>
            <div className="h-2" />
            <Input
              type="datetime-local"
              value={form.start_date ?? ""}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Tanggal Selesai</Label>
            <div className="h-2" />
            <Input
              type="datetime-local"
              value={form.end_date ?? ""}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Kanan: Rich Text */}
      <div className="space-y-1">
        <Label>Deskripsi (Rich Text)</Label>
        <div className="h-1" />
        <div className="rounded-lg border bg-background">
          <SunEditor
            setContents={form.description} // <-- controlled, TANPA defaultValue
            onChange={handleRTChange}
            placeholder="Tulis konten di sini…"
            setDefaultStyle={`
              body {
                font-family: inherit;
                font-size: 14px;
                line-height: 1.7;
                color: hsl(var(--foreground));
                background: transparent;
              }
              a { color: hsl(var(--primary)); text-decoration: underline; }
              table { border-collapse: collapse; width: 100%; }
              table, th, td { border: 1px solid hsl(var(--border)); }
              th, td { padding: 6px 10px; }
            `}
            setOptions={{
              minHeight: "320px",
              maxHeight: "60vh",
              charCounter: true,
              showPathLabel: false,
              resizingBar: true,
              buttonList: defaultButtons,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          Simpan
        </Button>
      </div>
    </div>
  );
}