"use client";

import { Memuat, PerluMasuk } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { siap, sesi } = useStore();
  if (!siap) return <Memuat />;
  if (sesi?.role !== "admin") return <PerluMasuk peran="admin" />;
  return <>{children}</>;
}
