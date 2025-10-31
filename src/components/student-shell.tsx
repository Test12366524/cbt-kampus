"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconHome,
  IconBooks,
  IconCalendarWeek,
  IconFolders,
  IconTrophy,
  IconClipboardText,
  IconFileCertificate,
  IconMessage2,
  IconUser,
  IconSettings,
  IconStars,
  IconChevronDown,
  IconDotsVertical,
  IconLogout,
  IconSearch,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { useLogoutMutation } from "@/services/auth.service";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* =========================
 * ICON MAP (string → component)
 * =======================*/
const ICONS = {
  home: IconHome,
  books: IconBooks,
  calendar: IconCalendarWeek,
  folders: IconFolders,
  trophy: IconTrophy,
  clipboard: IconClipboardText,
  certificate: IconFileCertificate,
  message: IconMessage2,
  user: IconUser,
  settings: IconSettings,
  stars: IconStars,
};
export type IconKey = keyof typeof ICONS;

/* =========================
 * Types
 * =======================*/
export type NavChild = { title: string; url: string };
export type NavItem = {
  title: string;
  url?: string;
  icon: IconKey;
  children?: NavChild[];
};
export type MenuBundle = { navMain: NavItem[]; navSecondary?: NavItem[] };

type Role = {
  id: number;
  name: string;
  guard_name: string;
  [k: string]: unknown;
};
type SessionUser = {
  id: number;
  name: string;
  email: string;
  roles?: Role[];
  token?: string;
  avatar?: string;
};

/* =========================
 * Default Menus (Student)
 * =======================*/
const STUDENT_MENUS: MenuBundle = {
  navMain: [
    { title: "Home", url: "/", icon: "home" },
    { title: "Jadwal", url: "/pelajaran", icon: "calendar" },
    { title: "LMS", url: "/lms", icon: "folders" },
    { title: "TryOut", url: "/tryout", icon: "trophy" },
  ],
  navSecondary: [{ title: "Akun Saya", url: "/profile", icon: "user" }],
};

/* =========================
 * Utils
 * =======================*/
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
function hasStudentRole(roles?: Role[]) {
  if (!roles?.length) return false;
  return roles.some((r) => {
    const n = r?.name?.toLowerCase();
    return n === "user" || n === "student";
  });
}

/* =========================
 * Logout handler
 * =======================*/
function useLogoutFlow() {
  const [logout, { isLoading }] = useLogoutMutation();
  const run = async () => {
    const result = await Swal.fire({
      title: "Keluar dari Aplikasi?",
      text: "Apakah Anda yakin ingin logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#16a34a",
      background: "var(--background)",
      color: "var(--foreground)",
    });

    if (result.isConfirmed) {
      try {
        await logout().unwrap();
        await signOut({ callbackUrl: "/login" });
      } catch (error) {
        console.error("Gagal logout:", error);
        Swal.fire("Gagal", "Terjadi kesalahan saat logout.", "error");
      }
    }
  };
  return { run, isLoading };
}

/* =========================
 * Header User (dropdown)
 * =======================*/
function HeaderUser({
  name,
  email,
  avatar,
}: {
  name: string;
  email: string;
  avatar?: string;
}) {
  const router = useRouter();
  const { run, isLoading } = useLogoutFlow();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm text-white shadow-sm backdrop-blur transition hover:bg-white/15 hover:shadow-md">
          <Avatar className="h-8 w-8 rounded-xl ring-1 ring-white/30">
            <AvatarImage src={avatar || "/logo-stikes.jpg"} alt={name} />
            <AvatarFallback className="rounded-xl">
              {name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <IconDotsVertical className="size-4 opacity-70 transition group-hover:opacity-100" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="end"
        className="min-w-60 rounded-2xl border bg-popover/95 p-1 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-popover/80"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-3 py-3 text-left text-sm">
            <Avatar className="h-9 w-9 rounded-xl">
              <AvatarImage src={avatar || "/icon-marketing.png"} alt={name} />
              <AvatarFallback className="rounded-xl">
                {name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/setting")}>
          <IconSettings className="mr-2 h-4 w-4" />
          Pengaturan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={run} disabled={isLoading}>
          <IconLogout className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* =========================
 * Section label
 * =======================*/
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-800">
      {children}
    </div>
  );
}

/* =========================
 * Sidebar (CUSTOM, sticky – tidak ikut terscroll)
 * =======================*/
function StudentSidebar({
  user,
  menus = STUDENT_MENUS,
  onClose,
  className,
}: {
  user: Pick<SessionUser, "name" | "email"> & { avatar?: string };
  menus?: MenuBundle;
  onClose?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { run, isLoading } = useLogoutFlow();
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  return (
    <aside
      className={cx(
        // HAPUS min-h-screen, ganti h-full; posisi "sticky top-0 h-screen" dikirim via className dari AppShell
        "flex w-[280px] h-full shrink-0 flex-col bg-white text-black shadow-right shadow-xl",
        className
      )}
    >
      {/* User card */}
      <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-br from-white/95 via-sky-50/80 to-white/95 p-3 text-zinc-900 shadow-lg ring-4 ring-sky-400/60">
        <div className="h-[50px] flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-xl ring-1 ring-sky-300/50">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-xl bg-sky-500 text-white text-sm font-semibold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-sky-700">{user.email}</p>
          </div>
          <span className="ml-auto rounded-full bg-sky-500/90 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-sky-200/60">
            Mahasiswa
          </span>
        </div>
      </div>

      {/* Nav (boleh scroll internal jika item banyak) */}
      <nav className="mt-3 flex-1 overflow-y-auto">
        <SectionLabel>Menu</SectionLabel>
        <ul className="px-2">
          {menus.navMain.map((item) => {
            const IconComp = ICONS[item.icon] ?? ICONS.home;
            const active = isActive(pathname, item.url);
            const hasChildren = !!item.children?.length;

            if (!hasChildren) {
              return (
                <li key={item.title} className="mb-1">
                  <Link
                    href={item.url || "#"}
                    className={cx(
                      "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-sky-600 text-white shadow"
                        : "text-zinc-800 hover:bg-sky-500"
                    )}
                    onClick={onClose}
                  >
                    <IconComp
                      className={cx(
                        "size-5",
                        active
                          ? "opacity-100"
                          : "opacity-95 group-hover:opacity-100"
                      )}
                    />
                    <span className="font-medium tracking-tight">
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            }

            const expanded = !!open[item.title];
            return (
              <li key={item.title} className="mb-1">
                <button
                  className={cx(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition",
                    "text-zinc-800 hover:bg-white/5"
                  )}
                  onClick={() =>
                    setOpen((s) => ({ ...s, [item.title]: !s[item.title] }))
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <IconComp className="size-5" />
                    {item.title}
                  </span>
                  <IconChevronDown
                    className={cx(
                      "size-4 transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 space-y-1 pl-10"
                    >
                      {item.children!.map((c) => {
                        const subActive = isActive(pathname, c.url);
                        return (
                          <li key={c.title}>
                            <Link
                              href={c.url}
                              onClick={onClose}
                              className={cx(
                                "block rounded-xl px-2 py-1.5 text-sm hover:bg-white/5",
                                subActive ? "text-white" : "text-zinc-800"
                              )}
                            >
                              {c.title}
                            </Link>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {menus.navSecondary?.length ? (
          <>
            <SectionLabel>Setting</SectionLabel>
            <ul className="px-2">
              {menus.navSecondary.map((item) => {
                const IconComp = ICONS[item.icon] ?? ICONS.home;
                const active = isActive(pathname, item.url);
                return (
                  <li key={item.title} className="mb-1">
                    <Link
                      href={item.url || "#"}
                      className={cx(
                        "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                        active
                          ? "bg-sky-600 text-white shadow"
                          : "text-zinc-800 hover:bg-sky-500"
                      )}
                      onClick={onClose}
                    >
                      <IconComp className="size-5" />
                      <span className="font-medium tracking-tight">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </nav>

      {/* Logout */}
      <div className="mt-auto px-2 pb-4">
        <button
          onClick={run}
          disabled={isLoading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 px-3 py-3 text-md font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
        >
          <IconLogout className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

/* =========================
 * SiteHeader
 * =======================*/
type SiteHeaderProps = {
  title: string;
  user: { name: string; email: string; avatar?: string };
  onMenuClick?: () => void;
};

export function SiteHeader({ title, user, onMenuClick }: SiteHeaderProps) {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const term = q.trim();
    router.push(term ? `/lms?search=${encodeURIComponent(term)}` : "/lms");
  };

  return (
    <header className="sticky top-0 z-40 shadow-xl border-b bg-white/65">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-3 pt-4 lg:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-sky-600 px-3 py-2 text-white shadow">
          {/* Mobile burger */}
          <button
            onClick={onMenuClick}
            className="inline-flex rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
            aria-label="Open menu"
          >
            <IconMenu2 className="size-5" />
          </button>

          {/* Search pill */}
          <form
            onSubmit={submitSearch}
            className="flex w-full max-w-[560px] items-center gap-2"
          >
            <div className="relative w-full">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-80" />
              <input
                type="text"
                placeholder="Cari materi (judul)"
                aria-label={`Search in ${title}`}
                className="w-full rounded-full border-0 bg-white/95 px-9 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none ring-2 ring-transparent focus:ring-sky-300"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch();
                }}
              />
              {/* optional clear button */}
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 px-2 py-0.5 text-xs text-sky-700 hover:bg-white"
                  aria-label="Clear"
                >
                  ×
                </button>
              )}
            </div>
            {/* SR submit for accessibility; Enter sudah cukup */}
            <button type="submit" className="sr-only">
              Cari
            </button>
          </form>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <span className="sr-only">{user.name}</span>
            <HeaderUser
              name={user.name}
              email={user.email}
              avatar={user.avatar}
            />
          </div>
        </div>
      </div>
    </header>
  );
}


/* =========================
 * AppShell (sidebar sticky di desktop)
 * =======================*/
export function AppShell({
  title,
  children,
  menus = STUDENT_MENUS,
  fallbackRedirect = "/cms/dashboard",
  enforceRole = true,
}: {
  title: string;
  children: React.ReactNode;
  menus?: MenuBundle;
  fallbackRedirect?: string;
  enforceRole?: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  if (status === "loading") {
    return (
      <div className="relative min-h-screen w-full bg-gradient-to-b from-sky-50 via-white to-sky-50">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(125,211,252,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(14,165,233,0.15),_transparent_55%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center p-6">
          <div
            className="w-full max-w-md rounded-3xl border border-sky-100 bg-white/90 shadow-xl ring-1 ring-sky-100/60 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-4 p-6">
              {/* Spinner */}
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 ring-1 ring-inset ring-sky-100">
                <svg
                  className="h-5 w-5 animate-spin text-sky-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span className="sr-only">Memuat…</span>
              </span>

              {/* Text + subtle skeleton */}
              <div className="flex-1">
                <p className="text-sm font-semibold tracking-wide text-sky-700">
                  Memuat sesi pengguna…
                </p>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-2/3 animate-pulse rounded-full bg-sky-100" />
                  <div className="h-2 w-1/3 animate-pulse rounded-full bg-sky-100" />
                </div>
              </div>
            </div>

            {/* Soft divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-sky-100 to-transparent" />

            {/* Helper line */}
            <div className="px-6 py-4">
              <p className="text-xs text-sky-600/80">
                Menyiapkan dashboard dan preferensi Anda…
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sUser = (session?.user ?? null) as unknown as SessionUser | null;

  if (enforceRole && (!sUser || !hasStudentRole(sUser?.roles))) {
    router.replace(fallbackRedirect);
    return null;
  }

  const uiUser = {
    name: sUser?.name ?? "Student",
    email: sUser?.email ?? "student@example.com",
    avatar: sUser?.avatar ?? "/logo-stikes.jpg",
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar (STICKY) */}
      <div className="hidden lg:block">
        <StudentSidebar
          user={uiUser}
          menus={menus}
          // kunci: jadikan sticky & set tinggi viewport
          className="sticky top-0 h-screen"
        />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="absolute inset-y-0 left-0 w-[280px]"
            >
              <StudentSidebar
                user={uiUser}
                menus={menus}
                onClose={() => setMobileOpen(false)}
                className="h-full"
              />
              <button
                className="absolute right-3 top-3 rounded-full bg-zinc-900/80 p-2 text-white shadow ring-1 ring-white/10"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <IconX className="size-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-1 flex-col">
        <SiteHeader
          title={title}
          user={uiUser}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto w-full max-w-[1400px]"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
