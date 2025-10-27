"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  BadgeCheck,
  XCircle,
  Shield,
  CalendarClock,
  User2,
  GraduationCap,
  Printer,
} from "lucide-react";

import { useGetMeQuery } from "@/services/auth.service";
import type { User, Role } from "@/types/user";

/** ====== Extra types dari contoh /me (ditambah nim, dll supaya aman) ====== */
type School = {
  id: number;
  province_id: string | null;
  regency_id: string | null;
  district_id: string | null;
  village_id: string | null;
  name: string;
  description: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
};

type ClassInfo = {
  id: number;
  name?: string | null;
} | null;

type Student = {
  id: number;
  user_id: number;
  school_id: number | null;
  class_id: number | null;
  status: boolean | number;
  created_at: string;
  updated_at: string;

  // kemungkinan dikirim backend:
  nim?: string | number | null;
  password?: string | number | null;
  session?: string | number | null;
  room?: string | number | null;

  // kadang backend kirim nama langsung
  school_name?: string | null;
  class_name?: string | null;

  // relasi
  school?: School;
  class?: ClassInfo;
};

type Me = User & { student?: Student };

/** ====== Utils ====== */
function fmt(iso?: string | null, withTime = true) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: withTime ? "short" : undefined,
    timeZone: "Asia/Jakarta",
  }).format(d);
}

function VerifiedBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
      <BadgeCheck className="h-3.5 w-3.5" />
      Terverifikasi
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
      <XCircle className="h-3.5 w-3.5" />
      Belum verifikasi
    </span>
  );
}

function Row({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-zinc-100 py-3 last:border-0 md:grid-cols-[220px,1fr]">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
        {icon ? <span className="text-zinc-500">{icon}</span> : null}
        {label}
      </div>
      <div className="text-zinc-900">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
      {children}
    </span>
  );
}

/** ====== Kartu Mahasiswa (preview + print) ====== */
function StudentCard({ me }: { me: Me }) {
  const s = me.student;
  const nim = String(s?.nim ?? "—");
  const name = me.name ?? "—";
  const kelas = s?.class_name ?? s?.class?.name ?? "—";
  const prodi = s?.school_name ?? s?.school?.name ?? "—";
  const sesi = s?.session ?? "—";
  const ruang = s?.room ?? "—";
  const pwd = s?.password ?? "—";

  const buildPrintHTML = () => `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Kartu Mahasiswa</title>
<style>
  @page { size: A4; margin: 16mm }
  *{box-sizing:border-box}
  body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#0f172a;}
  .wrap{border-radius:16px; overflow:hidden; border:2px solid #e2e8f0;}
  .hdr{padding:18px 20px; background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%); color:#fff; text-align:center; position:relative}
  .brand{position:absolute; left:18px; top:12px; width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-weight:800;letter-spacing:.5px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.26)}
  .title{font-size:18px;font-weight:800;letter-spacing:.6px}
  .subtitle{font-size:12px;font-weight:700;opacity:.95;margin-top:2px}
  .period{font-size:11px;opacity:.9;margin-top:2px}
  .body{padding:18px 20px;background:#fff}
  .box{border:1.5px solid #e2e8f0;border-radius:14px;padding:16px;background: radial-gradient(80% 80% at 0% 0%, #f8fafc 0%, #ffffff 50%)}
  .row{display:flex;gap:18px}
  .col{flex:1}
  .kv{display:flex;gap:10px;align-items:baseline;margin:10px 0}
  .k{width:120px;font-size:12px;color:#64748b}
  .v{font-weight:700}
  .divider{height:1px;background:#e2e8f0;margin:12px 0 6px}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}
  .avatar{width:110px;height:110px;border-radius:18px;background:#0f172a;display:flex;align-items:center;justify-content:center;color:#fff;margin-left:auto;box-shadow:0 10px 24px rgba(15,23,42,.24)}
</style>
</head>
<body onload="window.print();window.close();">
  <div class="wrap">
    <div class="hdr">
      <div class="brand">ID</div>
      <div class="title">KARTU MAHASISWA</div>
      <div class="subtitle">${prodi}</div>
      <div class="period">${kelas}</div>
    </div>
    <div class="body">
      <div class="box">
        <div class="row">
          <div class="col">
            <div class="divider"></div>
            <div class="kv"><div class="k">Nama</div><div class="v">${name}</div></div>
            <div class="kv"><div class="k">NIM</div><div class="v">${nim}</div></div>
            <div class="kv"><div class="k">Password</div><div class="v">${pwd}</div></div>
            <div class="kv"><div class="k">Prodi</div><div class="v">${prodi}</div></div>
            <div class="kv"><div class="k">Kelas</div><div class="v">${kelas}</div></div>
            <div class="kv"><div class="k">Sesi / Ruang</div><div class="v">${sesi} / ${ruang}</div></div>
          </div>
          <div class="avatar">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10L12 15 2 10l10-5 10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
        </div>
        <div style="margin-top:12px;display:flex;justify-content:flex-end">
          <span class="badge">Kartu • ${nim}</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const printCard = () => {
    const html = buildPrintHTML();
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <section className="rounded-2xl bg-white/90 p-5 ring-1 ring-zinc-200 shadow-sm md:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-sky-600" />
          <h2 className="text-lg font-semibold">Kartu Mahasiswa</h2>
        </div>
        <button
          onClick={printCard}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-sky-300 hover:from-sky-700 hover:to-cyan-600"
        >
          <Printer className="h-4 w-4" />
          Cetak Kartu
        </button>
      </div>

      {/* Preview kartu di halaman */}
      <div className="overflow-hidden rounded-2xl border-2 border-border/70 bg-background shadow-sm">
        <div className="relative bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-4 text-white">
          <div className="absolute left-4 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 text-xs font-extrabold tracking-wider">
            ID
          </div>
          <div className="text-center">
            <div className="text-lg font-extrabold tracking-wide">
              KARTU MAHASISWA
            </div>
            <div className="text-[13px] font-semibold opacity-95">{prodi}</div>
            <div className="text-[11px] opacity-90">{kelas}</div>
          </div>
        </div>

        <div className="p-4">
          <div className="rounded-2xl border bg-gradient-to-br from-muted/60 to-background p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="my-2 h-px w-full bg-border" />
                {[
                  ["Nama", name],
                  ["NIM", nim],
                  ["Password", String(pwd)],
                  ["Prodi", String(prodi)],
                  ["Kelas", String(kelas)],
                  ["Sesi / Ruang", `${sesi} / ${ruang}`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="mb-2 grid grid-cols-[130px_1fr] items-baseline gap-3"
                  >
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="text-sm font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="shrink-0">
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg ring-1 ring-border/60">
                  <GraduationCap className="h-10 w-10" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <span className="inline-flex items-center gap-2 rounded-full border bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
                Kartu • {nim}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** ====== Halaman ====== */
export default function ProfilePage() {
  const { data, isLoading, isError, refetch } = useGetMeQuery();

  // aman: kompatibel dengan tipe User service, namun siap baca student bila backend kirim
  const me = data as unknown as Me | undefined;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.06),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)]">
      <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200">
              <User2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">Profil Saya</h1>
              <p className="text-sm text-zinc-600">
                Lihat informasi akun, status verifikasi, dan detail siswa.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50"
          >
            Muat Ulang
          </button>
        </div>

        {/* States */}
        {isLoading ? (
          <Skeleton />
        ) : isError ? (
          <div className="rounded-2xl bg-white/90 p-4 text-red-600 ring-1 ring-red-200">
            Gagal memuat profil. Coba muat ulang.
          </div>
        ) : !me ? (
          <div className="rounded-2xl bg-white/90 p-4 ring-1 ring-zinc-200">
            Data profil tidak tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr,1fr]">
            {/* Kartu utama */}
            <section className="rounded-2xl bg-white/90 p-5 ring-1 ring-zinc-200 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Informasi Akun</h2>
                <div className="ml-auto flex items-center gap-2">
                  <Chip>
                    <Shield className="mr-1 h-3.5 w-3.5" />
                    ID: {me.id}
                  </Chip>
                  {typeof me.status !== "undefined" ? (
                    <Chip>{me.status ? "Aktif" : "Nonaktif"}</Chip>
                  ) : null}
                </div>
              </div>

              <div className="divide-y divide-zinc-100">
                <Row label="Nama">{me.name}</Row>
                <Row label="Email" icon={<Mail className="h-4 w-4" />}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{me.email}</span>
                    <VerifiedBadge ok={Boolean(me.email_verified_at)} />
                  </div>
                </Row>
                <Row label="No. HP" icon={<Phone className="h-4 w-4" />}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{me.phone ?? "—"}</span>
                    <VerifiedBadge ok={Boolean(me.phone_verified_at)} />
                  </div>
                </Row>
                <Row
                  label="Dibuat"
                  icon={<CalendarClock className="h-4 w-4" />}
                >
                  {fmt(me.created_at)}
                </Row>
                <Row label="Diperbarui">{fmt(me.updated_at)}</Row>
                <Row label="Peran">
                  {me.roles && me.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {me.roles.map((r: Role) => (
                        <Chip key={r.id}>
                          {r.name?.toLowerCase() === "user" ? "siswa" : r.name}
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </Row>
              </div>
            </section>

            {/* Data siswa */}
            <section className="rounded-2xl bg-white/90 p-5 ring-1 ring-zinc-200 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-sky-600" />
                <h2 className="text-lg font-semibold">Data Siswa</h2>
              </div>

              {me.student ? (
                <div className="divide-y divide-zinc-100">
                  <Row label="Status">
                    <Chip>{me.student.status ? "Aktif" : "Nonaktif"}</Chip>
                  </Row>
                  <Row label="NIM">{me.student.nim ?? "—"}</Row>
                  <Row label="Sekolah / Prodi">
                    {me.student.school?.name ?? me.student.school_name ?? "—"}
                  </Row>
                  <Row label="Kelas">
                    {me.student.class?.name ??
                      me.student.class_name ??
                      (me.student.class ? `#${me.student.class.id}` : "—")}
                  </Row>
                  <Row label="Terdaftar">{fmt(me.student.created_at)}</Row>
                  <Row label="Diubah">{fmt(me.student.updated_at)}</Row>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-200 p-4 text-sm text-zinc-600">
                  Tidak ada data siswa terkait akun ini.
                </div>
              )}
            </section>

            {/* Kartu Mahasiswa + tombol print */}
            {me.student ? <StudentCard me={me} /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

/** ====== Skeleton ====== */
function Skeleton() {
  const line = "h-4 w-full animate-pulse rounded bg-zinc-200";
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr,1fr]">
      <div className="rounded-2xl bg-white/90 p-5 ring-1 ring-zinc-200">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="h-6 w-24 animate-pulse rounded bg-zinc-200" />
        </div>
        <div className="space-y-3">
          <div className={line} />
          <div className={line} />
          <div className={line} />
          <div className={line} />
          <div className={line} />
          <div className={line} />
        </div>
      </div>
      <div className="rounded-2xl bg-white/90 p-5 ring-1 ring-zinc-200">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-3">
          <div className={line} />
          <div className={line} />
          <div className={line} />
          <div className={line} />
        </div>
      </div>
    </div>
  );
}