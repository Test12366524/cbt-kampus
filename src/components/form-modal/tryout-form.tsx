"use client";

import { useState } from "react";
import { useCreateTestMutation } from "@/services/tryout/test.service";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import SunRichText from "../ui/rich-text";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
};

type TestCreatePayload = {
  title: string;
  sub_title: string;
  description: string | null | string;
  total_time: number;
  pass_grade: number;
  assessment_type: string;
  timer_type: string;
  score_type: string;
  start_date: string;
  end_date: string;
  shuffle_questions: boolean | number;
  code: string | null | string;
  max_attempts: string | null;
  is_graded: boolean;
  is_explanation_released: boolean;
};

export default function TryoutForm({ open, onOpenChange, onSuccess }: Props) {
  const [modeTime, setModeTime] = useState<"default" | "custom">("default");
  const [form, setForm] = useState<TestCreatePayload>({
    title: "",
    sub_title: "",
    description: "",
    total_time: 0,
    pass_grade: 70,
    assessment_type: "irt",
    timer_type: "overall",
    score_type: "point",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    shuffle_questions: false,
    code: "",
    max_attempts: "1",
    is_graded: true,
    is_explanation_released: false,
  });

  const [createTest, { isLoading }] = useCreateTestMutation();
  const update = <K extends keyof TestCreatePayload>(
    k: K,
    v: TestCreatePayload[K]
  ) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    const payload: TestCreatePayload = {
      ...form,
      total_time: modeTime === "default" ? 0 : Number(form.total_time || 0),
    };
    await createTest(payload).unwrap();
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Paket Ujian Online</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label>Nama *</Label>
            <Input
              placeholder="Name"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div>
            <Label>Sub Title *</Label>
            <Input
              placeholder="Sub Title"
              value={form.sub_title}
              onChange={(e) => update("sub_title", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Deskripsi *</Label>
            <SunRichText
              value={form.description ?? ""}
              onChange={(html) => update("description", html)}
              minHeight={220}
            />
          </div>

          <div>
            <Label>Waktu Pengerjaan *</Label>
            <Select
              value={modeTime}
              onValueChange={(v) => setModeTime(v as "default" | "custom")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Default / Custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Waktu Pengerjaan (Detik) *</Label>
            <Input
              type="number"
              min={0}
              value={form.total_time}
              disabled={modeTime !== "custom"}
              onChange={(e) =>
                update("total_time", Number(e.target.value || 0))
              }
            />
          </div>

          <div>
            <Label>Metode Penilaian *</Label>
            <Select
              value={form.assessment_type}
              onValueChange={(v) => update("assessment_type", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="irt">irt</SelectItem>
                <SelectItem value="classic">classic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Shuffle Pertanyaan *</Label>
            <Select
              value={form.shuffle_questions ? "yes" : "no"}
              onValueChange={(v) => update("shuffle_questions", v === "yes")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="--Pilih Shuffle--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Kode (opsional)</Label>
            <Input
              value={form.code ?? ""}
              onChange={(e) => update("code", e.target.value)}
            />
          </div>
          <div>
            <Label>Max Attempts</Label>
            <Input
              value={form.max_attempts ?? ""}
              onChange={(e) => update("max_attempts", e.target.value)}
            />
          </div>
          <div className="mt-2 col-span-2">
            <label
              htmlFor="is_graded"
              className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status *</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                    form.is_graded
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {form.is_graded ? "Active" : "Inactive"}
                </span>
              </div>

              <Switch
                id="is_graded"
                checked={form.is_graded}
                onCheckedChange={(v) => update("is_graded", v)}
                className="data-[state=checked]:bg-emerald-600"
              />
            </label>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Reset
          </Button>
          <Button onClick={submit} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}