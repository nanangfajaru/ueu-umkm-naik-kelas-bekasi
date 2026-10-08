import { AMBANG, KATEGORI_PANGAN, KELAS } from "./data";
import { rupiahRingkas } from "./format";
import type { LevelId, Umkm } from "./types";

const HARI = 24 * 60 * 60 * 1000;

export function transaksiTerakhir(u: Umkm, hari: number, now = Date.now()) {
  const batas = now - hari * HARI;
  return u.transaksi.filter((t) => new Date(t.tanggal).getTime() >= batas);
}

/** Rata-rata omzet bulanan yang tercatat lewat QRIS (90 hari terakhir). */
export function omzetQrisBulanan(u: Umkm, now = Date.now()) {
  const tx = transaksiTerakhir(u, 90, now);
  return tx.reduce((s, t) => s + t.nominal, 0) / 3;
}

export const legalTerbit = (u: Umkm) => u.legalitas.filter((l) => l.status === "terbit");
export const punya = (u: Umkm, jenis: string) => legalTerbit(u).some((l) => l.jenis === jenis);
export const pelatihanSelesai = (u: Umkm) => u.pelatihan.filter((p) => p.selesai);

export interface KomponenSkor {
  label: string;
  nilai: number;
  maks: number;
  keterangan: string;
}

export interface HasilSkor {
  skor: number;
  grade: "Belum layak" | "Cukup" | "Baik" | "Sangat baik";
  komponen: KomponenSkor[];
  plafonRekomendasi: number;
}

/**
 * Skor kredit alternatif (300–850) dari riwayat transaksi QRIS dan aktivitas
 * di platform. Skor ini menjadi data pendukung pengajuan KUR ke bank penyalur.
 */
export function hitungSkor(u: Umkm, now = Date.now()): HasilSkor {
  const tx = transaksiTerakhir(u, 90, now);
  const volBulanan = tx.reduce((s, t) => s + t.nominal, 0) / 3;

  const minggu = new Set(tx.map((t) => Math.floor((now - new Date(t.tanggal).getTime()) / (7 * HARI))));
  const konsistensi = Math.min(minggu.size / 13, 1);

  const legal = legalTerbit(u);
  const nilaiLegal = Math.min(
    legal.reduce((s, l) => s + (l.jenis === "NIB" ? 30 : 15), 0),
    75,
  );
  const latih = pelatihanSelesai(u).length;
  const lamaUsaha = new Date(now).getFullYear() - u.tahunBerdiri;

  const komponen: KomponenSkor[] = [
    {
      label: "Frekuensi transaksi QRIS",
      nilai: Math.round(Math.min(tx.length / 90, 1) * 150),
      maks: 150,
      keterangan: `${tx.length} transaksi dalam 90 hari (target 90+)`,
    },
    {
      label: "Volume transaksi",
      nilai: Math.round(Math.min(Math.log10(1 + volBulanan / 1e6) / Math.log10(31), 1) * 150),
      maks: 150,
      keterangan: `Rata-rata ${rupiahRingkas(volBulanan)}/bulan (target Rp30 jt)`,
    },
    {
      label: "Konsistensi usaha",
      nilai: Math.round(konsistensi * 100),
      maks: 100,
      keterangan: `Aktif bertransaksi ${minggu.size} dari 13 minggu terakhir`,
    },
    {
      label: "Legalitas usaha",
      nilai: nilaiLegal,
      maks: 75,
      keterangan: legal.length ? legal.map((l) => l.jenis).join(", ") + " terbit" : "Belum ada izin terbit",
    },
    {
      label: "Pelatihan selesai",
      nilai: Math.min(latih * 15, 60),
      maks: 60,
      keterangan: `${latih} kelas selesai`,
    },
    {
      label: "Lama usaha",
      nilai: Math.min(Math.max(lamaUsaha, 0) * 3, 15),
      maks: 15,
      keterangan: `${Math.max(lamaUsaha, 0)} tahun`,
    },
  ];

  const skor = 300 + komponen.reduce((s, k) => s + k.nilai, 0);
  const grade = skor >= 750 ? "Sangat baik" : skor >= 650 ? "Baik" : skor >= AMBANG.kurMinSkor ? "Cukup" : "Belum layak";
  const faktor = skor >= 750 ? 4 : skor >= 650 ? 3 : skor >= AMBANG.kurMinSkor ? 2 : 0;
  const omzetAcuan = Math.max(volBulanan, Math.min(u.omzetBulanan, volBulanan * 1.5));
  const plafonRekomendasi = Math.min(100_000_000, Math.floor((omzetAcuan * faktor) / 1e6) * 1e6);

  return { skor, grade, komponen, plafonRekomendasi };
}

export interface Syarat {
  label: string;
  ok: boolean;
  link?: string;
}

export interface HasilLevel {
  level: LevelId;
  syarat: Record<2 | 3 | 4, Syarat[]>;
  skor: HasilSkor;
}

const profilLengkap = (u: Umkm) =>
  Boolean(u.namaUsaha && u.alamat && u.desa && u.deskripsi && u.produk.length > 0);

export function hitungLevel(u: Umkm, now = Date.now()): HasilLevel {
  const skor = hitungSkor(u, now);
  const omzet = omzetQrisBulanan(u, now);
  const latih = pelatihanSelesai(u);
  const kelasMutu = KELAS.filter((k) => k.wajibSiapIndustri).map((k) => k.id);
  const pangan = KATEGORI_PANGAN.includes(u.kategori);

  const syarat: HasilLevel["syarat"] = {
    2: [
      { label: "Profil usaha lengkap (alamat, deskripsi, min. 1 produk)", ok: profilLengkap(u), link: "/umkm/profil" },
      { label: "NIB sudah terbit", ok: punya(u, "NIB"), link: "/umkm/legalitas" },
      { label: `Menyelesaikan min. ${AMBANG.berkembangPelatihan} pelatihan`, ok: latih.length >= AMBANG.berkembangPelatihan, link: "/umkm/pelatihan" },
    ],
    3: [
      { label: "QRIS aktif", ok: u.qrisAktif, link: "/umkm/kredit" },
      { label: `Omzet QRIS ≥ Rp${AMBANG.mandiriOmzet / 1e6} jt/bulan`, ok: omzet >= AMBANG.mandiriOmzet, link: "/umkm/kredit" },
      { label: `Skor kredit ≥ ${AMBANG.mandiriSkor}`, ok: skor.skor >= AMBANG.mandiriSkor, link: "/umkm/kredit" },
      { label: `Menyelesaikan min. ${AMBANG.mandiriPelatihan} pelatihan`, ok: latih.length >= AMBANG.mandiriPelatihan, link: "/umkm/pelatihan" },
    ],
    4: [
      pangan
        ? { label: "PIRT dan Sertifikat Halal terbit", ok: punya(u, "PIRT") && punya(u, "HALAL"), link: "/umkm/legalitas" }
        : { label: "Merek terdaftar", ok: punya(u, "MEREK"), link: "/umkm/legalitas" },
      { label: "Lulus kelas Standar Mutu Pemasok Pabrik", ok: kelasMutu.every((id) => latih.some((p) => p.kelasId === id)), link: "/umkm/pelatihan" },
      { label: `Omzet QRIS ≥ Rp${AMBANG.siapIndustriOmzet / 1e6} jt/bulan`, ok: omzet >= AMBANG.siapIndustriOmzet, link: "/umkm/kredit" },
      { label: `Skor kredit ≥ ${AMBANG.siapIndustriSkor}`, ok: skor.skor >= AMBANG.siapIndustriSkor, link: "/umkm/kredit" },
    ],
  };

  let level: LevelId = 1;
  for (const l of [2, 3, 4] as const) {
    if (syarat[l].every((s) => s.ok)) level = l;
    else break;
  }
  return { level, syarat, skor };
}
