import { KATEGORI, KATEGORI_PANGAN, KELAS, MENTOR, WILAYAH, KECAMATAN } from "./data";
import type { Db, JenisLegalitas, Legalitas, Produk, Transaksi, Umkm } from "./types";

export const VERSI_DB = 1;
const HARI = 24 * 60 * 60 * 1000;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DEPAN = ["Siti", "Ahmad", "Dewi", "Rudi", "Nur", "Yanti", "Dedi", "Lina", "Hasan", "Ika", "Ujang", "Euis", "Tono", "Wulan", "Iis", "Bambang", "Rina", "Aep", "Neni", "Fajar"];
const BELAKANG = ["Rahayu", "Hidayat", "Purnama", "Saputra", "Lestari", "Maulana", "Kurnia", "Fauzi", "Wahyuni", "Sopian", "Rohmah", "Permana"];

const USAHA: Record<string, { nama: string[]; produk: [string, number, string][] }> = {
  "Makanan & Minuman": {
    nama: ["Keripik Singkong", "Dodol Betawi", "Kue Kering", "Sambal Rumahan", "Kopi Bubuk", "Rengginang", "Bandeng Presto"],
    produk: [["Keripik 250 gr", 15000, "bungkus"], ["Kue kering toples", 65000, "toples"], ["Sambal botol", 25000, "botol"], ["Kopi bubuk 200 gr", 35000, "pak"]],
  },
  Katering: {
    nama: ["Katering Sehat", "Dapur Ibu", "Nasi Kotak", "Katering Berkah"],
    produk: [["Nasi kotak karyawan", 22000, "porsi"], ["Snack box rapat", 12000, "kotak"], ["Prasmanan", 45000, "pax"]],
  },
  "Fesyen & Konveksi": {
    nama: ["Konveksi", "Jahit Seragam", "Batik Bekasi", "Sablon Kaos"],
    produk: [["Seragam kerja", 150000, "stel"], ["Kaos sablon", 55000, "pcs"], ["Wearpack", 210000, "pcs"]],
  },
  Kerajinan: {
    nama: ["Anyaman Bambu", "Kerajinan Kayu", "Tas Daur Ulang"],
    produk: [["Tas anyaman", 85000, "pcs"], ["Hiasan dinding", 120000, "pcs"]],
  },
  "Kemasan & Percetakan": {
    nama: ["Kemasan Kardus", "Percetakan", "Box Packaging"],
    produk: [["Kardus custom", 4500, "pcs"], ["Label stiker", 800, "lembar"], ["Paper bag", 3500, "pcs"]],
  },
  "Jasa Kebersihan": {
    nama: ["Jasa Bersih", "Cleaning Service", "Laundry Kiloan"],
    produk: [["Cleaning service bulanan", 4500000, "orang/bln"], ["Laundry kiloan", 8000, "kg"]],
  },
  "Bengkel & Teknik": {
    nama: ["Bengkel Las", "Bubut Presisi", "Servis AC"],
    produk: [["Jasa las rak besi", 750000, "unit"], ["Servis AC", 85000, "unit"]],
  },
  "Pertanian & Perikanan": {
    nama: ["Ikan Bandeng", "Sayur Hidroponik", "Telur Ayam", "Beras Pandan Wangi"],
    produk: [["Bandeng segar", 35000, "kg"], ["Selada hidroponik", 12000, "ikat"], ["Beras 5 kg", 75000, "karung"]],
  },
  "Toko Kelontong": {
    nama: ["Warung Sembako", "Toko Kelontong", "Warung Madura"],
    produk: [["Paket sembako", 150000, "paket"]],
  },
};

function pilih<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

function buatTransaksi(r: () => number, now: number, perHari: number, rataNominal: number, mulaiHari: number): Transaksi[] {
  const out: Transaksi[] = [];
  for (let d = mulaiHari; d >= 0; d--) {
    const libur = r() < 0.15;
    if (libur) continue;
    const n = Math.floor(perHari * (0.5 + r()));
    for (let i = 0; i < n; i++) {
      const t = now - d * HARI - Math.floor(r() * 10) * 60 * 60 * 1000;
      out.push({
        id: `t${Math.floor(r() * 1e9).toString(36)}`,
        tanggal: new Date(t).toISOString(),
        nominal: Math.max(5000, Math.round((rataNominal * (0.4 + r() * 1.2)) / 500) * 500),
        keterangan: "Pembayaran QRIS",
      });
    }
  }
  return out.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

function legal(jenis: JenisLegalitas, status: Legalitas["status"], hariLalu: number, now: number, r: () => number): Legalitas {
  const tgl = new Date(now - hariLalu * HARI).toISOString();
  return {
    id: `l${Math.floor(r() * 1e9).toString(36)}`,
    jenis,
    status,
    tanggalAjukan: tgl,
    tanggalUpdate: new Date(now - Math.max(hariLalu - 7, 0) * HARI).toISOString(),
    nomor: status === "terbit" ? `${jenis}-${Math.floor(1e9 + r() * 9e9)}` : undefined,
  };
}

/**
 * tahap: 0 = baru daftar, 1 = berkembang, 2 = mandiri, 3 = siap industri.
 */
function buatUmkm(i: number, r: () => number, now: number, tahap: number): Umkm {
  const kecamatan = pilih(r, KECAMATAN);
  const desa = pilih(r, WILAYAH[kecamatan]);
  const kategori = pilih(r, KATEGORI);
  const pangan = KATEGORI_PANGAN.includes(kategori);
  const info = USAHA[kategori];
  const pemilik = `${pilih(r, DEPAN)} ${pilih(r, BELAKANG)}`;
  const namaUsaha = `${pilih(r, info.nama)} ${pemilik.split(" ")[0]}`;
  const produk: Produk[] = info.produk
    .filter(() => r() < 0.8)
    .map(([nama, harga, satuan], j) => ({ id: `p${i}-${j}`, nama, harga, satuan }));
  const daftarHari = 30 + Math.floor(r() * 300);

  const legalitas: Legalitas[] = [];
  if (tahap >= 1) legalitas.push(legal("NIB", "terbit", daftarHari - 5, now, r));
  else if (r() < 0.4) legalitas.push(legal("NIB", r() < 0.5 ? "diajukan" : "diverifikasi", 3 + Math.floor(r() * 10), now, r));
  if (tahap >= 3) {
    if (pangan) {
      legalitas.push(legal("PIRT", "terbit", daftarHari - 30, now, r), legal("HALAL", "terbit", daftarHari - 40, now, r));
    } else legalitas.push(legal("MEREK", "terbit", daftarHari - 40, now, r));
  } else if (tahap >= 1 && r() < 0.5) {
    legalitas.push(legal(pangan ? "PIRT" : "MEREK", pilih(r, ["diajukan", "diverifikasi", "terbit"] as const), 10 + Math.floor(r() * 30), now, r));
  }

  const jumlahKelas = tahap === 0 ? (r() < 0.3 ? 1 : 0) : tahap === 1 ? 1 + Math.floor(r() * 2) : 3 + Math.floor(r() * 2);
  const kelasUmum = KELAS.filter((k) => !k.wajibSiapIndustri);
  const pelatihan = kelasUmum.slice(0, jumlahKelas).map((k, j) => ({
    kelasId: k.id,
    progres: tahap === 0 ? 50 : 100,
    selesai: tahap === 0 ? undefined : new Date(now - (daftarHari - 10 - j * 10) * HARI).toISOString(),
  }));
  if (tahap >= 3) pelatihan.push({ kelasId: "sm-1", progres: 100, selesai: new Date(now - 20 * HARI).toISOString() });
  else if (tahap === 2 && r() < 0.5) pelatihan.push({ kelasId: "sm-1", progres: 40, selesai: undefined });

  const qrisAktif = tahap >= 2 || (tahap === 1 && r() < 0.5);
  const transaksi = qrisAktif
    ? buatTransaksi(
        r,
        now,
        tahap === 3 ? 10 : tahap === 2 ? 6 : 2,
        tahap === 3 ? 140000 : tahap === 2 ? 90000 : 50000,
        Math.min(daftarHari - 20, 95),
      )
    : [];
  const mentor = MENTOR.find((m) => m.kecamatan === kecamatan)!;

  return {
    id: `u-${String(i + 1).padStart(4, "0")}`,
    nik: `3216${Math.floor(1e11 + r() * 9e11)}`,
    namaPemilik: pemilik,
    telepon: `08${Math.floor(1e9 + r() * 9e9)}`,
    namaUsaha,
    kategori,
    alamat: `Jl. ${pilih(r, ["Raya", "Melati", "Kenanga", "Pahlawan", "Mawar", "Masjid"])} No. ${1 + Math.floor(r() * 120)}, RT 0${1 + Math.floor(r() * 9)}/RW 0${1 + Math.floor(r() * 9)}`,
    kecamatan,
    desa,
    omzetBulanan: [3, 8, 18, 45][tahap] * 1e6 * (0.7 + r() * 0.6),
    jumlahKaryawan: [1, 2, 4, 9][tahap] + Math.floor(r() * 3),
    tahunBerdiri: new Date(now).getFullYear() - 1 - Math.floor(r() * 8),
    deskripsi: tahap === 0 && r() < 0.4 ? "" : `${kategori} rumahan dari Desa ${desa}, Kec. ${kecamatan}.`,
    produk: tahap === 0 && r() < 0.3 ? [] : produk.length ? produk : [{ id: `p${i}-0`, nama: info.produk[0][0], harga: info.produk[0][1], satuan: info.produk[0][2] }],
    tanggalDaftar: new Date(now - daftarHari * HARI).toISOString(),
    legalitas,
    pelatihan,
    sesiMentor:
      tahap >= 1
        ? [{ id: `s${i}`, mentorId: mentor.id, tanggal: new Date(now - 14 * HARI).toISOString(), topik: "Evaluasi usaha bulanan", status: "selesai" }]
        : [],
    qrisAktif,
    merchantId: qrisAktif ? `ID${Math.floor(1e12 + r() * 9e12)}` : undefined,
    transaksi,
    kur:
      tahap >= 2 && r() < 0.6
        ? [{
            id: `k${i}`,
            nominal: tahap === 3 ? 75_000_000 : 25_000_000,
            tenorBulan: 24,
            tujuan: "Tambahan modal kerja",
            skorSaatAjukan: tahap === 3 ? 760 : 640,
            status: r() < 0.7 ? "disetujui" : "diajukan",
            tanggal: new Date(now - 40 * HARI).toISOString(),
          }]
        : [],
  };
}

/** Akun demo pelaku UMKM: Level Berkembang, sedang menuju Mandiri. */
function akunDemo(now: number, r: () => number): Umkm {
  return {
    id: "u-demo",
    nik: "3216054107880001",
    namaPemilik: "Sari Rahmawati",
    telepon: "081234567890",
    namaUsaha: "Keripik Singkong Bu Sari",
    kategori: "Makanan & Minuman",
    alamat: "Jl. Kenanga No. 12, RT 03/RW 05",
    kecamatan: "Cikarang Utara",
    desa: "Karangasih",
    omzetBulanan: 12_000_000,
    jumlahKaryawan: 3,
    tahunBerdiri: new Date(now).getFullYear() - 4,
    deskripsi: "Keripik singkong pedas manis khas Cikarang, diproduksi harian tanpa pengawet.",
    produk: [
      { id: "pd-1", nama: "Keripik singkong balado 250 gr", harga: 15000, satuan: "bungkus" },
      { id: "pd-2", nama: "Keripik singkong original 500 gr", harga: 25000, satuan: "bungkus" },
    ],
    tanggalDaftar: new Date(now - 120 * HARI).toISOString(),
    legalitas: [legal("NIB", "terbit", 110, now, r), legal("PIRT", "diverifikasi", 12, now, r)],
    pelatihan: [
      { kelasId: "dm-1", progres: 100, selesai: new Date(now - 90 * HARI).toISOString() },
      { kelasId: "pb-1", progres: 100, selesai: new Date(now - 60 * HARI).toISOString() },
      { kelasId: "dm-2", progres: 50 },
    ],
    sesiMentor: [
      { id: "sd-1", mentorId: MENTOR.find((m) => m.kecamatan === "Cikarang Utara")!.id, tanggal: new Date(now - 21 * HARI).toISOString(), topik: "Foto produk & harga jual", status: "selesai" },
    ],
    qrisAktif: true,
    merchantId: "ID1029384756123",
    transaksi: buatTransaksi(r, now, 4, 60000, 70),
    kur: [],
  };
}

export function buatSeed(now = Date.now()): Db {
  const r = mulberry32(2029);
  const umkm: Umkm[] = [akunDemo(now, r)];
  const distribusi = [0.4, 0.3, 0.2, 0.1];
  for (let i = 0; i < 140; i++) {
    const x = r();
    let acc = 0;
    let tahap = 0;
    for (let t = 0; t < distribusi.length; t++) {
      acc += distribusi[t];
      if (x < acc) { tahap = t; break; }
    }
    umkm.push(buatUmkm(i, r, now, tahap));
  }
  return { versi: VERSI_DB, umkm };
}
