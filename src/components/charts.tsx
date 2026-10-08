"use client";

import { useState } from "react";

export interface Titik {
  label: string;
  nilai: number;
  detail?: string;
}

/** Grafik batang vertikal satu seri, dengan tooltip saat hover/fokus. */
export function BarChart({
  data,
  format,
  tinggi = 180,
  judul,
}: {
  data: Titik[];
  format: (n: number) => string;
  tinggi?: number;
  judul: string;
}) {
  const [aktif, setAktif] = useState<number | null>(null);
  const maks = Math.max(...data.map((d) => d.nilai), 1);
  const garis = [0, 0.5, 1].map((p) => p * maks);

  return (
    <figure className="w-full" aria-label={judul}>
      <div className="relative" style={{ height: tinggi }}>
        {garis.map((g) => (
          <div key={g} className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(g / maks) * 100}%` }}>
            <span className="absolute -top-2 right-0 bg-surface pl-1 text-[10px] text-muted tabular-nums">{format(g)}</span>
          </div>
        ))}
        <div className="absolute inset-0 right-12 flex items-end gap-[2px]">
          {data.map((d, i) => (
            <button
              key={d.label}
              type="button"
              className="group relative flex h-full flex-1 items-end focus:outline-none"
              onMouseEnter={() => setAktif(i)}
              onMouseLeave={() => setAktif(null)}
              onFocus={() => setAktif(i)}
              onBlur={() => setAktif(null)}
              aria-label={`${d.label}: ${format(d.nilai)}`}
            >
              <span
                className="w-full rounded-t-[4px] bg-[var(--accent)] transition-opacity"
                style={{ height: `${(d.nilai / maks) * 100}%`, opacity: aktif === null || aktif === i ? 1 : 0.45, minHeight: d.nilai > 0 ? 2 : 0 }}
              />
              {aktif === i && (
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-xs shadow-sm">
                  <span className="block text-muted">{d.label}</span>
                  <span className="font-semibold tabular-nums">{format(d.nilai)}</span>
                  {d.detail && <span className="block text-muted">{d.detail}</span>}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="mr-12 mt-1 flex justify-between text-[10px] text-muted">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </figure>
  );
}

/** Daftar batang horizontal, cocok untuk perbandingan antar kecamatan. */
export function HBarList({
  data,
  format,
  maks: maksTetap,
}: {
  data: Titik[];
  format: (n: number) => string;
  maks?: number;
}) {
  const maks = maksTetap ?? Math.max(...data.map((d) => d.nilai), 1);
  return (
    <ul className="space-y-1.5">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[8rem_1fr_4.5rem] items-center gap-2 text-sm" title={d.detail}>
          <span className="truncate text-ink-2">{d.label}</span>
          <span className="h-3 rounded-r-[4px] bg-surface-2">
            <span className="block h-full rounded-r-[4px] bg-[var(--accent)]" style={{ width: `${(d.nilai / maks) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">{format(d.nilai)}</span>
        </li>
      ))}
    </ul>
  );
}
