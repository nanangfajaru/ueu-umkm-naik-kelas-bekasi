import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Super UMKM Bekasi",
  description:
    "Portal profil & monitoring UMKM Kabupaten Bekasi: profil digital, legalitas, pelatihan, kredit digital, dan monitoring level UMKM.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <StoreProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">{children}</main>
          <footer className="border-t border-line py-6 text-center text-xs text-muted">
            Super UMKM Bekasi · Program 1 Smart Economy Kabupaten Bekasi · Prototipe tugas kuliah (data demo)
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
