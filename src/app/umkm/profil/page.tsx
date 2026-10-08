"use client";

import { useState } from "react";
import { KATEGORI, KECAMATAN, WILAYAH } from "@/lib/data";
import { rupiah, tanggal, uid } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function Profil() {
  const { saya, ubahUmkm } = useStore();
  const u = saya!;
  const [f, setF] = useState({
    namaUsaha: u.namaUsaha,
    kategori: u.kategori,
    kecamatan: u.kecamatan,
    desa: u.desa,
    alamat: u.alamat,
    telepon: u.telepon,
    omzetBulanan: String(Math.round(u.omzetBulanan)),
    jumlahKaryawan: String(u.jumlahKaryawan),
    deskripsi: u.deskripsi,
  });
  const [tersimpan, setTersimpan] = useState(false);
  const [produk, setProduk] = useState({ nama: "", harga: "", satuan: "pcs" });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTersimpan(false);
    setF((x) => ({ ...x, [k]: e.target.value, ...(k === "kecamatan" ? { desa: WILAYAH[e.target.value][0] } : {}) }));
  };

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    ubahUmkm(u.id, (x) => ({
      ...x,
      ...f,
      omzetBulanan: Number(f.omzetBulanan) || 0,
      jumlahKaryawan: Number(f.jumlahKaryawan) || 1,
    }));
    setTersimpan(true);
  };

  const tambahProduk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produk.nama.trim()) return;
    ubahUmkm(u.id, (x) => ({
      ...x,
      produk: [...x.produk, { id: uid("p"), nama: produk.nama.trim(), harga: Number(produk.harga) || 0, satuan: produk.satuan || "pcs" }],
    }));
    setProduk({ nama: "", harga: "", satuan: "pcs" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-page">Profil Digital</h1>
        <p className="sub mt-1">Data usaha by name by address. Terdaftar sejak {tanggal(u.tanggalDaftar)} · NIK {u.nik.slice(0, 6)}••••••••••</p>
      </div>

      <form onSubmit={simpan} className="card grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="namaUsaha">Nama usaha</label>
          <input id="namaUsaha" className="input" value={f.namaUsaha} onChange={set("namaUsaha")} />
        </div>
        <div>
          <label className="label" htmlFor="kategori">Kategori</label>
          <select id="kategori" className="input" value={f.kategori} onChange={set("kategori")}>
            {KATEGORI.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="kecamatan">Kecamatan</label>
          <select id="kecamatan" className="input" value={f.kecamatan} onChange={set("kecamatan")}>
            {KECAMATAN.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="desa">Desa / kelurahan</label>
          <select id="desa" className="input" value={f.desa} onChange={set("desa")}>
            {WILAYAH[f.kecamatan].map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="alamat">Alamat</label>
          <input id="alamat" className="input" value={f.alamat} onChange={set("alamat")} />
        </div>
        <div>
          <label className="label" htmlFor="telepon">Nomor HP</label>
          <input id="telepon" className="input" value={f.telepon} onChange={set("telepon")} />
        </div>
        <div>
          <label className="label" htmlFor="omzet">Omzet per bulan (Rp)</label>
          <input id="omzet" type="number" className="input" value={f.omzetBulanan} onChange={set("omzetBulanan")} />
        </div>
        <div>
          <label className="label" htmlFor="tk">Tenaga kerja</label>
          <input id="tk" type="number" min={1} className="input" value={f.jumlahKaryawan} onChange={set("jumlahKaryawan")} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="deskripsi">Deskripsi usaha</label>
          <textarea id="deskripsi" rows={3} className="input" value={f.deskripsi} onChange={set("deskripsi")} />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button className="btn-primary">Simpan profil</button>
          {tersimpan && <span className="text-sm text-[var(--good)]">✓ Tersimpan</span>}
        </div>
      </form>

      <section className="card">
        <h2 className="font-semibold">Katalog produk</h2>
        <p className="sub">Produk ini juga akan tampil di Pasar UMKM Bekasi (Program 2).</p>
        <ul className="mt-4 divide-y divide-line">
          {u.produk.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>{p.nama}</span>
              <span className="ml-auto tabular-nums text-ink-2">{rupiah(p.harga)} / {p.satuan}</span>
              <button
                className="text-xs text-[var(--bad)] hover:underline"
                onClick={() => ubahUmkm(u.id, (x) => ({ ...x, produk: x.produk.filter((y) => y.id !== p.id) }))}
              >
                Hapus
              </button>
            </li>
          ))}
          {!u.produk.length && <li className="py-2 text-sm text-muted">Belum ada produk.</li>}
        </ul>
        <form onSubmit={tambahProduk} className="mt-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <input className="input" placeholder="Nama produk" aria-label="Nama produk" value={produk.nama} onChange={(e) => setProduk({ ...produk, nama: e.target.value })} />
          <input className="input" type="number" placeholder="Harga" aria-label="Harga" value={produk.harga} onChange={(e) => setProduk({ ...produk, harga: e.target.value })} />
          <input className="input" placeholder="Satuan" aria-label="Satuan" value={produk.satuan} onChange={(e) => setProduk({ ...produk, satuan: e.target.value })} />
          <button className="btn-ghost">Tambah</button>
        </form>
      </section>
    </div>
  );
}
