// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// --- Types kecil untuk aman tanpa `any`
type RoleObj = {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
};

type TokenLike = {
  role?: string;
  roles?: (string | RoleObj)[];
  user?: { roles?: (string | RoleObj)[] };
};

// --- Helper
const PUBLIC_PATHS = ["/login"];
const ALWAYS_ALLOW_PREFIX = ["/api/auth", "/_next", "/static", "/images"];
const ALWAYS_ALLOW_EXACT = ["/favicon.ico", "/robots.txt", "/sitemap.xml"];

const isPublic = (pathname: string) =>
  PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api/auth");

const isAssetLike = (pathname: string) =>
  ALWAYS_ALLOW_EXACT.includes(pathname) ||
  ALWAYS_ALLOW_PREFIX.some((p) => pathname.startsWith(p));

function hasRole(token: TokenLike | null, roleName: string): boolean {
  if (!token) return false;

  const ok = (r: unknown) => {
    if (typeof r === "string") return r === roleName;
    if (r && typeof r === "object" && "name" in r)
      return (r as RoleObj).name === roleName;
    return false;
  };

  // kemungkinan token.role = "superadmin"
  if (typeof token.role === "string" && token.role === roleName) return true;
  // kemungkinan token.roles = ["superadmin"] / [{ name: "superadmin" }]
  if (Array.isArray(token.roles) && token.roles.some(ok)) return true;
  // kemungkinan token.user.roles = [...]
  if (Array.isArray(token.user?.roles) && token.user!.roles!.some(ok))
    return true;

  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bebaskan asset & route publik
  if (isAssetLike(pathname) || isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenLike | null;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ⬇️ di sini kuncinya: pengawas diperlakukan sama kayak superadmin
  const isSuperOrPengawas =
    hasRole(token, "superadmin") || hasRole(token, "pengawas");
  const isUser = hasRole(token, "user");
  const isCmsPath = pathname.startsWith("/cms");

  // Aturan akses
  if (isSuperOrPengawas) {
    // superadmin / pengawas: hanya /cms*
    if (!isCmsPath) {
      return NextResponse.redirect(new URL("/cms", req.url));
    }
    return NextResponse.next();
  }

  if (isUser) {
    // user biasa: tidak boleh ke /cms
    if (isCmsPath) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Role tidak dikenali
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

// Terapkan ke semua route kecuali asset umum & next internals
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};