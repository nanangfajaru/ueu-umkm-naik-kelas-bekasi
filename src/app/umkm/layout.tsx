"use client";

import { Memuat, PerluMasuk } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function UmkmLayout({ children }: { children: React.ReactNode }) {
  const { siap, saya } = useStore();
  if (!siap) return <Memuat />;
  if (!saya) return <PerluMasuk peran="umkm" />;
  return <>{children}</>;
}
