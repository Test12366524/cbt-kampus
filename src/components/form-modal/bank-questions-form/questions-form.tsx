"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";

import type { Questions } from "@/types/bank-questions/questions";
import type { CategoryQuestion } from "@/types/bank-questions/category-questions";
import { Combobox } from "@/components/ui/combo-box";

import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  type CreateQuestionPayload,
  type QuestionType,
  type MCOption,
  type CategorizedOption,
} from "@/services/bank-questions/questions.service";
import {
  useServiceUploadMutation,
  buildServiceUploadFormData,
} from "@/services/bank-questions/service-upload.service";

// SunEditor (client only, no CSS import here — taruh CSS di app/layout.tsx)
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

type Props = {
  categories: CategoryQuestion[];
  initial?: Questions | null; // jika ada => edit
  defaultCategoryId: number | null;
  onSaved?: (saved: Questions) => void;
  submittingText?: string;
};

export default function QuestionsForm({
  categories,
  initial,
  defaultCategoryId,
  onSaved,
  submittingText = "Simpan",
}: Props) {
  const isEdit = !!initial;

  // ===== Form state =====
  const [question_category_id, setCategoryId] = useState<number | null>(
    defaultCategoryId ?? null
  );
  const [type, setType] = useState<QuestionType>("multiple_choice");
  const [question, setQuestion] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [totalPoint, setTotalPoint] = useState<number>(5);

  // Options per type
  const [optionsMC, setOptionsMC] = useState<MCOption[]>([
    { option: "a", text: "", point: 0 },
    { option: "b", text: "", point: 0 },
  ]);
  const [optionsTF, setOptionsTF] = useState<MCOption[]>([
    { option: "a", text: "True", point: 1 },
    { option: "b", text: "False", point: 0 },
  ]);
  const [optionsMCMulti, setOptionsMCMulti] = useState<MCOption[]>([
    { option: "a", text: "", point: 0 },
    { option: "b", text: "", point: 0 },
    { option: "c", text: "", point: 0 },
  ]);
  const [optionsCategorized, setOptionsCategorized] = useState<
    CategorizedOption[]
  >([{ text: "", point: 1, accurate: false, not_accurate: false }]);

  // ===== Mutations =====
  const [createQuestion, { isLoading: creating }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation();
  const [uploadFile] = useServiceUploadMutation();
  const submitting = creating || updating;

  // ===== Hydrate for edit =====
  useEffect(() => {
    if (!initial) return;
    setCategoryId(initial.question_category_id ?? defaultCategoryId ?? null);
    setQuestion(initial.question ?? "");
    setType(initial.type as QuestionType);
    setAnswer(initial.answer ?? "");
    setTotalPoint(initial.total_point ?? 5);
    // NOTE: jika endpoint detail mengembalikan options & explanation,
    // isi juga state options* + explanation di sini.
  }, [initial, defaultCategoryId]);

  // ===== Upload handler untuk SunEditor (pakai service upload mutation)
  function makeUploadHandler() {
    return (
      files: File[],
      _info: unknown,
      uploadHandler: (data: {
        result?: { url: string; name: string; size: number }[];
        errorMessage?: string;
      }) => void
    ) => {
      const file = files?.[0];
      if (!file) return;
      uploadFile(buildServiceUploadFormData({ file }))
        .unwrap()
        .then((res) =>
          uploadHandler({
            result: [{ url: res.url, name: file.name, size: file.size }],
          })
        )
        .catch((e: unknown) =>
          uploadHandler({
            errorMessage: e instanceof Error ? e.message : "Upload gagal",
          })
        );
      return undefined;
    };
  }

//   // ===== Helpers =====
//   const selectedCategory = useMemo(
//     () => categories.find((c) => c.id === question_category_id) ?? null,
//     [categories, question_category_id]
//   );

  // ===== Builder payload (NO any) =====
  function buildPayload(): CreateQuestionPayload {
    if (!question_category_id) throw new Error("Kategori belum dipilih");

    switch (type) {
      case "multiple_choice":
        return {
          question_category_id,
          question,
          type,
          explanation: explanation || undefined,
          options: optionsMC,
          answer, // "a"
        };

      case "true_false":
        return {
          question_category_id,
          question,
          type,
          explanation: explanation || undefined,
          options: optionsTF, // a/b
          answer, // "a" | "b"
        };

      case "essay":
        return {
          question_category_id,
          question,
          type,
          explanation: explanation || undefined,
          answer,
          total_point: totalPoint,
        };

      case "multiple_choice_multiple_answer":
        return {
          question_category_id,
          question,
          type,
          explanation: explanation || undefined,
          options: optionsMCMulti,
          answer, // "a,c,d"
          total_point: totalPoint,
        };

      case "multiple_choice_multiple_category":
        return {
          question_category_id,
          question,
          type,
          explanation: explanation || undefined,
          options: optionsCategorized,
          total_point: totalPoint,
        };

      case "matching":
        return {
          question_category_id,
          question,
          type,
          explanation: explanation || undefined,
        };
    }
  }

  // ===== Submit =====
  const handleSubmit = async () => {
    try {
      const payload = buildPayload();
      const saved =
        isEdit && initial
          ? await updateQuestion({ id: initial.id, payload }).unwrap()
          : await createQuestion(payload).unwrap();
      onSaved?.(saved);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan pertanyaan.");
    }
  };

  // ===== UI renderer untuk opsi per type =====
  const renderOptions = () => {
    if (type === "multiple_choice" || type === "true_false") {
      const state = type === "true_false" ? optionsTF : optionsMC;
      const setState = type === "true_false" ? setOptionsTF : setOptionsMC;

      return (
        <Card>
          <CardContent className="space-y-4 pt-6">
            {state.map((opt, idx) => (
              <div key={idx} className="grid gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-2 uppercase">
                      {opt.option}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Point</span>
                    <Input
                      type="number"
                      className="w-24"
                      value={opt.point}
                      onChange={(e) => {
                        const v = [...state];
                        v[idx].point = Number(e.target.value || 0);
                        setState(v);
                      }}
                    />
                  </div>

                  {type === "multiple_choice" && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const v = [...state];
                        v.splice(idx, 1);
                        setState(v);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Label className="text-xs">Teks Opsi</Label>
                <SunEditor
                  setContents={opt.text}
                  onChange={(html: string) => {
                    const v = [...state];
                    v[idx].text = html;
                    setState(v);
                  }}
                  setOptions={{
                    minHeight: "120px",
                    maxHeight: "35vh",
                    buttonList: [
                      ["bold", "italic", "underline", "strike"],
                      ["fontColor", "hiliteColor"],
                      ["align", "list"],
                      ["link", "image"],
                      ["codeView"],
                    ],
                  }}
                  onImageUploadBefore={makeUploadHandler()}
                />
              </div>
            ))}

            {type === "multiple_choice" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const nextKey = String.fromCharCode(97 + state.length); // a,b,c...
                  setState([...state, { option: nextKey, text: "", point: 0 }]);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Opsi
              </Button>
            )}

            <div className="grid gap-2">
              <Label>Jawaban Benar</Label>
              <Input
                placeholder={
                  type === "true_false"
                    ? "Isi: a (True) atau b (False)"
                    : "Contoh: a"
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (type === "multiple_choice_multiple_answer") {
      return (
        <Card>
          <CardContent className="space-y-4 pt-6">
            {optionsMCMulti.map((opt, idx) => (
              <div key={idx} className="grid gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-2 uppercase">
                      {opt.option}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Point</span>
                    <Input
                      type="number"
                      className="w-24"
                      value={opt.point}
                      onChange={(e) => {
                        const v = [...optionsMCMulti];
                        v[idx].point = Number(e.target.value || 0);
                        setOptionsMCMulti(v);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const v = [...optionsMCMulti];
                      v.splice(idx, 1);
                      setOptionsMCMulti(v);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Label className="text-xs">Teks Opsi</Label>
                <SunEditor
                  setContents={opt.text}
                  onChange={(html: string) => {
                    const v = [...optionsMCMulti];
                    v[idx].text = html;
                    setOptionsMCMulti(v);
                  }}
                  setOptions={{
                    minHeight: "120px",
                    buttonList: [
                      ["bold", "italic", "underline", "strike"],
                      ["fontColor", "hiliteColor"],
                      ["align", "list"],
                      ["link", "image"],
                      ["codeView"],
                    ],
                  }}
                  onImageUploadBefore={makeUploadHandler()}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const nextKey = String.fromCharCode(97 + optionsMCMulti.length); // a,b,c...
                setOptionsMCMulti([
                  ...optionsMCMulti,
                  { option: nextKey, text: "", point: 0 },
                ]);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Tambah Opsi
            </Button>

            <div className="grid gap-2">
              <Label>Jawaban Benar (bisa banyak)</Label>
              <Input
                placeholder="Contoh: a,c,d"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Total Point</Label>
              <Input
                type="number"
                value={totalPoint}
                onChange={(e) => setTotalPoint(Number(e.target.value || 0))}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (type === "essay") {
      return (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-2">
              <Label>Jawaban</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Jawaban esai"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label>Total Point</Label>
              <Input
                type="number"
                className="w-32"
                value={totalPoint}
                onChange={(e) => setTotalPoint(Number(e.target.value || 0))}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (type === "multiple_choice_multiple_category") {
      return (
        <Card>
          <CardContent className="space-y-4 pt-6">
            {optionsCategorized.map((opt, idx) => (
              <div key={idx} className="grid gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">Point</div>
                    <Input
                      type="number"
                      className="w-24"
                      value={opt.point}
                      onChange={(e) => {
                        const v = [...optionsCategorized];
                        v[idx].point = Number(e.target.value || 0);
                        setOptionsCategorized(v);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={opt.accurate}
                        onCheckedChange={(v) => {
                          const arr = [...optionsCategorized];
                          arr[idx].accurate = v;
                          if (v) arr[idx].not_accurate = false;
                          setOptionsCategorized(arr);
                        }}
                      />
                      <span className="text-sm">Akurat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={opt.not_accurate}
                        onCheckedChange={(v) => {
                          const arr = [...optionsCategorized];
                          arr[idx].not_accurate = v;
                          if (v) arr[idx].accurate = false;
                          setOptionsCategorized(arr);
                        }}
                      />
                      <span className="text-sm">Tidak Akurat</span>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const arr = [...optionsCategorized];
                        arr.splice(idx, 1);
                        setOptionsCategorized(arr);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Label className="text-xs">Teks</Label>
                <SunEditor
                  setContents={opt.text}
                  onChange={(html: string) => {
                    const arr = [...optionsCategorized];
                    arr[idx].text = html;
                    setOptionsCategorized(arr);
                  }}
                  setOptions={{
                    minHeight: "120px",
                    buttonList: [
                      ["bold", "italic", "underline", "strike"],
                      ["fontColor", "hiliteColor"],
                      ["align", "list"],
                      ["link", "image"],
                      ["codeView"],
                    ],
                  }}
                  onImageUploadBefore={makeUploadHandler()}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOptionsCategorized([
                  ...optionsCategorized,
                  { text: "", point: 1, accurate: false, not_accurate: false },
                ])
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Tambah Item
            </Button>

            <div className="grid gap-2">
              <Label>Total Point</Label>
              <Input
                type="number"
                className="w-32"
                value={totalPoint}
                onChange={(e) => setTotalPoint(Number(e.target.value || 0))}
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category */}
      <div className="grid gap-2">
        <Label>Kategori</Label>
        <Combobox<CategoryQuestion>
          value={question_category_id}
          onChange={setCategoryId}
          data={categories}
          placeholder="Pilih kategori"
          getOptionLabel={(i) => `${i.name} (${i.code})`}
        />
      </div>

      {/* Type */}
      <div className="grid gap-2">
        <Label>Tipe Soal</Label>
        <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="essay">Essay</SelectItem>
            <SelectItem value="true_false">True / False</SelectItem>
            <SelectItem value="multiple_choice_multiple_answer">
              Multiple Choice (Multi Answer)
            </SelectItem>
            <SelectItem value="multiple_choice_multiple_category">
              Multiple Choice (Multi Category)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question (rich text) */}
      <div className="grid gap-2">
        <Label>Pertanyaan</Label>
        <SunEditor
          setContents={question}
          onChange={setQuestion}
          setOptions={{
            minHeight: "220px",
            buttonList: [
              ["undo", "redo"],
              ["bold", "italic", "underline", "strike", "removeFormat"],
              ["fontColor", "hiliteColor"],
              ["align", "list", "lineHeight"],
              ["link", "image", "table", "video"],
              ["codeView", "fullScreen"],
            ],
          }}
          onImageUploadBefore={makeUploadHandler()}
        />
      </div>

      {/* Options per type */}
      {renderOptions()}

      {/* Explanation */}
      <div className="grid gap-2">
        <Label>Penjelasan (opsional)</Label>
        <SunEditor
          setContents={explanation}
          onChange={setExplanation}
          setOptions={{
            minHeight: "160px",
            buttonList: [
              ["bold", "italic", "underline", "strike", "removeFormat"],
              ["fontColor", "hiliteColor"],
              ["align", "list"],
              ["link", "image"],
              ["codeView"],
            ],
          }}
          onImageUploadBefore={makeUploadHandler()}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => history.back()}
          disabled={submitting}
        >
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submittingText}
        </Button>
      </div>
    </div>
  );
}