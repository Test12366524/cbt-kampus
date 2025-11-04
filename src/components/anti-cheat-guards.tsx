"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Swal from "sweetalert2";

type ExamGuardProps = {
  children: ReactNode;
  maxViolations?: number;
  onViolation?: (count: number) => void;
  onMaxViolation?: () => void;
  enforceFullscreen?: boolean;
  protectBeforeUnload?: boolean;
  warningText?: string;
};

export default function ExamGuard({
  children,
  maxViolations = 3,
  onViolation,
  onMaxViolation,
  enforceFullscreen = true,
  protectBeforeUnload = true,
  warningText = "Tindakan ini tidak diizinkan selama ujian.",
}: ExamGuardProps) {
  // NOTE: isFs dihapus karena tidak dipakai
  const violationsRef = useRef<number>(0);
  // const warnedOnceRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

  const showWarning = async (msg?: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      await Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: msg ?? warningText,
        timer: 1200,
        showConfirmButton: false,
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const addViolation = async (reason?: string) => {
    violationsRef.current += 1;
    onViolation?.(violationsRef.current);
    await showWarning(reason ?? warningText);
    if (violationsRef.current >= maxViolations) {
      onMaxViolation?.();
    }
  };

  const requestFullscreen = async () => {
    try {
      if (
        !document.fullscreenElement &&
        document.documentElement.requestFullscreen
      ) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // ignore
    }
  };

  // ——— Detect keluar fullscreen
  useEffect(() => {
    const onFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      if (!active) {
        void addViolation("Keluar dari mode layar penuh tidak diizinkan.");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ——— Enforce fullscreen on mount
  useEffect(() => {
    if (!enforceFullscreen) return;
    void requestFullscreen();
  }, [enforceFullscreen]);

  // ——— Protect before unload (close/refresh/back)
  useEffect(() => {
    if (!protectBeforeUnload) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      void addViolation("Mencoba keluar dari halaman ujian.");
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [protectBeforeUnload]);

  // ——— Blok context menu, copy, drag, selection
  useEffect(() => {
    // const onContext = (e: MouseEvent) => {
    //   e.preventDefault();
    //   void addViolation("Klik kanan dinonaktifkan selama ujian.");
    // };
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      void addViolation("Menyalin konten dinonaktifkan selama ujian.");
    };
    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    const onSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("dragstart", onDragStart as EventListener);
    document.addEventListener("selectstart", onSelectStart);

    return () => {
      // document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("dragstart", onDragStart as EventListener);
      document.removeEventListener("selectstart", onSelectStart);
    };
  }, []);

  // ——— Blok keys umum DevTools/print/save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      // const shift = e.shiftKey;
      const key = e.key.toLowerCase();

      // if (e.key === "F12") {
      //   e.preventDefault();
      //   void addViolation("Membuka developer tools dilarang.");
      //   return;
      // }
      // if (ctrlOrCmd && shift && ["i", "j", "c"].includes(key)) {
      //   e.preventDefault();
      //   void addViolation("Membuka developer tools dilarang.");
      //   return;
      // }
      if (ctrlOrCmd && key === "u") {
        e.preventDefault();
        void addViolation("Melihat sumber halaman dilarang.");
        return;
      }
      if (ctrlOrCmd && (key === "s" || key === "p")) {
        e.preventDefault();
        void addViolation("Menyimpan atau mencetak dilarang.");
        return;
      }
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ——— Deteksi tab switch / minimize
  useEffect(() => {
    const onVisibility = () => {
      // if (document.hidden) {
      //   void addViolation("Berpindah tab/jendela terdeteksi.");
      // } else if (!warnedOnceRef.current) {
      //   warnedOnceRef.current = true;
      //   void showWarning("Tetap di tab ini selama ujian berlangsung.");
      // }
    };
    const onBlur = () => {
      // void addViolation("Fokus halaman hilang (kemungkinan berpindah tab).");
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // ——— Deteksi DevTools sederhana
  useEffect(() => {
    const check = () => {
      // const deltaW = window.outerWidth - window.innerWidth;
      // const deltaH = window.outerHeight - window.innerHeight;
      // if (deltaW > 160 || deltaH > 160) {
      //   void addViolation("Developer tools terdeteksi aktif.");
      // }
    };
    const id = window.setInterval(check, 2000);
    return () => window.clearInterval(id);
  }, []);

  // ——— Blok print event langsung
  useEffect(() => {
    const onBeforePrint = () => {
      void addViolation("Mencetak halaman dilarang.");
    };
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []);

  // ——— Styling kecil untuk disable select
  useEffect(() => {
    const s = document.createElement("style");
    s.id = "exam-guard-style";
    s.innerHTML = `
      html, body { -webkit-user-select: none; user-select: none; }
    `;
    document.head.appendChild(s);
    return () => {
      const el = document.getElementById("exam-guard-style");
      if (el) el.remove();
    };
  }, []);

  return <>{children}</>;
}