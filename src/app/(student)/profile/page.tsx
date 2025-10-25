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
} from "lucide-react";

import { useGetMeQuery } from "@/services/auth.service";
import type { User, Role } from "@/types/user";

/** ====== Extra types dari contoh response /me ====== */
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
  name?: string;
  // tambahkan field lain jika backend menyediakan
} | null;

type Student = {
  id: number;
  user_id: number;
  school_id: number | null;
  class_id: number | null;
  status: boolean | number;
  created_at: string;
  updated_at: string;
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

            {/* Kartu siswa / sekolah */}
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
                  <Row label="Sekolah">
                    {me.student.school ? me.student.school.name : "—"}
                  </Row>
                  <Row label="Kelas">
                    {me.student.class
                      ? me.student.class.name ?? `#${me.student.class.id}`
                      : "—"}
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