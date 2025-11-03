"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ArrowLeft, Eye } from "lucide-react";
import Pager from "@/components/ui/tryout-pagination";

import { useGetParticipantHistoryListQuery } from "@/services/student/tryout.service";
import type { ParticipantHistoryItem } from "@/types/student/tryout";
import { ParticipantHistoryDetail } from "../../../../components/modal/detail/page";
import { ParticipantHistoryDetailPG } from "../../../../components/modal/detail-pg/page";

export default function RankPage() {
  const router = useRouter();
  const params = useSearchParams();

  const testIdRaw = params.get("test_id");
  const testId = testIdRaw ? Number(testIdRaw) : NaN;

  const [page, setPage] = useState(1);
  const [paginate, setPaginate] = useState(10);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // detail
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | null
  >(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPGOpen, setDetailPGOpen] = useState(false);

  // debounce input cari
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!testId || Number.isNaN(testId)) {
      void Swal.fire({
        icon: "error",
        title: "Parameter tidak valid",
        text: "test_id tidak ditemukan.",
      }).then(() => router.back());
    }
  }, [testId, router]);

  const { data, isFetching, refetch } = useGetParticipantHistoryListQuery(
    { page, paginate, orderBy: "grade", test_id: testId, search: query },
    { skip: !testId || Number.isNaN(testId) }
  );

  const rows: ParticipantHistoryItem[] = useMemo(
    () => data?.data ?? [],
    [data]
  );

  return (
    <>
      <SiteHeader title="Ranking Tryout" />

      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Peringkat Peserta</CardTitle>
            <div className="flex flex-wrap gap-2 md:flex-nowrap">
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-sm text-muted-foreground">Records</span>
                <select
                  className="h-9 rounded-md border bg-background px-2"
                  value={paginate}
                  onChange={(e) => {
                    setPaginate(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Cari nama/email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && refetch()}
                  className="w-56"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                    refetch();
                  }}
                >
                  Reset
                </Button>
                <Button variant="outline" onClick={() => refetch()}>
                  {isFetching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3">No</th>
                    <th className="p-3">Peserta</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Nilai</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetching && rows.length === 0 ? (
                    <tr>
                      <td className="p-4" colSpan={8}>
                        Memuat…
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((r, idx) => {
                      const rankNumber = (page - 1) * paginate + (idx + 1);
                      const isCompleted = Boolean(r.end_date);

                      return (
                        <tr key={r.id} className="border-t">
                          <td className="p-3 font-medium">{rankNumber}</td>
                          <td className="p-3">{r.participant_name}</td>
                          <td className="p-3">{r.participant_email}</td>
                          <td className="p-3">
                            <Badge variant="secondary">{r.grade}</Badge>
                          </td>
                          <td className="p-3">
                            {isCompleted ? (
                              <Badge>Finished</Badge>
                            ) : (
                              <Badge variant="outline">On going</Badge>
                            )}
                          </td>
                          <td className="p-3 text-right gap-1 inline-flex">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedParticipantId(r.id);
                                setDetailPGOpen(true);
                              }}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Detail PG
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedParticipantId(r.id);
                                setDetailOpen(true);
                              }}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Detail Essay
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="p-4" colSpan={8}>
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <Pager
                page={data?.current_page ?? 1}
                lastPage={data?.last_page ?? 1}
                onChange={setPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* dialog detail */}
      <ParticipantHistoryDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        participantTestId={selectedParticipantId}
        testId={testId}
      />

      {/* dialog detail pg */}
      <ParticipantHistoryDetailPG
        open={detailPGOpen}
        onOpenChange={setDetailPGOpen}
        participantTestId={selectedParticipantId}
        testId={testId}
      />
    </>
  );
}
