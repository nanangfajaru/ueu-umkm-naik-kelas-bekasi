"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function Masuk() {
  const { db, masuk } = useStore();
  const router = useRouter();
  const [id, setId] = useState("");
  const [galat, setGalat] = useState("");

  const masukUmkm = (umkmId: string) => {
    masuk({ role: "umkm", umkmId });
    router.push("/umkm");
  };

  const cari = (e: React.FormEvent) => {
    e.preventDefault();
    const q = id.trim();
    const u = db.umkm.find((x) => x.nik === q || x.telepon === q);
    if (!u) return setGalat("NIK atau nomor HP tidak ditemukan. Belum daftar? Gunakan tombol Daftar UMKM.");
    masukUmkm(u.id);
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 py-6 md:grid-cols-2">
      <div className="card">
        <h1 className="text-lg font-semibold">Masuk sebagai pelaku UMKM</h1>
        <p className="sub mt-1">Gunakan NIK atau nomor HP yang didaftarkan.</p>
        <form onSubmit={cari} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="id">NIK / Nomor HP</label>
            <input id="id" className="input" value={id} onChange={(e) => { setId(e.target.value); setGalat(""); }} placeholder="3216… atau 08…" />
          </div>
          {galat && <p className="text-sm text-[var(--bad)]">{galat}</p>}
          <button className="btn-primary w-full">Masuk</button>
        </form>
        <div className="mt-6 rounded-lg bg-surface-2 p-4 text-sm">
          <p className="font-medium">Akun demo</p>
          <p className="mt-1 text-muted">Keripik Singkong Bu Sari · Cikarang Utara (Level Berkembang, sedang menuju Mandiri)</p>
          <button className="btn-ghost mt-3" onClick={() => masukUmkm("u-demo")}>Masuk sebagai Bu Sari</button>
        </div>
        <p className="mt-4 text-sm text-muted">
          Belum punya akun? <Link href="/daftar" className="font-medium text-brand">Daftar UMKM</Link>
        </p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Masuk sebagai admin</h2>
        <p className="sub mt-1">Untuk petugas Dinas Koperasi &amp; UKM / Bappeda: dashboard monitoring, verifikasi legalitas, dan rekomendasi KUR.</p>
        <button
          className="btn-primary mt-4 w-full"
          onClick={() => {
            masuk({ role: "admin" });
            router.push("/admin");
          }}
        >
          Masuk ke Dashboard Admin (demo)
        </button>
        <p className="mt-3 text-xs text-muted">Prototipe: autentikasi disimulasikan, belum terhubung ke SSO pemerintah.</p>
      </div>
    </div>
  );
}
