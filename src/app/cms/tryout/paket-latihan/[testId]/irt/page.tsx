// app/(cms)/cms/tryout/paket-latihan/[testId]/irt/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  useGetTestIRTQuery,
  useComputeTestIRTMutation,
} from "@/services/tryout/irt.service";

import { Button } from "@/components/ui/button";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function IRTEvalPage() {
  const params = useParams<{ testId: string }>();
  const testId = Number(params.testId);
  const router = useRouter();

  const { data, isLoading, refetch } = useGetTestIRTQuery(testId);
  const [compute, { isLoading: running }] = useComputeTestIRTMutation();

  const start = async () => {
    try {
      await compute({ test_id: testId, payload: {} }).unwrap();
      await Swal.fire({
        icon: "success",
        title: "Penilaian IRT dimulai / diperbarui",
      });
      refetch();
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Gagal", text: String(e) });
    }
  };

  return (
    <>
      <SiteHeader title="Penilaian IRT" />{" "}
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-semibold">Penilaian IRT</h1>
        </div>

        {isLoading ? (
          <div>Loading…</div>
        ) : data ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-3">
                  <span>{data.test.title}</span>
                  <Button onClick={start} disabled={running}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Penilaian IRT
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  Total Participant Submit:{" "}
                  <b>{data.total_participant_submit}</b>
                </div>
              </CardContent>
            </Card>

            {data.questions.map((c) => (
              <Card key={c.category_id}>
                <CardHeader>
                  <CardTitle>
                    {c.category}{" "}
                    <span className="text-muted-foreground">
                      ({c.category_code})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    Total Soal: <b>{c.questions.length}</b>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <div>Data tidak tersedia.</div>
        )}
      </div>
    </>
  );
}