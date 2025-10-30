"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function TryoutFinishedPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border bg-white p-8 text-center shadow">
      <h1 className="text-2xl font-semibold">
        Yeay! Kamu telah menyelesaikan tryout ini.
      </h1>
      <p className="text-sm text-muted-foreground">
        Kamu hanya bisa mengerjakan tryout ini sekali. Silakan tunggu hasil
        penilaian dari sistem.
      </p>
      <div className="flex justify-center">
        <Button
          className="rounded-xl bg-sky-600 hover:bg-sky-700"
          onClick={() => router.push("/tryout")}
        >
          Kembali ke Tryout
        </Button>
      </div>
    </div>
  );
}