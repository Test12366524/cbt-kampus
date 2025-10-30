"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ArrowLeft, Search } from "lucide-react";
import Pager from "@/components/ui/tryout-pagination";
import { formatDate } from "@/lib/format-utils";

import { useGetParticipantHistoryListQuery } from "@/services/student/tryout.service";
import type { ParticipantHistoryItem } from "@/types/student/tryout";

export default function RankStudentPage() {
  const router = useRouter();
  const params = useSearchParams();

  const testIdRaw = params.get("test_id");
  const testId = testIdRaw ? Number(testIdRaw) : NaN;

  const [page, setPage] = useState(1);
  const [paginate, setPaginate] = useState(10);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // debounce cari
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // validasi test_id
  useEffect(() => {
    if (!testId || Number.isNaN(testId)) {
      void Swal.fire({
        icon: "error",
        title: "Parameter tidak valid",
        text: "test_id tidak ditemukan.",
      }).then(() => router.back());
    }
  }, [testId, router]);

  // service: urut berdasarkan grade
  const { data, isFetching, refetch } = useGetParticipantHistoryListQuery(
    { page, paginate, orderBy: "grade", test_id: testId, search: query },
    { skip: !testId || Number.isNaN(testId) }
  );

  const rows: ParticipantHistoryItem[] = useMemo(
    () => data?.data ?? [],
    [data]
  );

  return (
    <div className="space-y-6">
      {/* Hero (blue sky) */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-500 via-sky-400 to-sky-600 p-6 text-white shadow-lg ring-1 ring-white/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Peringkat Tryout
            </h1>
            <p className="mt-1 text-sm text-white/90">
              Urutan peserta berdasarkan nilai tertinggi.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-white/10 text-white hover:bg-white/20 border-white/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
              <Input
                placeholder="Cari nama/email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refetch()}
                className="rounded-xl border-0 bg-white px-9 py-2 text-slate-900 shadow-sm outline-none ring-2 ring-transparent focus:ring-sky-300"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <select
              className="h-9 rounded-md border-0 bg-white px-3 text-slate-900 shadow-sm outline-none ring-2 ring-transparent focus:ring-sky-300"
              value={paginate}
              onChange={(e) => {
                setPaginate(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10 / halaman</option>
              <option value={15}>15 / halaman</option>
              <option value={25}>25 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>

            <Button
              variant="outline"
              onClick={() => refetch()}
              className="bg-white/10 text-white hover:bg-white/20 border-white/30"
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {/* Tabel (putih) */}
      <section className="rounded-3xl border bg-white p-4 shadow-sm ring-1 ring-sky-50">
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-sky-50 text-sky-900">
              <tr className="text-left">
                <th className="p-3">No</th>
                <th className="p-3">Peserta</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Mulai</th>
                <th className="p-3">Selesai</th>
              </tr>
            </thead>
            <tbody>
              {isFetching && rows.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan={7}>
                    Memuat…
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((r, idx) => {
                  const rankNumber = (page - 1) * paginate + (idx + 1);
                  const isCompleted = Boolean(r.end_date);
                  return (
                    <tr key={r.id} className="border-t hover:bg-sky-50/40">
                      <td className="p-3 font-medium text-sky-900">
                        {rankNumber}
                      </td>
                      <td className="p-3">{r.participant_name}</td>
                      <td className="p-3">{r.participant_email}</td>
                      <td className="p-3">
                        {isCompleted ? (
                          <Badge className="bg-sky-600 text-white hover:bg-sky-700">
                            Finished
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-sky-700 border-sky-200"
                          >
                            On going
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        {r.start_date ? formatDate(r.start_date) : "-"}
                      </td>
                      <td className="p-3">
                        {r.end_date ? formatDate(r.end_date) : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="p-4" colSpan={7}>
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
      </section>
    </div>
  );
}