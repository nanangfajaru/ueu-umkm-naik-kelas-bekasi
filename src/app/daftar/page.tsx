"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KATEGORI, KECAMATAN, WILAYAH } from "@/lib/data";
import { uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Umkm } from "@/lib/types";

const KOSONG = {
  namaPemilik: "",
  nik: "",
  telepon: "",
  namaUsaha: "",
  kategori: KATEGORI[0],
  kecamatan: "",
  desa: "",
  alamat: "",
  omzetBulanan: "",
  jumlahKaryawan: "1",
  tahunBerdiri: String(new Date().getFullYear()),
  deskripsi: "",
  produkNama: "",
  produkHarga: "",
};

export default function Daftar() {
  const { db, tambahUmkm, masuk } = useStore();
  const router = useRouter();
  const [f, setF] = useState(KOSONG);
  const [galat, setGalat] = useState<Record<string, string>>({});

  const set = (k: keyof typeof KOSONG) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((x) => ({ ...x, [k]: e.target.value, ...(k === "kecamatan" ? { desa: "" } : {}) }));

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    const g: Record<string, string> = {};
    if (!f.namaPemilik.trim()) g.namaPemilik = "Wajib diisi";
    if (!/^\d{16}$/.test(f.nik)) g.nik = "NIK harus 16 digit angka";
    else if (db.umkm.some((u) => u.nik === f.nik)) g.nik = "NIK sudah terdaftar, silakan masuk";
    if (!/^08\d{8,11}$/.test(f.telepon)) g.telepon = "Format 08xxxxxxxxxx";
    if (!f.namaUsaha.trim()) g.namaUsaha = "Wajib diisi";
    if (!f.kecamatan) g.kecamatan = "Pilih kecamatan";
    if (!f.desa) g.desa = "Pilih desa/kelurahan";
    if (!f.alamat.trim()) g.alamat = "Wajib diisi";
    if (!(Number(f.omzetBulanan) >= 0) || f.omzetBulanan === "") g.omzetBulanan = "Isi perkiraan omzet";
    setGalat(g);
    if (Object.keys(g).length) return;

    const u: Umkm = {
      id: uid("u-"),
      nik: f.nik,
      namaPemilik: f.namaPemilik.trim(),
      telepon: f.telepon,
      namaUsaha: f.namaUsaha.trim(),
      kategori: f.kategori,
      alamat: f.alamat.trim(),
      kecamatan: f.kecamatan,
      desa: f.desa,
      omzetBulanan: Number(f.omzetBulanan),
      jumlahKaryawan: Number(f.jumlahKaryawan) || 1,
      tahunBerdiri: Number(f.tahunBerdiri) || new Date().getFullYear(),
      deskripsi: f.deskripsi.trim(),
      produk: f.produkNama.trim()
        ? [{ id: uid("p"), nama: f.produkNama.trim(), harga: Number(f.produkHarga) || 0, satuan: "pcs" }]
        : [],
      tanggalDaftar: new Date().toISOString(),
      legalitas: [],
      pelatihan: [],
      sesiMentor: [],
      qrisAktif: false,
      transaksi: [],
      kur: [],
    };
    tambahUmkm(u);
    masuk({ role: "umkm", umkmId: u.id });
    router.push("/umkm");
  };

  const Field = ({ k, label, children }: { k: string; label: string; children: React.ReactNode }) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      {children}
      {galat[k] && <p className="mt-1 text-xs text-[var(--bad)]">{galat[k]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="h-page">Daftar Profil Digital UMKM</h1>
      <p className="sub mt-1">Langkah 1 dari 5 · Satu akun untuk setiap pelaku UMKM, dicatat by name by address.</p>

      <form onSubmit={kirim} className="mt-6 space-y-6" noValidate>
        <fieldset className="card grid gap-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">Data pemilik</legend>
          {Field({ k: "namaPemilik", label: "Nama lengkap", children: <input id="namaPemilik" className="input" value={f.namaPemilik} onChange={set("namaPemilik")} /> })}
          {Field({ k: "nik", label: "NIK (16 digit)", children: <input id="nik" inputMode="numeric" maxLength={16} className="input" value={f.nik} onChange={set("nik")} /> })}
          {Field({ k: "telepon", label: "Nomor HP / WhatsApp", children: <input id="telepon" inputMode="tel" className="input" value={f.telepon} onChange={set("telepon")} /> })}
        </fieldset>

        <fieldset className="card grid gap-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">Data usaha</legend>
          {Field({ k: "namaUsaha", label: "Nama usaha", children: <input id="namaUsaha" className="input" value={f.namaUsaha} onChange={set("namaUsaha")} /> })}
          {Field({
            k: "kategori",
            label: "Kategori usaha",
            children: (
              <select id="kategori" className="input" value={f.kategori} onChange={set("kategori")}>
                {KATEGORI.map((k) => <option key={k}>{k}</option>)}
              </select>
            ),
          })}
          {Field({ k: "omzetBulanan", label: "Perkiraan omzet per bulan (Rp)", children: <input id="omzetBulanan" type="number" min={0} className="input" value={f.omzetBulanan} onChange={set("omzetBulanan")} /> })}
          {Field({ k: "jumlahKaryawan", label: "Jumlah tenaga kerja (termasuk pemilik)", children: <input id="jumlahKaryawan" type="number" min={1} className="input" value={f.jumlahKaryawan} onChange={set("jumlahKaryawan")} /> })}
          {Field({ k: "tahunBerdiri", label: "Tahun mulai usaha", children: <input id="tahunBerdiri" type="number" className="input" value={f.tahunBerdiri} onChange={set("tahunBerdiri")} /> })}
          <div className="sm:col-span-2">
            {Field({ k: "deskripsi", label: "Deskripsi singkat", children: <textarea id="deskripsi" rows={2} className="input" value={f.deskripsi} onChange={set("deskripsi")} /> })}
          </div>
        </fieldset>

        <fieldset className="card grid gap-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">Lokasi usaha</legend>
          {Field({
            k: "kecamatan",
            label: "Kecamatan",
            children: (
              <select id="kecamatan" className="input" value={f.kecamatan} onChange={set("kecamatan")}>
                <option value="">— pilih —</option>
                {KECAMATAN.map((k) => <option key={k}>{k}</option>)}
              </select>
            ),
          })}
          {Field({
            k: "desa",
            label: "Desa / kelurahan",
            children: (
              <select id="desa" className="input" value={f.desa} onChange={set("desa")} disabled={!f.kecamatan}>
                <option value="">— pilih —</option>
                {(WILAYAH[f.kecamatan] ?? []).map((d) => <option key={d}>{d}</option>)}
              </select>
            ),
          })}
          <div className="sm:col-span-2">
            {Field({ k: "alamat", label: "Alamat lengkap (jalan, RT/RW)", children: <input id="alamat" className="input" value={f.alamat} onChange={set("alamat")} /> })}
          </div>
        </fieldset>

        <fieldset className="card grid gap-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">Produk utama (opsional)</legend>
          {Field({ k: "produkNama", label: "Nama produk", children: <input id="produkNama" className="input" value={f.produkNama} onChange={set("produkNama")} /> })}
          {Field({ k: "produkHarga", label: "Harga (Rp)", children: <input id="produkHarga" type="number" min={0} className="input" value={f.produkHarga} onChange={set("produkHarga")} /> })}
        </fieldset>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted">Data dipakai Pemkab Bekasi untuk pembinaan UMKM sesuai UU Pelindungan Data Pribadi.</p>
          <button className="btn-primary px-6">Daftar</button>
        </div>
      </form>
    </div>
  );
}
