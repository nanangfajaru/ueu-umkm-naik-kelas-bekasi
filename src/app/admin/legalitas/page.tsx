"use client";

import Link from "next/link";
import { useState } from "react";
import { Kosong, StatusBadge } from "@/components/ui";
import { LEGALITAS } from "@/lib/data";
import { tanggal } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Legalitas, StatusPengajuan } from "@/lib/types";

export default function VerifikasiLegalitas() {
  const { db, ubahUmkm } = useStore();
  const [tab, setTab] = useState<"antre" | "selesai">("antre");
  const [catatan, setCatatan] = useState<Record<string, string>>({});

  const semua = db.umkm
    .flatMap((u) => u.legalitas.map((l) => ({ u, l })))
    .sort((a, b) => a.l.tanggalAjukan.localeCompare(b.l.tanggalAjukan));
  const antre = semua.filter(({ l }) => l.status === "diajukan" || l.status === "diverifikasi");
  const selesai = semua.filter(({ l }) => l.status === "terbit" || l.status === "ditolak").reverse().slice(0, 50);

  const ubah = (umkmId: string, l: Legalitas, status: StatusPengajuan) =>
    ubahUmkm(umkmId, (x) => ({
      ...x,
      legalitas: x.legalitas.map((y) =>
        y.id === l.id
          ? {
              ...y,
              status,
              tanggalUpdate: new Date().toISOString(),
              nomor: status === "terbit" ? `${l.jenis}-${Math.floor(1e9 + Math.random() * 9e9)}` : y.nomor,
              catatan: catatan[l.id] || y.catatan,
            }
          : y,
      ),
    }));

  const daftar = tab === "antre" ? antre : selesai;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="h-page">Verifikasi Legalitas</h1>
        <p className="sub mt-1">Pengajuan NIB, PIRT, Halal, dan Merek dari pelaku UMKM.</p>
      </div>
      <div className="flex gap-2">
        <button className={tab === "antre" ? "btn-primary" : "btn-ghost"} onClick={() => setTab("antre")}>Antrean ({antre.length})</button>
        <button className={tab === "selesai" ? "btn-primary" : "btn-ghost"} onClick={() => setTab("selesai")}>Riwayat</button>
      </div>

      {daftar.length === 0 ? (
        <Kosong>Tidak ada pengajuan.</Kosong>
      ) : (
        <ul className="space-y-3">
          {daftar.map(({ u, l }) => (
            <li key={l.id} className="card flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{LEGALITAS[l.jenis].nama}</span>
                  <StatusBadge status={l.status} />
                </div>
                <p className="text-sm">
                  <Link href={`/admin/umkm/${u.id}`} className="hover:text-brand hover:underline">{u.namaUsaha}</Link>
                  <span className="text-muted"> · {u.namaPemilik} · {u.desa}, {u.kecamatan}</span>
                </p>
                <p className="text-xs text-muted">Diajukan {tanggal(l.tanggalAjukan)} · penerbit {LEGALITAS[l.jenis].penerbit}{l.nomor ? ` · No. ${l.nomor}` : ""}</p>
              </div>
              {tab === "antre" && (
                <div className="flex flex-col gap-2 md:w-80">
                  <input className="input" placeholder="Catatan (opsional)" aria-label="Catatan" value={catatan[l.id] ?? ""} onChange={(e) => setCatatan({ ...catatan, [l.id]: e.target.value })} />
                  <div className="flex gap-2">
                    {l.status === "diajukan" ? (
                      <button className="btn-primary flex-1" onClick={() => ubah(u.id, l, "diverifikasi")}>Verifikasi berkas</button>
                    ) : (
                      <button className="btn-primary flex-1" onClick={() => ubah(u.id, l, "terbit")}>Terbitkan</button>
                    )}
                    <button className="btn-ghost text-[var(--bad)]" onClick={() => ubah(u.id, l, "ditolak")}>Tolak</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
