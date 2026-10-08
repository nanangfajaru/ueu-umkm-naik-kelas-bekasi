export type LevelId = 1 | 2 | 3 | 4;

export type JenisLegalitas = "NIB" | "PIRT" | "HALAL" | "MEREK";
export type StatusPengajuan = "diajukan" | "diverifikasi" | "terbit" | "ditolak";

export interface Produk {
  id: string;
  nama: string;
  harga: number;
  satuan: string;
}

export interface Legalitas {
  id: string;
  jenis: JenisLegalitas;
  status: StatusPengajuan;
  tanggalAjukan: string;
  tanggalUpdate: string;
  nomor?: string;
  catatan?: string;
}

export interface PelatihanDiikuti {
  kelasId: string;
  progres: number; // 0-100
  selesai?: string; // tanggal selesai
}

export interface SesiMentor {
  id: string;
  mentorId: string;
  tanggal: string;
  topik: string;
  status: "dijadwalkan" | "selesai";
}

export interface Transaksi {
  id: string;
  tanggal: string; // ISO
  nominal: number;
  keterangan: string;
}

export interface PengajuanKUR {
  id: string;
  nominal: number;
  tenorBulan: number;
  tujuan: string;
  skorSaatAjukan: number;
  status: "diajukan" | "disetujui" | "ditolak";
  tanggal: string;
  catatan?: string;
}

export interface Umkm {
  id: string;
  nik: string;
  namaPemilik: string;
  telepon: string;
  namaUsaha: string;
  kategori: string;
  alamat: string;
  kecamatan: string;
  desa: string;
  omzetBulanan: number; // omzet yang dilaporkan pelaku
  jumlahKaryawan: number;
  tahunBerdiri: number;
  deskripsi: string;
  produk: Produk[];
  tanggalDaftar: string;
  legalitas: Legalitas[];
  pelatihan: PelatihanDiikuti[];
  sesiMentor: SesiMentor[];
  qrisAktif: boolean;
  merchantId?: string;
  transaksi: Transaksi[];
  kur: PengajuanKUR[];
}

export interface Session {
  role: "umkm" | "admin";
  umkmId?: string;
}

export interface Db {
  versi: number;
  umkm: Umkm[];
}
