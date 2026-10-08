"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { LevelBadge } from "@/components/ui";
import { KATEGORI, KECAMATAN, LEVEL } from "@/lib/data";
import { angka, rupiahRingkas, tanggal } from "@/lib/format";
import { barisUmkm } from "@/lib/statistik";
import { punya } from "@/lib/scoring";
import { useStore } from "@/lib/store";

function DaftarUmkm() {
  const { db } = useStore();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [kec, setKec] = useState(params.get("kecamatan") ?? "");
  const [kat, setKat] = useState("");
  const [lv, setLv] = useState("");
  const rows = useMemo(() => barisUmkm(db.umkm), [db]);

  const hasil = rows.filter(
    (r) =>
      (!q || `${r.u.namaUsaha} ${r.u.namaPemilik} ${r.u.desa} ${r.u.id}`.toLowerCase().includes(q.toLowerCase())) &&
      (!kec || r.u.kecamatan === kec) &&
      (!kat || r.u.kategori === kat) &&
      (!lv || String(r.level) === lv),
  );

  const unduhCsv = () => {
    const kepala = ["id", "nama_usaha", "pemilik", "kategori", "kecamatan", "desa", "alamat", "level", "skor_kredit", "nib", "qris", "omzet_qris_bulan", "tenaga_kerja", "tanggal_daftar"];
    const isi = hasil.map((r) =>
      [r.u.id, r.u.namaUsaha, r.u.namaPemilik, r.u.kategori, r.u.kecamatan, r.u.desa, r.u.alamat, LEVEL[r.level].nama, r.skor, punya(r.u, "NIB") ? "ya" : "tidak", r.u.qrisAktif ? "ya" : "tidak", Math.round(r.omzetQris), r.u.jumlahKaryawan, r.u.tanggalDaftar.slice(0, 10)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[kepala.join(","), ...isi].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `data-umkm-bekasi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-page">Data UMKM</h1>
          <p className="sub mt-1">Basis data UMKM by name by address · {angka(hasil.length)} dari {angka(rows.length)} UMKM</p>
        </div>
        <button className="btn-ghost" onClick={unduhCsv}>Unduh CSV</button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Cari nama usaha, pemilik, desa…" aria-label="Cari" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" aria-label="Kecamatan" value={kec} onChange={(e) => setKec(e.target.value)}>
          <option value="">Semua kecamatan</option>
          {KECAMATAN.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select className="input" aria-label="Kategori" value={kat} onChange={(e) => setKat(e.target.value)}>
          <option value="">Semua kategori</option>
          {KATEGORI.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select className="input" aria-label="Level" value={lv} onChange={(e) => setLv(e.target.value)}>
          <option value="">Semua level</option>
          {[1, 2, 3, 4].map((l) => <option key={l} value={l}>Level {l} · {LEVEL[l as 1].nama}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="tbl min-w-[860px]">
          <thead>
            <tr>
              <th>Usaha</th>
              <th>Lokasi</th>
              <th>Level</th>
              <th className="text-right">Skor</th>
              <th className="text-right">Omzet QRIS/bln</th>
              <th>Terdaftar</th>
            </tr>
          </thead>
          <tbody>
            {hasil.slice(0, 200).map((r) => (
              <tr key={r.u.id} className="hover:bg-surface-2">
                <td>
                  <Link href={`/admin/umkm/${r.u.id}`} className="font-medium hover:text-brand hover:underline">{r.u.namaUsaha}</Link>
                  <div className="text-xs text-muted">{r.u.namaPemilik} · {r.u.kategori}</div>
                </td>
                <td>
                  {r.u.desa}
                  <div className="text-xs text-muted">Kec. {r.u.kecamatan}</div>
                </td>
                <td><LevelBadge level={r.level} /></td>
                <td className="text-right tabular-nums">{r.skor}</td>
                <td className="text-right tabular-nums">{rupiahRingkas(r.omzetQris)}</td>
                <td className="text-ink-2">{tanggal(r.u.tanggalDaftar)}</td>
              </tr>
            ))}
            {!hasil.length && (
              <tr><td colSpan={6} className="py-8 text-center text-muted">Tidak ada data yang cocok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Halaman() {
  return (
    <Suspense>
      <DaftarUmkm />
    </Suspense>
  );
}
