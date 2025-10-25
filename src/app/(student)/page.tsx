"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  AlertCircle,
  User2,
} from "lucide-react";
import { Role } from "@/types/user";

/** ===== Helpers ===== */
type Session = {
  user: {
    name: string;
    email: string;
    id: number;
    token: string;
    roles: Role[];
  };
  expires: string;
};

// Simpel: ambil session dari sessionStorage/localStorage/cookie jika ada.
// Fallback ke contoh yang kamu kirim.
function useSession(): Session {
  const fallback: Session = {
    user: {
      name: "Soni Setiawan",
      email: "soni.setiawan.it07@gmail.com",
      id: 7,
      token: "49|I7WaGioM9u5Vx07mpk5ZGKvdOF9mJAMTrKzWU9cL89f6acb5",
      roles: [
        {
          id: 2,
          name: "user",
          guard_name: "api",
          created_at: "2025-10-02T09:59:47.000000Z",
          updated_at: "2025-10-02T09:59:47.000000Z",
        },
      ],
    },
    expires: "2125-09-29T10:55:29.577Z",
  };

  const [session, setSession] = useState<Session>(fallback);

  useEffect(() => {
    try {
      const fromSS =
        typeof window !== "undefined" &&
        (sessionStorage.getItem("session") || localStorage.getItem("session"));
      if (fromSS) setSession(JSON.parse(fromSS));
    } catch {
      setSession(fallback);
    }
  }, []);

  return session;
}

/** ===== Dummy data untuk contoh ===== */
const latestTests = [
  {
    title: "TO TKA 4 - Geografi",
    start: "23 October 2025 17:49:03",
    end: "23 October 2025 18:49:03",
    score: "-",
  },
  {
    title: "TO TKA 4 - Bahasa Indonesia Wajib",
    start: "21 October 2025 20:16:57",
    end: "23 October 2025 17:49:03",
    score: "4",
  },
  {
    title: "TO TKA 4 - Matematika Wajib",
    start: "19 October 2025 17:49:51",
    end: "19 October 2025 17:50:56",
    score: "20",
  },
  {
    title: "TO TKA 4 - Matematika Lanjut",
    start: "19 October 2025 15:37:38",
    end: "19 October 2025 15:38:57",
    score: "3",
  },
  {
    title: "TO TKA - Tes Login SMA 78",
    start: "16 September 2025 14:46:54",
    end: "29 September 2025 18:56:16",
    score: "0",
  },
];

export default function DashboardPage() {
  const { user } = useSession();

  // nilai tinggi & rendah (contoh hitung dari latestTests)
  const scores = useMemo(
    () =>
      latestTests
        .map((t) => (t.score === "-" ? null : Number(t.score)))
        .filter((n) => n !== null) as number[],
    []
  );

  const maxScore = scores.length ? Math.max(...scores) : null;
  const minScore = scores.length ? Math.min(...scores) : null;

  const maxMeta = latestTests.find(
    (t) => (t.score !== "-" ? Number(t.score) : null) === maxScore
  );
  const minMeta = latestTests.find(
    (t) => (t.score !== "-" ? Number(t.score) : null) === minScore
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(56,189,248,0.06),transparent_40%)]">
      {/* Layout grid: sidebar + main */}
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-[240px,1fr] md:gap-6">

        {/* ===== Main ===== */}
        <main className="space-y-6">
          {/* Welcome */}
          <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-zinc-100 shadow-sm backdrop-blur md:p-6">
            <div className="flex flex-wrap items-center gap-3 rounded-xl">
              <div className="inline-grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200">
                <User2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold md:text-xl">
                  Selamat Datang {user?.name}
                </p>
                <p className="truncate text-sm text-sky-700">{user?.email}</p>
              </div>
            </div>

            {/* Cards row */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Total Paket */}
              <Card
                tone="sky"
                title="Total Paket Saya"
                value="0"
                subtitle="—"
              />

              {/* Nilai Ujian Terbesar */}
              <Card
                tone="indigo"
                title="Nilai Ujian Terbesar"
                value={maxScore !== null ? String(maxScore) : "—"}
                subtitle={
                  maxMeta
                    ? `${maxMeta.title} • ${maxMeta.end}`
                    : "Belum ada nilai"
                }
                icon={<Trophy className="h-4 w-4" />}
              />

              {/* Nilai Ujian Terendah */}
              <Card
                tone="soft"
                title="Nilai Ujian Terendah"
                value={minScore !== null ? String(minScore) : "—"}
                subtitle={
                  minMeta
                    ? `${minMeta.title} • ${minMeta.end}`
                    : "Belum ada nilai"
                }
                icon={<AlertCircle className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Hasil Latihan Terbaru */}
          <div className="rounded-2xl bg-white/80 ring-1 ring-zinc-100 shadow-sm backdrop-blur">
            <div className="border-b border-zinc-100 px-4 py-3 md:px-6">
              <h3 className="font-semibold">Hasil Latihan Terbaru</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-sky-50/60 text-zinc-700">
                    <Th>Test</Th>
                    <Th>Mulai</Th>
                    <Th>Selesai</Th>
                    <Th align="right">Nilai</Th>
                  </tr>
                </thead>
                <tbody>
                  {latestTests.map((r, i) => (
                    <tr
                      key={r.title + i}
                      className={i % 2 ? "bg-zinc-50/40" : "bg-white/50"}
                    >
                      <Td>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-500/70" />
                          {r.title}
                        </span>
                      </Td>
                      <Td>{r.start}</Td>
                      <Td>{r.end}</Td>
                      <Td align="right">
                        <span
                          className={`inline-flex min-w-[36px] justify-center rounded-md px-2 py-0.5 font-semibold ${
                            r.score === "-"
                              ? "bg-zinc-100 text-zinc-500"
                              : "bg-indigo-600/10 text-indigo-700 ring-1 ring-indigo-600/15"
                          }`}
                        >
                          {r.score}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Card({
  tone,
  title,
  value,
  subtitle,
  icon,
}: {
  tone: "sky" | "indigo" | "soft";
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  const theme =
    tone === "sky"
      ? {
          wrap: "bg-sky-100/70 ring-sky-200/70",
          value: "text-sky-700",
          chip: "bg-white/60 text-sky-700 ring-1 ring-white/70",
        }
      : tone === "indigo"
      ? {
          wrap: "bg-indigo-700 text-white ring-indigo-800/60",
          value: "text-white",
          chip: "bg-white/10 text-white/90 ring-1 ring-white/20",
        }
      : {
          wrap: "bg-zinc-100/70 ring-zinc-200/80",
          value: "text-zinc-900",
          chip: "bg-sky-600/10 text-sky-700 ring-1 ring-sky-600/20",
        };

  return (
    <div className={`rounded-2xl p-4 ring-1 shadow-sm ${theme.wrap}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm/5 font-medium opacity-80">{title}</p>
          <div className={`mt-1 text-4xl font-semibold ${theme.value}`}>
            {value}
          </div>
          {subtitle && <p className="mt-1 text-xs opacity-80">{subtitle}</p>}
        </div>
        {icon && <div className={`rounded-xl p-2 ${theme.chip}`}>{icon}</div>}
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-3 text-zinc-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}