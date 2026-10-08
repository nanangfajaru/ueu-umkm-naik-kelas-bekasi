"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LevelTrack } from "@/components/ui";
import { TARGET_TAHUNAN } from "@/lib/data";
import { angka } from "@/lib/format";
import { hitungLevel } from "@/lib/scoring";
import { useStore } from "@/lib/store";

const LANGKAH = [
  ["1", "Daftar profil digital", "Data usaha by name by address: produk, omzet, lokasi desa/kecamatan."],
  ["2", "Legalitas", "Ajukan NIB, PIRT, sertifikat halal, dan merek secara online."],
  ["3", "Pelatihan & mentor", "Kelas digital marketing, pembukuan, standar mutu pabrik; mentor per kecamatan."],
  ["4", "Kredit digital", "Transaksi QRIS tercatat otomatis menjadi skor kredit untuk pengajuan KUR."],
  ["5", "Naik level", "Status UMKM dipantau: Pemula → Berkembang → Mandiri → Siap Industri."],
];

const MASALAH = [
  ["8,82%", "Pengangguran terbuka (2024)"],
  ["13,77%", "Kontribusi UMKM ke PDRB (2020)"],
  ["5.031–20.610", "Jumlah UMKM tercatat, berbeda antar sumber"],
  ["±2.553", "Perusahaan di 7 kawasan industri"],
];

export default function Beranda() {
  const { db, siap, sesi } = useStore();

  const ringkas = useMemo(() => {
    const lv = db.umkm.map((u) => hitungLevel(u).level);
    return {
      total: db.umkm.length,
      kecamatan: new Set(db.umkm.map((u) => u.kecamatan)).size,
      qris: db.umkm.filter((u) => u.qrisAktif).length,
      siapIndustri: lv.filter((l) => l === 4).length,
    };
  }, [db]);

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 pt-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-medium text-brand">Smart Economy · Kabupaten Bekasi</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Satu akun untuk setiap UMKM Bekasi naik kelas.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-2">
            Super UMKM Bekasi adalah portal profil &amp; monitoring UMKM: pendataan by name by address, legalitas online,
            pelatihan dan pendampingan, kredit digital berbasis QRIS, sampai status siap memasok industri.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/daftar" className="btn-primary px-5 py-2.5">Daftarkan usaha saya</Link>
            <Link href={sesi?.role === "admin" ? "/admin" : "/masuk"} className="btn-ghost px-5 py-2.5">
              {sesi?.role === "admin" ? "Buka dashboard" : "Masuk (akun demo)"}
            </Link>
          </div>
        </div>
        <div className="card grid grid-cols-2 gap-4">
          {[
            ["UMKM terdaftar", ringkas.total],
            ["Kecamatan terjangkau", ringkas.kecamatan],
            ["Merchant QRIS aktif", ringkas.qris],
            ["Siap Industri", ringkas.siapIndustri],
          ].map(([l, n]) => (
            <div key={l as string}>
              <div className="text-3xl font-semibold tabular-nums">{siap ? angka(n as number) : "–"}</div>
              <div className="text-sm text-muted">{l}</div>
            </div>
          ))}
          <p className="col-span-2 text-xs text-muted">Angka di atas dihitung langsung dari data platform (data demo).</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Mengapa perlu?</h2>
        <p className="sub mt-1">Industri besar, warga tertinggal: PDRB per kapita Rp128,7 juta, tetapi UMKM belum masuk rantai pasok pabrik di wilayahnya sendiri.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MASALAH.map(([n, l]) => (
            <div key={l} className="card">
              <div className="text-2xl font-semibold">{n}</div>
              <div className="mt-1 text-sm text-muted">{l}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Sumber: RLPPD Kab. Bekasi 2024, BPS Kab. Bekasi, Kemenkop UKM, ANTARA.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Alur program</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-5">
          {LANGKAH.map(([n, j, d]) => (
            <li key={n} className="card">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong">{n}</span>
              <h3 className="mt-3 font-semibold">{j}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Monitoring status UMKM</h2>
        <p className="sub mt-1 mb-4">Level dihitung otomatis dari data legalitas, pelatihan, transaksi QRIS, dan skor kredit.</p>
        <LevelTrack level={4} />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Target 5 tahun (2029–2034)</h2>
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="tbl min-w-[560px]">
            <thead>
              <tr>
                <th>Indikator</th>
                {TARGET_TAHUNAN.map((t) => <th key={t.tahun} className="text-right">{t.tahun}</th>)}
              </tr>
            </thead>
            <tbody>
              {([
                ["UMKM terdaftar", "terdaftar"],
                ["Legalitas (NIB/izin)", "legal"],
                ["Pengguna QRIS", "qris"],
                ["Penerima KUR", "kur"],
              ] as const).map(([l, k]) => (
                <tr key={k}>
                  <td className="font-medium">{l}</td>
                  {TARGET_TAHUNAN.map((t) => (
                    <td key={t.tahun} className="text-right tabular-nums">{angka(t[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Angka kumulatif. Target akhir: 100.000 UMKM terdaftar.</p>
      </section>
    </div>
  );
}
