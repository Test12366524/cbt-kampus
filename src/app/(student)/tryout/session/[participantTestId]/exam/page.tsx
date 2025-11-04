"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useContinueTestMutation,
  useContinueCategoryMutation,
  useEndCategoryMutation,
  useEndSessionMutation,
  useSaveAnswerMutation,
  useResetAnswerMutation,
  useFlagQuestionMutation,
} from "@/services/student/tryout.service";
import type {
  ParticipantAnswer,
  QuestionDetails,
  QuestionDetailsMC,
  QuestionDetailsEssay,
  QuestionDetailsCategorized,
  QuestionType,
  ContinueTestData,
} from "@/types/student/tryout";
import {
  Loader2,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import ExamGuard from "@/components/anti-cheat-guards";
import SanitizedHtml from "@/components/sanitized-html";
import RichTextView from "@/components/ui/rich-text-view";

/** ===== Util types (tanpa any) ===== */
type MinimalTestDetails = {
  title?: string;
  timer_type?: "per_test" | "per_category" | string;
  total_time?: number; // detik (per_test)
  remaining_seconds?: number; // sisa waktu dari server (jika ada)
};

/** Format detik => HH:MM:SS */
function formatHMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Key penyimpanan deadline di localStorage */
function timerStorageKey(participantTestId: number, categoryId: string | null) {
  return categoryId
    ? `tryout:endAt:${participantTestId}:cat:${categoryId}`
    : `tryout:endAt:${participantTestId}`;
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams<{ participantTestId: string }>();
  const participantTestId = Number(params.participantTestId);
  const sp = useSearchParams();
  const categoryId = sp.get("category");

  const [loadTest, { isLoading: loadingTest }] = useContinueTestMutation();
  const [loadCategory, { isLoading: loadingCat }] =
    useContinueCategoryMutation();
  const [endCategory, { isLoading: endingCat }] = useEndCategoryMutation();
  const [endSession, { isLoading: endingSess }] = useEndSessionMutation();

  const [saveAnswer, { isLoading: saving }] = useSaveAnswerMutation();
  const [resetAnswer, { isLoading: resetting }] = useResetAnswerMutation();
  const [flagQuestion, { isLoading: flagging }] = useFlagQuestionMutation();

  const [data, setData] = useState<ContinueTestData | null>(null);
  const lastSaveRef = useRef<Promise<unknown> | null>(null);

  // 🔐 baru: state untuk nentuin ExamGuard dipakai atau enggak
  const [useGuard, setUseGuard] = useState(false);

  // ====== LOAD DATA ======
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = categoryId
          ? await loadCategory({
              participant_test_id: participantTestId,
              participant_category_id: Number(categoryId),
            }).unwrap()
          : await loadTest(participantTestId).unwrap();
        if (mounted) setData(res);
      } catch (e) {
        await Swal.fire({
          icon: "error",
          title: "Gagal memuat soal",
          text: e instanceof Error ? e.message : "Coba lagi beberapa saat.",
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [categoryId, loadCategory, loadTest, participantTestId]);

  // 🔐 deteksi device: desktop/laptop saja yang pakai guard
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    // deteksi umum mobile / tablet
    const isMobileOrTablet =
      /android|iphone|ipad|ipod|windows phone|mobile|tablet/.test(ua);

    // jaga-jaga kalau user agent gak jelas, pakai lebar layar
    const isSmallScreen = window.innerWidth < 1024;

    // kalau bukan mobile/tablet dan layarnya cukup besar → pakai guard
    if (!isMobileOrTablet && !isSmallScreen) {
      setUseGuard(true);
    } else {
      setUseGuard(false);
    }
  }, []);

  // ====== FLATTEN QUESTIONS ======
  const flat: ParticipantAnswer[] = useMemo(() => {
    if (!data) return [];
    const arr: ParticipantAnswer[] = [];
    for (const g of data.questions) for (const q of g.questions) arr.push(q);
    return arr;
  }, [data]);

  const [idx, setIdx] = useState<number>(0);
  useEffect(() => setIdx(0), [flat.length]);

  const current = flat[idx] ?? null;
  const isFirst = idx === 0;
  const isLast = idx === flat.length - 1;

  // ====== LOCAL PATCH HELPER ======
  function patchCurrent(upd: Partial<ParticipantAnswer>) {
    setData((prev) => {
      if (!prev || !current) return prev;
      const copied: ContinueTestData = {
        ...prev,
        questions: prev.questions.map((grp) => ({
          ...grp,
          questions: grp.questions.map((q) =>
            q.question_id === current.question_id ? { ...q, ...upd } : q
          ),
        })),
      };
      return copied;
    });
  }

  // ====== ANSWER ACTIONS ======
  async function handleSave(answer: string, type: QuestionType) {
    if (!current) return;
    const p = saveAnswer({
      participant_test_id: participantTestId,
      payload: { question_id: current.question_id, type, answer },
    })
      .unwrap()
      .then(() => patchCurrent({ user_answer: answer }))
      .catch(async (e) => {
        await Swal.fire({
          icon: "error",
          title: "Gagal menyimpan jawaban",
          text: e instanceof Error ? e.message : "Coba lagi.",
        });
      });

    lastSaveRef.current = p;
    return p;
  }

  async function handleReset() {
    if (!current) return;
    try {
      await resetAnswer({
        participant_test_id: participantTestId,
        payload: { question_id: current.question_id },
      }).unwrap();
      patchCurrent({ user_answer: null, is_correct: null, point: null });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal mereset jawaban",
        text: e instanceof Error ? e.message : "Coba lagi.",
      });
    }
  }

  async function handleFlag(toggle: boolean) {
    if (!current) return;
    try {
      await flagQuestion({
        participant_test_id: participantTestId,
        payload: { question_id: current.question_id, is_flagged: toggle },
      }).unwrap();
      patchCurrent({ is_flagged: toggle });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "Gagal mengubah tanda",
        text: e instanceof Error ? e.message : "Coba lagi.",
      });
    }
  }

  async function handleFinishCategory() {
    try {
      if (lastSaveRef.current) {
        await lastSaveRef.current.catch(() => {});
      }

      void Swal.fire({
        title: "Mengakhiri sesi…",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const activeCatId =
        data?.category?.id ??
        new URLSearchParams(window.location.search).get("category");

      if (activeCatId) {
        const res = await endCategory({
          participant_test_id: participantTestId,
          participant_category_id: Number(activeCatId),
        }).unwrap();

        Swal.close();

        if ("next_category" in res) {
          await Swal.fire({
            icon: "success",
            title: "Kategori selesai",
            text: "Melanjutkan ke kategori berikutnya…",
            timer: 800,
            showConfirmButton: false,
          });
          router.replace(`/tryout/session/${participantTestId}/start`);
        } else {
          await Swal.fire({
            icon: "success",
            title: "Sesi selesai",
            timer: 700,
            showConfirmButton: false,
          });
          router.replace(`/tryout/result/${res.test_id}?justFinished=1`);
        }
      } else {
        const done = await endSession(participantTestId).unwrap();
        Swal.close();
        await Swal.fire({
          icon: "success",
          title: "Sesi selesai",
          timer: 700,
          showConfirmButton: false,
        });
        router.replace(`/tryout/result/${done.test_id}?justFinished=1`);
      }
    } catch (e) {
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Gagal mengakhiri sesi",
        text: e instanceof Error ? e.message : "Coba lagi.",
      });
    }
  }

  // ====== COUNTDOWN LOGIC (deadline absolut + persist) ======
  const testDetails: Partial<MinimalTestDetails> | undefined = useMemo(() => {
    return (data?.test?.test_details ?? undefined) as
      | Partial<MinimalTestDetails>
      | undefined;
  }, [data]);

  /** Hitung detik awal dari server (prioritas remaining_seconds) atau total_time (per_test) */
  const serverInitialSeconds = useMemo<number>(() => {
    const rem = testDetails?.remaining_seconds;
    if (typeof rem === "number" && rem > 0) return rem;

    if (
      testDetails?.timer_type === "per_test" &&
      typeof testDetails.total_time === "number"
    ) {
      return Math.max(0, testDetails.total_time);
    }
    return 0;
  }, [testDetails]);

  // Simpan deadline absolut di localStorage agar tetap berjalan walau user keluar halaman/tab
  const endAtRef = useRef<number>(0);
  const finishingRef = useRef<boolean>(false);
  const [remaining, setRemaining] = useState<number>(0);

  // Inisialisasi / sinkronisasi deadline absolut
  useEffect(() => {
    const key = timerStorageKey(participantTestId, categoryId);
    const now = Date.now();

    // Jika server beri remaining_seconds, selalu prioritaskan itu (sinkron)
    if (serverInitialSeconds > 0) {
      const deadline = now + serverInitialSeconds * 1000;
      endAtRef.current = deadline;
      try {
        localStorage.setItem(key, String(deadline));
      } catch {}
    } else {
      // Kalau tidak ada dari server, coba baca dari storage
      let fromStorage = 0;
      try {
        const raw = localStorage.getItem(key);
        if (raw) fromStorage = Number(raw);
      } catch {}

      // Validasi deadline (maks 24 jam ke depan supaya tidak usang)
      if (
        fromStorage &&
        fromStorage > now &&
        fromStorage - now < 24 * 3600 * 1000
      ) {
        endAtRef.current = fromStorage;
      } else {
        endAtRef.current = 0; // tidak ada timer
      }
    }

    // Set sisa awal
    const diff = endAtRef.current
      ? Math.ceil((endAtRef.current - now) / 1000)
      : 0;
    setRemaining(Math.max(0, diff));

    // Jika sudah negatif/0 saat mount (misal user kembali saat waktu habis), auto finish
    if (endAtRef.current && diff <= 0 && !finishingRef.current) {
      finishingRef.current = true;
      void handleFinishCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantTestId, categoryId, serverInitialSeconds]);

  // Interval yang menghitung ulang berdasarkan endAt absolut
  useEffect(() => {
    if (!endAtRef.current) return; // tidak ada timer
    const tick = () => {
      const now = Date.now();
      const left = Math.ceil((endAtRef.current - now) / 1000);
      const safeLeft = Math.max(0, left);
      setRemaining(safeLeft);
      if (safeLeft <= 0 && !finishingRef.current) {
        finishingRef.current = true;
        void handleFinishCategory();
      }
    };

    // Jalankan 1x dulu biar UI responsif
    tick();
    const id = setInterval(tick, 1000);

    // Sinkron saat tab aktif kembali
    const onVis = () => tick();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAtRef.current]);

  const hasTimer = endAtRef.current > 0;
  const timerString = hasTimer ? formatHMS(remaining) : null;
  const timerDanger = hasTimer && remaining <= 60;

  // ====== RIGHT NAV BADGES ======
  const navBadges = flat.map((q, i) => {
    const isActive = i === idx;
    const answered = (q.user_answer ?? "").length > 0;
    const flagged = !!q.is_flagged;

    let cls =
      "rounded-lg px-2 py-1 text-xs font-semibold ring-1 transition select-none";
    if (isActive) cls += " bg-sky-600 text-white ring-sky-500 shadow-sm";
    else if (flagged) cls += " bg-yellow-100 text-yellow-800 ring-yellow-300";
    else if (answered) cls += " bg-sky-100 text-sky-700 ring-sky-300";
    else cls += " bg-zinc-50 text-zinc-700 ring-zinc-200";

    return (
      <button key={q.question_id} onClick={() => setIdx(i)} className={cls}>
        {i + 1}
      </button>
    );
  });

  // ====== CONTENT UTAMA (tanpa guard) ======
  const content = (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/tryout" className="text-sm text-zinc-600 hover:underline">
          &larr; Kembali ke Tryout
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-sm text-zinc-500">
            {testDetails?.title ?? data?.test?.test_details?.title ?? "Tryout"}
          </div>

          {hasTimer && (
            <Badge
              variant="outline"
              className={`flex items-center gap-2 border-2 ${
                timerDanger
                  ? "border-red-400 text-red-600"
                  : "border-sky-300 text-sky-700"
              }`}
            >
              <Clock3 className="h-4 w-4" />
              <span className="tabular-nums font-mono">{timerString}</span>
            </Badge>
          )}
        </div>

        <div />
      </div>

      {/* Layout: left content + right aside */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          {(loadingCat || loadingTest) && !data ? (
            <div className="flex h-40 items-center justify-center text-zinc-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memuat soal…
            </div>
          ) : !current ? (
            <div className="text-zinc-600">Tidak ada soal.</div>
          ) : (
            <>
              {/* Header action */}
              <div className="mb-5 flex items-center justify-between">
                <div className="text-sm text-sky-700">
                  Soal {idx + 1} / {flat.length}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      current.is_flagged
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-zinc-50"
                    }
                  >
                    {current.is_flagged ? "Ditandai" : "Tidak ditandai"}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => handleFlag(!current.is_flagged)}
                    disabled={flagging}
                    className={
                      current.is_flagged
                        ? "border-yellow-500 text-yellow-700"
                        : undefined
                    }
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    {current.is_flagged ? "Hapus Tanda" : "Tandai Soal"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={resetting}
                  >
                    Reset Jawaban
                  </Button>
                </div>
              </div>

              {/* Pertanyaan */}
              <div className="prose prose-sm max-w-none">
                <RichTextView html={(current.question_details as QuestionDetails).question} />
              </div>

              {/* Opsi/Jawaban */}
              <div className="mt-5">
                <AnswerRenderer
                  key={current.question_id} // remount saat pindah soal
                  current={current}
                  onSave={handleSave}
                  saving={saving}
                />
              </div>

              {/* Nav Prev/Next */}
              <div className="mt-8 flex items-center justify-between">
                {!isFirst ? (
                  <Button
                    variant="outline"
                    onClick={() => setIdx((v) => v - 1)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Sebelumnya
                  </Button>
                ) : (
                  <div />
                )}
                {!isLast && (
                  <Button
                    variant="outline"
                    onClick={() => setIdx((v) => v + 1)}
                  >
                    Selanjutnya
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </section>

        {/* Right (sticky aside) */}
        <aside className="top-24 h-max rounded-3xl border bg-white p-4 shadow-sm lg:sticky">
          {/* Big Timer */}
          {hasTimer && (
            <div
              className={`mb-4 rounded-2xl border p-4 text-center ${
                timerDanger
                  ? "border-red-200 bg-red-50"
                  : "border-sky-200 bg-sky-50"
              }`}
            >
              <div className="mb-1 text-xs font-semibold text-zinc-600">
                Sisa Waktu
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock3
                  className={
                    timerDanger
                      ? "h-5 w-5 text-red-600"
                      : "h-5 w-5 text-sky-700"
                  }
                />
                <div
                  className={`font-mono text-2xl tabular-nums ${
                    timerDanger ? "text-red-700" : "text-sky-800"
                  }`}
                >
                  {timerString}
                </div>
              </div>
            </div>
          )}

          <div className="mb-3 text-sm font-semibold text-zinc-700">
            Sudah Selesai?
          </div>
          <Button
            onClick={handleFinishCategory}
            disabled={endingCat || endingSess}
            className="mb-4 w-full justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Selesaikan Sesi
          </Button>

          <div className="mb-2 text-xs font-semibold text-zinc-600">
            Nomor Soal
          </div>
          <div className="grid grid-cols-5 gap-2">{navBadges}</div>

          <div className="mt-4 space-y-2 text-[11px] text-zinc-500">
            <div>
              <span className="mr-2 inline-block h-3 w-3 rounded bg-sky-200" />
              Terjawab
            </div>
            <div>
              <span className="mr-2 inline-block h-3 w-3 rounded bg-yellow-300" />
              Ditandai
            </div>
            <div>
              <span className="mr-2 inline-block h-3 w-3 rounded bg-zinc-200" />
              Kosong
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  // 👉 di sini baru diputusin: pakai guard atau tidak
  if (useGuard) {
    return (
      <ExamGuard
        maxViolations={3}
        enforceFullscreen
        protectBeforeUnload
        onViolation={(c) => {
          void c;
        }}
        onMaxViolation={() => {
          void handleFinishCategory();
        }}
      >
        {content}
      </ExamGuard>
    );
  }

  // mobile/tablet → langsung render tanpa guard
  return content;
}

/** Renderer per tipe soal */
function AnswerRenderer({
  current,
  onSave,
  saving,
}: {
  current: ParticipantAnswer;
  onSave: (answer: string, type: QuestionType) => Promise<void> | void;
  saving: boolean;
}) {
  const det = current.question_details;

  if (det.type === "essay") {
    const d = det as QuestionDetailsEssay;
    return (
      <EssayControl
        questionId={current.question_id}
        initial={current.user_answer ?? ""}
        onSubmit={(value) => onSave(value, d.type)}
        saving={saving}
      />
    );
  }

  if (
    det.type === "multiple_choice" ||
    det.type === "true_false" ||
    det.type === "multiple_choice_multiple_answer"
  ) {
    const d = det as QuestionDetailsMC;
    return (
      <MCControl
        questionId={current.question_id}
        type={d.type}
        options={d.options}
        multiple={d.type === "multiple_choice_multiple_answer"}
        initial={current.user_answer ?? ""}
        onSubmit={(value) => onSave(value, d.type)}
        saving={saving}
      />
    );
  }

  if (det.type === "multiple_choice_multiple_category") {
    const d = det as QuestionDetailsCategorized;
    return (
      <CategorizedControl
        questionId={current.question_id}
        options={d.options}
        initial={current.user_answer ?? ""}
        onSubmit={(value) => onSave(value, d.type)}
        saving={saving}
      />
    );
  }

  return null;
}

/* === Controls === */

function MCControl({
  questionId,
  options,
  multiple,
  initial,
  onSubmit,
  saving,
}: {
  questionId: number;
  type: "multiple_choice" | "true_false" | "multiple_choice_multiple_answer";
  options: { option: string; text: string; point: number }[];
  multiple: boolean;
  initial: string;
  onSubmit: (value: string) => void | Promise<void>;
  saving: boolean;
}) {
  const [value, setValue] = useState<string[]>(
    multiple ? (initial ? initial.split(",") : []) : initial ? [initial] : []
  );

  useEffect(() => {
    setValue(
      multiple ? (initial ? initial.split(",") : []) : initial ? [initial] : []
    );
  }, [initial, multiple, questionId]);

  const name = `mc-${questionId}`;

  const apply = (next: string[]) => {
    setValue(next);
    const joined = multiple ? next.join(",") : next[0] ?? "";
    onSubmit(joined); // autosave
  };

  return (
    <div className="space-y-3">
      {options.map((o) => {
        const checked = value.includes(o.option);
        return (
          <label
            key={o.option}
            className="flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 hover:bg-zinc-50"
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              className="mt-1"
              checked={checked}
              onChange={() => {
                if (multiple) {
                  apply(
                    checked
                      ? value.filter((v) => v !== o.option)
                      : [...value, o.option]
                  );
                } else {
                  apply([o.option]);
                }
              }}
            />
            <RichTextView html={o.text} />
          </label>
        );
      })}

      <Button
        className="mt-2 rounded-xl bg-sky-600 hover:bg-sky-700"
        onClick={() => onSubmit(multiple ? value.join(",") : value[0] ?? "")}
        disabled={saving}
      >
        Simpan Jawaban
      </Button>
    </div>
  );
}

function EssayControl({
  questionId,
  initial,
  onSubmit,
  saving,
}: {
  questionId: number;
  initial: string;
  onSubmit: (value: string) => void | Promise<void>;
  saving: boolean;
}) {
  const [text, setText] = useState<string>(initial);
  useEffect(() => setText(initial), [initial, questionId]);

  return (
    <div>
      <textarea
        className="min-h-[140px] w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-sky-300"
        placeholder="Tulis jawaban..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onSubmit(text)} // autosave saat keluar field
      />
      <Button
        className="mt-3 rounded-xl bg-sky-600 hover:bg-sky-700"
        onClick={() => onSubmit(text)}
        disabled={saving}
      >
        Simpan Jawaban
      </Button>
    </div>
  );
}

function CategorizedControl({
  questionId,
  options,
  initial,
  onSubmit,
  saving,
}: {
  questionId: number;
  options: {
    text: string;
    accurate: boolean;
    not_accurate: boolean;
    point: number;
  }[];
  initial: string;
  onSubmit: (value: string) => void | Promise<void>;
  saving: boolean;
}) {
  const init = initial ? initial.split(",") : Array(options.length).fill("");
  const [choices, setChoices] = useState<string[]>(
    init.length === options.length ? init : Array(options.length).fill("")
  );

  useEffect(() => {
    const next = initial ? initial.split(",") : Array(options.length).fill("");
    setChoices(
      next.length === options.length ? next : Array(options.length).fill("")
    );
  }, [initial, questionId, options.length]);

  const setAndSave = (i: number, v: "accurate" | "not_accurate") => {
    setChoices((prev) => {
      const n = [...prev];
      n[i] = v;
      onSubmit(n.join(",")); // autosave
      return n;
    });
  };

  return (
    <div className="space-y-3">
      {options.map((o, i) => {
        const name = `cat-${questionId}-${i}`;
        return (
          <div key={i} className="rounded-xl border p-3">
            <SanitizedHtml
              className="prose prose-sm max-w-none"
              html={o.text}
            />
            <div className="mt-2 flex items-center gap-5">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={name}
                  checked={choices[i] === "accurate"}
                  onChange={() => setAndSave(i, "accurate")}
                />
                Akurat
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name={name}
                  checked={choices[i] === "not_accurate"}
                  onChange={() => setAndSave(i, "not_accurate")}
                />
                Tidak Akurat
              </label>
            </div>
          </div>
        );
      })}

      <Button
        className="rounded-xl bg-sky-600 hover:bg-sky-700"
        onClick={() => onSubmit(choices.join(","))}
        disabled={saving}
      >
        Simpan Jawaban
      </Button>
    </div>
  );
}