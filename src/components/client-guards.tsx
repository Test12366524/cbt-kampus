"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";

type ClientAuthGuardProps = {
  excludedRoutes?: string[];
  excludedFetchPrefixes?: string[];
  loginPath?: string;
};

export default function ClientAuthGuard({
  excludedRoutes = ["/auth", "/auth/login"],
  excludedFetchPrefixes = ["/api/auth/", "/auth/"],
  loginPath = "/auth/login",
}: ClientAuthGuardProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Hindari pop-up berulang saat banyak 401
  const handling401Ref = useRef(false);
  // Pastikan fetch hanya dipatch sekali
  const fetchPatchedRef = useRef(false);

  // Redirect global jika unauthenticated (kecuali excludedRoutes)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isExcluded = excludedRoutes.some((route) =>
      pathname?.startsWith(route)
    );

    if (status === "unauthenticated" && !isExcluded) {
      router.replace(loginPath);
    }
  }, [status, pathname, router, excludedRoutes, loginPath]);

  // Interceptor global untuk 401 (semua fetch di app)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (fetchPatchedRef.current) return;

    const originalFetch: typeof window.fetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const res = await originalFetch(...args);

      try {
        // Ambil URL request agar bisa di-skip sesuai prefix
        const req = args[0];
        const url =
          typeof req === "string"
            ? req
            : req instanceof Request
            ? req.url
            : String(req);

        const shouldSkip = excludedFetchPrefixes.some((p) => url.includes(p));
        const isLoginPage = url.endsWith(loginPath);

        if (!shouldSkip && !isLoginPage && res.status === 401) {
          if (!handling401Ref.current) {
            handling401Ref.current = true;

            await Swal.fire({
              title: "Sesi Berakhir",
              text: "Silakan login kembali untuk melanjutkan.",
              icon: "warning",
              confirmButtonText: "OK",
            });

            await signOut({ callbackUrl: loginPath });
          }
        }
      } catch {
        // Abaikan error non-kritis saat membaca URL
      }

      return res;
    };

    fetchPatchedRef.current = true;

    // Optional cleanup
    return () => {
      window.fetch = originalFetch;
      fetchPatchedRef.current = false;
    };
  }, [excludedFetchPrefixes, loginPath]);

  return null;
}