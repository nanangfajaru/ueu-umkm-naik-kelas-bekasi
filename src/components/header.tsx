"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "./theme-toggle";

const MENU_UMKM = [
  ["/umkm", "Beranda"],
  ["/umkm/profil", "Profil"],
  ["/umkm/legalitas", "Legalitas"],
  ["/umkm/pelatihan", "Pelatihan"],
  ["/umkm/kredit", "Kredit Digital"],
];

const MENU_ADMIN = [
  ["/admin", "Dashboard"],
  ["/admin/umkm", "Data UMKM"],
  ["/admin/legalitas", "Verifikasi Legalitas"],
  ["/admin/kur", "Pengajuan KUR"],
];

export function Header() {
  const { sesi, saya, keluar } = useStore();
  const path = usePathname();
  const router = useRouter();
  const menu = sesi?.role === "admin" ? MENU_ADMIN : sesi?.role === "umkm" ? MENU_UMKM : [];

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">SU</span>
          <span>
            Super UMKM <span className="text-brand">Bekasi</span>
          </span>
        </Link>
        <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {menu.map(([href, label]) => {
            const aktif = href === path || (href !== "/umkm" && href !== "/admin" && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${aktif ? "bg-brand-soft font-medium text-brand-strong" : "text-ink-2 hover:bg-surface-2"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <ThemeToggle />
          {sesi ? (
            <>
              <span className="hidden text-muted md:inline">
                {sesi.role === "admin" ? "Admin Dinas KUKM" : saya?.namaUsaha}
              </span>
              <button
                className="btn-ghost py-1.5"
                onClick={() => {
                  keluar();
                  router.push("/");
                }}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/masuk" className="btn-ghost py-1.5">Masuk</Link>
              <Link href="/daftar" className="btn-primary py-1.5">Daftar UMKM</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
