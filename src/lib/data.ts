import type { JenisLegalitas, LevelId } from "./types";

export const WILAYAH: Record<string, string[]> = {
  Babelan: ["Babelan Kota", "Kedung Pengawas", "Bunibakti", "Muarabakti", "Pantai Hurip"],
  Bojongmangu: ["Bojongmangu", "Sukamukti", "Karangindah"],
  Cabangbungin: ["Lenggahjaya", "Jayabakti", "Setiajaya"],
  Cibarusah: ["Cibarusah Kota", "Sindangmulya", "Ridogalih"],
  Cibitung: ["Wanasari", "Sukadanau", "Muktiwari", "Wanajaya"],
  "Cikarang Barat": ["Telaga Asih", "Telagamurni", "Gandamekar", "Kalijaya"],
  "Cikarang Pusat": ["Pasirranji", "Sukamahi", "Hegarmukti", "Cicau"],
  "Cikarang Selatan": ["Sukaresmi", "Pasirsari", "Serang", "Cibatu"],
  "Cikarang Timur": ["Jatireja", "Hegarmanah", "Karangsari"],
  "Cikarang Utara": ["Karangasih", "Simpangan", "Waluya", "Mekarmukti"],
  Karangbahagia: ["Karangbahagia", "Karangsatu", "Sukaraya"],
  Kedungwaringin: ["Kedungwaringin", "Karangmekar", "Bojongsari"],
  "Muara Gembong": ["Pantai Bahagia", "Pantai Mekar", "Pantai Harapan Jaya"],
  Pebayuran: ["Kertasari", "Sumbersari", "Bantarjaya"],
  "Serang Baru": ["Sukasari", "Jayasampurna", "Nagacipta"],
  Setu: ["Setu", "Lubangbuaya", "Burangkeng", "Cijengkol"],
  Sukakarya: ["Sukakarya", "Sukajadi", "Sukamurni"],
  Sukatani: ["Sukarukun", "Sukamanah", "Sukadarma"],
  Sukawangi: ["Sukawangi", "Sukabudi", "Sukamekar"],
  Tambelang: ["Sukamaju", "Sukarapih", "Sukabakti"],
  "Tambun Selatan": ["Mekarsari", "Tridayasakti", "Jatimulya", "Lambangsari", "Setiadarma"],
  "Tambun Utara": ["Srijaya", "Srimukti", "Karangsatria", "Sriamur"],
  Tarumajaya: ["Segarajaya", "Pahlawan Setia", "Samudrajaya", "Pantai Makmur"],
};

export const KECAMATAN = Object.keys(WILAYAH);

export const KATEGORI = [
  "Makanan & Minuman",
  "Katering",
  "Fesyen & Konveksi",
  "Kerajinan",
  "Kemasan & Percetakan",
  "Jasa Kebersihan",
  "Bengkel & Teknik",
  "Pertanian & Perikanan",
  "Toko Kelontong",
];

/** Kategori yang membutuhkan PIRT/Halal untuk naik ke Siap Industri */
export const KATEGORI_PANGAN = ["Makanan & Minuman", "Katering", "Pertanian & Perikanan"];

export const LEVEL: Record<LevelId, { nama: string; ringkas: string; warna: string }> = {
  1: { nama: "Pemula", ringkas: "Sudah terdaftar profil digital", warna: "var(--lv1)" },
  2: { nama: "Berkembang", ringkas: "Legal (NIB) dan sudah ikut pelatihan", warna: "var(--lv2)" },
  3: { nama: "Mandiri", ringkas: "QRIS aktif, omzet stabil, layak kredit", warna: "var(--lv3)" },
  4: { nama: "Siap Industri", ringkas: "Siap menjadi pemasok pabrik", warna: "var(--lv4)" },
};

export const LEGALITAS: Record<JenisLegalitas, { nama: string; penerbit: string; keterangan: string }> = {
  NIB: { nama: "Nomor Induk Berusaha (NIB)", penerbit: "OSS RBA / DPMPTSP", keterangan: "Identitas usaha wajib untuk semua UMKM" },
  PIRT: { nama: "Izin PIRT", penerbit: "Dinas Kesehatan", keterangan: "Untuk produk pangan olahan rumah tangga" },
  HALAL: { nama: "Sertifikat Halal", penerbit: "BPJPH Kemenag", keterangan: "Skema self-declare untuk usaha mikro" },
  MEREK: { nama: "Pendaftaran Merek", penerbit: "DJKI Kemenkumham", keterangan: "Perlindungan nama dan logo produk" },
};

export interface Kelas {
  id: string;
  judul: string;
  kategori: "Digital Marketing" | "Pembukuan" | "Standar Mutu" | "Legalitas" | "Keuangan";
  durasiJam: number;
  modul: string[];
  wajibSiapIndustri?: boolean;
}

export const KELAS: Kelas[] = [
  {
    id: "dm-1",
    judul: "Digital Marketing Dasar: Jualan di Media Sosial",
    kategori: "Digital Marketing",
    durasiJam: 6,
    modul: ["Membuat akun bisnis", "Foto produk dengan HP", "Menulis caption", "Iklan berbayar sederhana"],
  },
  {
    id: "dm-2",
    judul: "Marketplace & Toko Online",
    kategori: "Digital Marketing",
    durasiJam: 8,
    modul: ["Membuka toko online", "Mengatur ongkir", "Melayani pembeli", "Membaca statistik toko"],
  },
  {
    id: "pb-1",
    judul: "Pembukuan Sederhana UMKM",
    kategori: "Pembukuan",
    durasiJam: 6,
    modul: ["Memisahkan uang usaha & pribadi", "Mencatat kas harian", "Laporan laba rugi", "Menghitung HPP"],
  },
  {
    id: "kw-1",
    judul: "Literasi Keuangan & Persiapan KUR",
    kategori: "Keuangan",
    durasiJam: 4,
    modul: ["Mengenal KUR", "Menyusun rencana usaha", "Mengelola cicilan"],
  },
  {
    id: "lg-1",
    judul: "Klinik Legalitas: NIB, PIRT, Halal, Merek",
    kategori: "Legalitas",
    durasiJam: 3,
    modul: ["Daftar NIB lewat OSS", "Syarat PIRT", "Halal self-declare", "Mendaftarkan merek"],
  },
  {
    id: "sm-1",
    judul: "Standar Mutu Pemasok Pabrik",
    kategori: "Standar Mutu",
    durasiJam: 12,
    wajibSiapIndustri: true,
    modul: ["Standar K3 & higienitas", "Konsistensi kualitas & SOP", "Dokumen penawaran (quotation)", "Invoice, faktur & termin pembayaran", "Audit vendor oleh pabrik"],
  },
];

/** Mentor pendamping per kecamatan (nama fiktif untuk demo). */
const NAMA_MENTOR = [
  "Rina Wulandari", "Asep Saepudin", "Dewi Lestari", "Budi Santoso", "Siti Aminah", "Hendra Gunawan",
  "Nur Hasanah", "Agus Salim", "Yuli Rahmawati", "Dedi Kurniawan", "Lilis Suryani", "Ujang Hermawan",
  "Fitri Handayani", "Iwan Setiawan", "Euis Komalasari", "Rudi Hartono", "Wati Sumarni", "Eko Prasetyo",
  "Neneng Hasanah", "Dadang Supriatna", "Ratna Sari", "Joko Susilo", "Ani Suryani",
];

export interface Mentor {
  id: string;
  nama: string;
  kecamatan: string;
  keahlian: string;
}

const KEAHLIAN = ["Pemasaran digital", "Pembukuan & pajak", "Standar mutu produksi", "Legalitas usaha", "Akses pembiayaan"];

export const MENTOR: Mentor[] = KECAMATAN.map((k, i) => ({
  id: `m-${i + 1}`,
  nama: NAMA_MENTOR[i % NAMA_MENTOR.length],
  kecamatan: k,
  keahlian: KEAHLIAN[i % KEAHLIAN.length],
}));

/** Target 5 tahun Program 1 (dokumen Smart Economy UMKM Bekasi). */
export const TARGET_TAHUNAN = [
  { tahun: 2030, terdaftar: 25000, legal: 8000, qris: 7500, kur: 1000 },
  { tahun: 2031, terdaftar: 45000, legal: 20000, qris: 18000, kur: 2500 },
  { tahun: 2032, terdaftar: 65000, legal: 35000, qris: 32500, kur: 4500 },
  { tahun: 2033, terdaftar: 85000, legal: 50000, qris: 51000, kur: 7000 },
  { tahun: 2034, terdaftar: 100000, legal: 65000, qris: 70000, kur: 10000 },
];

export const AMBANG = {
  berkembangPelatihan: 1,
  mandiriPelatihan: 3,
  mandiriSkor: 600,
  mandiriOmzet: 10_000_000,
  siapIndustriSkor: 700,
  siapIndustriOmzet: 30_000_000,
  kurMinSkor: 550,
};
