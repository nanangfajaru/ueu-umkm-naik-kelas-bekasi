import Link from "next/link";
import { LEVEL } from "@/lib/data";
import type { LevelId, StatusPengajuan } from "@/lib/types";

export function LevelBadge({ level }: { level: LevelId }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium text-ink">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL[level].warna }} aria-hidden />
      Level {level} · {LEVEL[level].nama}
    </span>
  );
}

const STATUS: Record<string, { label: string; ikon: string; cls: string }> = {
  diajukan: { label: "Diajukan", ikon: "●", cls: "bg-[var(--info-soft)] text-[var(--info)]" },
  diverifikasi: { label: "Diverifikasi", ikon: "◐", cls: "bg-[var(--warn-soft)] text-[var(--warn)]" },
  terbit: { label: "Terbit", ikon: "✓", cls: "bg-[var(--good-soft)] text-[var(--good)]" },
  disetujui: { label: "Disetujui", ikon: "✓", cls: "bg-[var(--good-soft)] text-[var(--good)]" },
  ditolak: { label: "Ditolak", ikon: "✕", cls: "bg-[var(--bad-soft)] text-[var(--bad)]" },
  dijadwalkan: { label: "Dijadwalkan", ikon: "●", cls: "bg-[var(--info-soft)] text-[var(--info)]" },
  selesai: { label: "Selesai", ikon: "✓", cls: "bg-[var(--good-soft)] text-[var(--good)]" },
};

export function StatusBadge({ status }: { status: StatusPengajuan | string }) {
  const s = STATUS[status] ?? { label: status, ikon: "•", cls: "bg-surface-2 text-ink-2" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      <span aria-hidden>{s.ikon}</span>
      {s.label}
    </span>
  );
}

export function Kpi({ label, nilai, catatan }: { label: string; nilai: React.ReactNode; catatan?: React.ReactNode }) {
  return (
    <div className="card">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{nilai}</div>
      {catatan && <div className="mt-1 text-xs text-muted">{catatan}</div>}
    </div>
  );
}

export function Progress({ nilai, maks = 100, label }: { nilai: number; maks?: number; label?: string }) {
  const p = Math.max(0, Math.min(1, nilai / maks));
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
      role="progressbar"
      aria-valuenow={Math.round(p * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${p * 100}%` }} />
    </div>
  );
}

/** Tangga level UMKM: Pemula → Berkembang → Mandiri → Siap Industri. */
export function LevelTrack({ level }: { level: LevelId }) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {([1, 2, 3, 4] as LevelId[]).map((l) => {
        const aktif = l <= level;
        return (
          <li
            key={l}
            className={`rounded-lg border p-3 ${l === level ? "border-[var(--accent)] bg-[var(--info-soft)]" : "border-line bg-surface"}`}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: aktif ? LEVEL[l].warna : "var(--border)" }}
              >
                {aktif ? "✓" : l}
              </span>
              <span className={`text-sm font-semibold ${aktif ? "text-ink" : "text-muted"}`}>{LEVEL[l].nama}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{LEVEL[l].ringkas}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function Kosong({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">{children}</div>;
}

export function PerluMasuk({ peran }: { peran: "umkm" | "admin" }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="h-page">Silakan masuk dulu</h1>
      <p className="sub mt-2">
        Halaman ini khusus {peran === "umkm" ? "pelaku UMKM" : "admin Dinas Koperasi & UKM"}.
      </p>
      <Link href="/masuk" className="btn-primary mt-6">Masuk</Link>
    </div>
  );
}

export function Memuat() {
  return <div className="py-24 text-center text-sm text-muted">Memuat data…</div>;
}
