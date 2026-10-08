import { KECAMATAN } from "./data";
import { hitungLevel, omzetQrisBulanan, punya } from "./scoring";
import type { LevelId, Umkm } from "./types";

export interface Baris {
  u: Umkm;
  level: LevelId;
  skor: number;
  omzetQris: number;
}

export function barisUmkm(daftar: Umkm[], now = Date.now()): Baris[] {
  return daftar.map((u) => {
    const h = hitungLevel(u, now);
    return { u, level: h.level, skor: h.skor.skor, omzetQris: omzetQrisBulanan(u, now) };
  });
}

export interface Agregat {
  jumlah: number;
  legal: number;
  qris: number;
  kur: number;
  pelatihan: number;
  tenagaKerja: number;
  omzetQris: number;
  level: Record<LevelId, number>;
}

export function agregat(rows: Baris[]): Agregat {
  const level: Record<LevelId, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of rows) level[r.level]++;
  return {
    jumlah: rows.length,
    legal: rows.filter((r) => punya(r.u, "NIB")).length,
    qris: rows.filter((r) => r.u.qrisAktif).length,
    kur: rows.filter((r) => r.u.kur.some((k) => k.status === "disetujui")).length,
    pelatihan: rows.filter((r) => r.u.pelatihan.some((p) => p.selesai)).length,
    tenagaKerja: rows.reduce((s, r) => s + r.u.jumlahKaryawan, 0),
    omzetQris: rows.reduce((s, r) => s + r.omzetQris, 0),
    level,
  };
}

export function perKecamatan(rows: Baris[]) {
  return KECAMATAN.map((k) => {
    const sub = rows.filter((r) => r.u.kecamatan === k);
    return { kecamatan: k, ...agregat(sub) };
  });
}

export interface Rekomendasi {
  judul: string;
  isi: string;
  prioritas: "tinggi" | "sedang";
}

/** Umpan balik: data platform dipakai untuk menentukan pelatihan, bantuan & kebijakan berikutnya. */
export function rekomendasi(rows: Baris[]): Rekomendasi[] {
  const out: Rekomendasi[] = [];
  const kec = perKecamatan(rows).filter((k) => k.jumlah >= 3);
  const rasio = (a: number, b: number) => (b ? a / b : 0);

  const legalRendah = [...kec].sort((a, b) => rasio(a.legal, a.jumlah) - rasio(b.legal, b.jumlah)).slice(0, 3);
  if (legalRendah.length)
    out.push({
      judul: "Klinik legalitas keliling",
      isi: `Kepemilikan NIB terendah di ${legalRendah.map((k) => `${k.kecamatan} (${Math.round(rasio(k.legal, k.jumlah) * 100)}%)`).join(", ")}. Jadwalkan jemput bola NIB & PIRT bersama DPMPTSP dan Dinkes.`,
      prioritas: "tinggi",
    });

  const qrisRendah = [...kec].sort((a, b) => rasio(a.qris, a.jumlah) - rasio(b.qris, b.jumlah)).slice(0, 3);
  if (qrisRendah.length)
    out.push({
      judul: "Aktivasi QRIS massal",
      isi: `Adopsi QRIS terendah di ${qrisRendah.map((k) => k.kecamatan).join(", ")}. Kerja sama Bank BJB untuk aktivasi merchant di pasar desa dan sentra produksi.`,
      prioritas: "tinggi",
    });

  const hampirSiap = rows.filter((r) => r.level === 3).length;
  if (hampirSiap)
    out.push({
      judul: "Kelas Standar Mutu Pemasok Pabrik",
      isi: `${hampirSiap} UMKM berstatus Mandiri berpotensi naik ke Siap Industri. Buka angkatan kelas standar mutu dan audit vendor bersama kawasan industri.`,
      prioritas: "sedang",
    });

  const layakKur = rows.filter((r) => r.skor >= 600 && !r.u.kur.length).length;
  if (layakKur)
    out.push({
      judul: "Jemput bola KUR",
      isi: `${layakKur} UMKM memiliki skor kredit ≥ 600 tetapi belum mengajukan KUR. Kirim notifikasi penawaran KUR Bank BJB.`,
      prioritas: "sedang",
    });

  const belumLatih = rows.filter((r) => !r.u.pelatihan.some((p) => p.selesai)).length;
  if (belumLatih)
    out.push({
      judul: "Pelatihan dasar",
      isi: `${belumLatih} UMKM belum menyelesaikan satu pun pelatihan. Prioritaskan kelas Digital Marketing Dasar dan Pembukuan Sederhana.`,
      prioritas: "sedang",
    });

  return out;
}
