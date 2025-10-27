"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, IdCard, Printer } from "lucide-react";
import * as React from "react";

export type StudentLite = {
  id: number;
  nim?: string | number | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  school_name?: string | null;
  class_name?: string | null;
  // opsional jika suatu saat ada
  session?: string | number | null;
  room?: string | number | null;
  password?: string | number | null;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: StudentLite | null; // <= data langsung dari tabel
};

export default function StudentCardModal({
  open,
  onOpenChange,
  student,
}: Props) {
  const nim = String(student?.nim ?? "—");
  const name = student?.name ?? "—";
  const kelas = student?.class_name ?? "—";
  const prodi = student?.school_name ?? "—";
  const sesi = student?.session ?? "—";
  const ruang = student?.room ?? "—";
  const pwd = student?.password ?? "—";

  const buildPrintHTML = () => `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Kartu Peserta</title>
<style>
  @page { size: A4; margin: 16mm; }
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
      <div class="title">KARTU PESERTA</div>
      <div class="subtitle">SUMATIF AKHIR TAHUN</div>
      <div class="period">TAUTAN BELAJAR EVALUASI MATERI 2023/2024</div>
    </div>
    <div class="body">
      <div class="box">
        <div class="row">
          <div class="col">
            <div class="divider"></div>
            <div class="kv"><div class="k">Nama Peserta</div><div class="v">${name}</div></div>
            <div class="kv"><div class="k">NIM</div><div class="v">${nim}</div></div>
            <div class="kv"><div class="k">Password</div><div class="v">${pwd}</div></div>
            <div class="kv"><div class="k">Kelas</div><div class="v">${kelas}</div></div>
            <div class="kv"><div class="k">Sesi / Ruang</div><div class="v">${sesi} / ${ruang}</div></div>
            <div class="kv"><div class="k">Prodi</div><div class="v">${prodi}</div></div>
          </div>
          <div class="avatar">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10L12 15 2 10l10-5 10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
        </div>
        <div style="margin-top:12px;display:flex;justify-content:flex-end">
          <span class="badge">Kartu Peserta • ${nim}</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const onPrint = () => {
    const html = buildPrintHTML();
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl md:max-w-3xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-primary" />
            Cetak Kartu Peserta
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="rounded-2xl border-2 border-border/70 bg-background p-0 shadow-sm overflow-hidden">
          <div className="relative bg-gradient-to-r from-primary to-cyan-500 px-5 py-4 text-white">
            <div className="absolute left-4 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 text-xs font-extrabold tracking-wider">
              ID
            </div>
            <div className="text-center">
              <div className="text-lg font-extrabold tracking-wide">
                KARTU PESERTA
              </div>
              <div className="text-[13px] font-semibold opacity-95">
                SUMATIF AKHIR TAHUN
              </div>
              <div className="text-[11px] opacity-90">
                TAUTAN BELAJAR EVALUASI MATERI 2023/2024
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-background p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="my-2 h-px w-full bg-border" />
                  {[
                    ["Nama Peserta", name],
                    ["NIM", nim],
                    ["Password", String(pwd)],
                    ["Kelas", String(kelas)],
                    ["Sesi / Ruang", `${sesi} / ${ruang}`],
                    ["Prodi", String(prodi)],
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
                  Kartu Peserta • {nim}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={onPrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}