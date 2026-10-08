# Super UMKM Bekasi

Prototipe aplikasi web **Program 1 – Super UMKM Bekasi** dari gagasan *Smart Economy UMKM Kabupaten Bekasi* (tugas kuliah Smart City, domain **Smart Economy**).

Portal profil & monitoring UMKM: satu akun untuk setiap pelaku UMKM, dengan lima modul sesuai blueprint program.

| Modul | Halaman | Fungsi |
|---|---|---|
| 1. Profil Digital | `/daftar`, `/umkm/profil` | Pendataan *by name by address*: pemilik, NIK, usaha, kategori, kecamatan/desa, omzet, tenaga kerja, katalog produk |
| 2. Legalitas | `/umkm/legalitas` | Pengajuan NIB, PIRT, Sertifikat Halal, Merek secara online + checklist dokumen; status diajukan → diverifikasi → terbit |
| 3. Pelatihan & Pembimbingan | `/umkm/pelatihan` | Kelas digital marketing, pembukuan, literasi keuangan, standar mutu pabrik; jadwal pendampingan mentor per kecamatan |
| 4. Kredit Digital | `/umkm/kredit` | QRIS merchant (simulasi pembayaran), grafik omzet mingguan, **skor kredit alternatif 300–850** dari riwayat transaksi, pengajuan KUR (Bank BJB) |
| 5. Monitoring Status | `/umkm`, `/admin` | Level otomatis: **Pemula → Berkembang → Mandiri → Siap Industri**, checklist syarat naik level |

Sisi pemerintah (admin Dinas Koperasi & UKM):

- `/admin` — Dashboard monitoring: KPI, sebaran level, rasio capaian vs target 2030, tren pendaftaran, tabel per kecamatan, dan **umpan balik kebijakan** otomatis (rekomendasi pelatihan/bantuan dari data).
- `/admin/umkm` — Basis data UMKM dengan filter & ekspor CSV; `/admin/umkm/[id]` detail per UMKM.
- `/admin/legalitas` — Antrean verifikasi dan penerbitan izin.
- `/admin/kur` — Rekomendasi pengajuan KUR berdasarkan skor kredit & plafon.

## Aturan level UMKM

| Level | Syarat |
|---|---|
| 1 Pemula | Terdaftar profil digital |
| 2 Berkembang | Profil lengkap, NIB terbit, ≥ 1 pelatihan selesai |
| 3 Mandiri | QRIS aktif, omzet QRIS ≥ Rp10 jt/bulan, skor kredit ≥ 600, ≥ 3 pelatihan |
| 4 Siap Industri | PIRT + Halal (pangan) atau Merek (non-pangan), lulus kelas Standar Mutu Pemasok Pabrik, omzet QRIS ≥ Rp30 jt/bulan, skor ≥ 700 |

Ambang batas dapat diubah di `src/lib/data.ts` (`AMBANG`). Logika skor & level ada di `src/lib/scoring.ts`.

## Skor kredit alternatif (300–850)

300 + frekuensi transaksi QRIS 90 hari (150) + volume transaksi (150) + konsistensi mingguan (100) + legalitas (75) + pelatihan (60) + lama usaha (15). Skor ≥ 550 dapat mengajukan KUR; plafon rekomendasi = omzet bulanan × faktor skor (maks. Rp100 jt, batas KUR mikro).

## Menjalankan

```bash
npm install
npm run dev     # http://localhost:3000
# atau
npm run build && npm start
```

Akun demo (halaman **Masuk**):
- **Pelaku UMKM**: tombol "Masuk sebagai Bu Sari" (Keripik Singkong Bu Sari, Cikarang Utara — Level Berkembang), atau masuk dengan NIK/no. HP akun yang baru didaftarkan.
- **Admin**: tombol "Masuk ke Dashboard Admin (demo)".

## Catatan prototipe

- Data disimpan di `localStorage` browser dan diisi otomatis dengan ±140 UMKM contoh yang tersebar di 23 kecamatan Kabupaten Bekasi (nama orang & usaha fiktif). Tombol **Reset data demo** di dashboard admin mengembalikan data awal.
- Autentikasi, integrasi OSS/BPJPH/DJKI, PJP QRIS, dan Bank BJB disimulasikan. Untuk implementasi nyata, ganti `src/lib/store.tsx` dengan API + basis data (mis. PostgreSQL) dan SSO.
- Target & data latar belakang mengacu pada dokumen *Smart Economy UMKM – Super UMKM Bekasi & Pasar UMKM Bekasi* (RLPPD Kab. Bekasi 2024, BPS, Kemenkop UKM).

## Teknologi

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4. Tanpa library grafik eksternal.
