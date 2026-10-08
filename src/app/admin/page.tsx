"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart } from "@/components/charts";
import { Kpi } from "@/components/ui";
import { LEVEL, TARGET_TAHUNAN } from "@/lib/data";
import { angka, persen, rupiahRingkas } from "@/lib/format";
import { agregat, barisUmkm, perKecamatan, rekomendasi } from "@/lib/statistik";
import { useStore } from "@/lib/store";
import type { LevelId } from "@/lib/types";

type KolomUrut = "kecamatan" | "jumlah" | "legal" | "qris" | "siap" | "omzetQris" | "tenagaKerja";

export default function DashboardAdmin() {
  const { db, resetDemo } = useStore();
  const rows = useMemo(() => barisUmkm(db.umkm), [db]);
  const total = useMemo(() => agregat(rows), [rows]);
  const kec = useMemo(() => perKecamatan(rows), [rows]);
  const saran = useMemo(() => rekomendasi(rows), [rows]);
  const [urut, setUrut] = useState<{ k: KolomUrut; turun: boolean }>({ k: "jumlah", turun: true });

  const pendaftaran = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const n = db.umkm.filter((u) => {
        const t = new Date(u.tanggalDaftar);
        return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
      }).length;
      return { label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }), nilai: n, detail: "UMKM baru" };
    });
  }, [db]);

  const t2030 = TARGET_TAHUNAN[0];
  const capaian = [
    { label: "Legalitas (NIB)", aktual: total.legal / total.jumlah, target: t2030.legal / t2030.terdaftar },
    { label: "Pengguna QRIS", aktual: total.qris / total.jumlah, target: t2030.qris / t2030.terdaftar },
    { label: "Penerima KUR", aktual: total.kur / total.jumlah, target: t2030.kur / t2030.terdaftar },
  ];

  const nilaiKolom = (r: (typeof kec)[number], k: KolomUrut) =>
    k === "kecamatan" ? r.kecamatan : k === "legal" ? (r.jumlah ? r.legal / r.jumlah : 0) : k === "qris" ? (r.jumlah ? r.qris / r.jumlah : 0) : k === "siap" ? r.level[4] : r[k];
  const kecUrut = [...kec].sort((a, b) => {
    const x = nilaiKolom(a, urut.k);
    const y = nilaiKolom(b, urut.k);
    const c = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
    return urut.turun ? -c : c;
  });
  const Th = ({ k, children, kanan }: { k: KolomUrut; children: React.ReactNode; kanan?: boolean }) => (
    <th className={kanan ? "text-right" : ""} aria-sort={urut.k === k ? (urut.turun ? "descending" : "ascending") : "none"}>
      <button className="uppercase" onClick={() => setUrut({ k, turun: urut.k === k ? !urut.turun : true })}>
        {children} {urut.k === k ? (urut.turun ? "↓" : "↑") : ""}
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-page">Dashboard Monitoring UMKM</h1>
          <p className="sub mt-1">Kabupaten Bekasi · data real-time dari platform Super UMKM</p>
        </div>
        <button
          className="btn-ghost text-xs"
          onClick={() => confirm("Kembalikan semua data ke data demo awal?") && resetDemo()}
        >
          Reset data demo
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="UMKM terdaftar" nilai={angka(total.jumlah)} catatan={`Target 2034: ${angka(100000)}`} />
        <Kpi label="Omzet QRIS / bulan" nilai={rupiahRingkas(total.omzetQris)} catatan="total seluruh UMKM, rata-rata 90 hari" />
        <Kpi label="Tenaga kerja terserap" nilai={angka(total.tenagaKerja)} catatan="termasuk pemilik usaha" />
        <Kpi label="Siap Industri" nilai={angka(total.level[4])} catatan="siap masuk Pasar UMKM B2B" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-semibold">Sebaran level UMKM</h2>
          <p className="sub">Pemula → Berkembang → Mandiri → Siap Industri</p>
          <div className="mt-4 flex h-6 w-full gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label="Sebaran level UMKM">
            {([1, 2, 3, 4] as LevelId[]).map((l) =>
              total.level[l] ? (
                <div
                  key={l}
                  title={`Level ${l} ${LEVEL[l].nama}: ${total.level[l]} UMKM`}
                  style={{ width: `${(total.level[l] / total.jumlah) * 100}%`, background: LEVEL[l].warna }}
                />
              ) : null,
            )}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {([1, 2, 3, 4] as LevelId[]).map((l) => (
              <li key={l} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-sm" style={{ background: LEVEL[l].warna }} aria-hidden />
                <span className="text-ink-2">{LEVEL[l].nama}</span>
                <span className="ml-auto font-semibold tabular-nums">{total.level[l]}</span>
                <span className="w-10 text-right text-xs text-muted tabular-nums">{persen(total.level[l] / total.jumlah)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="font-semibold">Rasio capaian vs target 2030</h2>
          <p className="sub">Persentase terhadap UMKM terdaftar</p>
          <ul className="mt-4 space-y-4">
            {capaian.map((c) => {
              const ok = c.aktual >= c.target;
              return (
                <li key={c.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span>{c.label}</span>
                    <span className="tabular-nums">
                      <b>{persen(c.aktual, 1)}</b> <span className="text-muted">/ target {persen(c.target, 1)}</span>
                    </span>
                  </div>
                  <div className="relative mt-1 h-2 rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(c.aktual, 1) * 100}%` }} />
                    <div className="absolute -top-1 h-4 w-0.5 bg-ink" style={{ left: `${c.target * 100}%` }} title="target" />
                  </div>
                  <p className={`mt-1 text-xs ${ok ? "text-[var(--good)]" : "text-[var(--warn)]"}`}>
                    {ok ? "✓ Melampaui target" : "▲ Di bawah target"}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="font-semibold">Pendaftaran UMKM per bulan</h2>
        <div className="mt-4">
          <BarChart data={pendaftaran} format={(n) => angka(Math.round(n))} judul="Pendaftaran UMKM per bulan" tinggi={150} />
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold">Umpan balik kebijakan</h2>
        <p className="sub">Rekomendasi otomatis dari data platform untuk menentukan pelatihan, bantuan &amp; kebijakan berikutnya.</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {saran.map((s) => (
            <li key={s.judul} className="rounded-lg border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{s.judul}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs ${s.prioritas === "tinggi" ? "bg-[var(--bad-soft)] text-[var(--bad)]" : "bg-[var(--warn-soft)] text-[var(--warn)]"}`}>
                  Prioritas {s.prioritas}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-2">{s.isi}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card overflow-x-auto p-0">
        <div className="p-5 pb-2">
          <h2 className="font-semibold">Per kecamatan</h2>
          <p className="sub">Klik judul kolom untuk mengurutkan.</p>
        </div>
        <table className="tbl min-w-[720px]">
          <thead>
            <tr>
              <Th k="kecamatan">Kecamatan</Th>
              <Th k="jumlah" kanan>UMKM</Th>
              <Th k="legal" kanan>NIB</Th>
              <Th k="qris" kanan>QRIS</Th>
              <Th k="siap" kanan>Siap Industri</Th>
              <Th k="omzetQris" kanan>Omzet QRIS/bln</Th>
              <Th k="tenagaKerja" kanan>Tenaga kerja</Th>
            </tr>
          </thead>
          <tbody>
            {kecUrut.map((k) => (
              <tr key={k.kecamatan} className="hover:bg-surface-2">
                <td>
                  <Link href={`/admin/umkm?kecamatan=${encodeURIComponent(k.kecamatan)}`} className="hover:text-brand hover:underline">
                    {k.kecamatan}
                  </Link>
                </td>
                <td className="text-right tabular-nums">{k.jumlah}</td>
                <td className="text-right tabular-nums">{k.jumlah ? persen(k.legal / k.jumlah) : "–"}</td>
                <td className="text-right tabular-nums">{k.jumlah ? persen(k.qris / k.jumlah) : "–"}</td>
                <td className="text-right tabular-nums">{k.level[4]}</td>
                <td className="text-right tabular-nums">{rupiahRingkas(k.omzetQris)}</td>
                <td className="text-right tabular-nums">{k.tenagaKerja}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
