"use client";

import Link from "next/link";
import { use } from "react";
import { LevelBadge, LevelTrack, Progress, StatusBadge } from "@/components/ui";
import { KELAS, LEVEL } from "@/lib/data";
import { rupiah, rupiahRingkas, tanggal } from "@/lib/format";
import { hitungLevel, omzetQrisBulanan } from "@/lib/scoring";
import { useStore } from "@/lib/store";

export default function DetailUmkm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { db } = useStore();
  const u = db.umkm.find((x) => x.id === id);
  if (!u) return <p className="py-16 text-center text-muted">UMKM tidak ditemukan. <Link href="/admin/umkm" className="text-brand">Kembali</Link></p>;
  const { level, syarat, skor } = hitungLevel(u);

  return (
    <div className="space-y-6">
      <Link href="/admin/umkm" className="text-sm text-brand">← Data UMKM</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-page">{u.namaUsaha}</h1>
          <p className="sub mt-1">{u.namaPemilik} · {u.kategori} · {u.id}</p>
        </div>
        <LevelBadge level={level} />
      </div>

      <section className="card"><LevelTrack level={level} /></section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-semibold">Profil</h2>
          <dl className="mt-3 grid grid-cols-[9rem_1fr] gap-y-1.5 text-sm">
            <dt className="text-muted">Alamat</dt><dd>{u.alamat}, Desa {u.desa}, Kec. {u.kecamatan}</dd>
            <dt className="text-muted">Telepon</dt><dd>{u.telepon}</dd>
            <dt className="text-muted">Berdiri</dt><dd>{u.tahunBerdiri}</dd>
            <dt className="text-muted">Tenaga kerja</dt><dd>{u.jumlahKaryawan} orang</dd>
            <dt className="text-muted">Omzet dilaporkan</dt><dd>{rupiah(u.omzetBulanan)}/bulan</dd>
            <dt className="text-muted">Omzet QRIS</dt><dd>{rupiahRingkas(omzetQrisBulanan(u))}/bulan</dd>
            <dt className="text-muted">Terdaftar</dt><dd>{tanggal(u.tanggalDaftar)}</dd>
            <dt className="text-muted">Produk</dt><dd>{u.produk.map((p) => p.nama).join(", ") || "–"}</dd>
          </dl>
          {u.deskripsi && <p className="mt-3 text-sm text-ink-2">{u.deskripsi}</p>}
        </section>

        <section className="card">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Skor kredit</h2>
            <span className="text-2xl font-semibold tabular-nums">{skor.skor} <span className="text-sm font-normal text-ink-2">{skor.grade}</span></span>
          </div>
          <ul className="mt-3 space-y-2">
            {skor.komponen.map((k) => (
              <li key={k.label} className="text-sm">
                <div className="flex justify-between"><span>{k.label}</span><span className="tabular-nums text-ink-2">{k.nilai}/{k.maks}</span></div>
                <Progress nilai={k.nilai} maks={k.maks} label={k.label} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-2">Plafon KUR rekomendasi: <b>{rupiah(skor.plafonRekomendasi)}</b></p>
        </section>

        <section className="card">
          <h2 className="font-semibold">Pemenuhan syarat level</h2>
          {([2, 3, 4] as const).map((l) => (
            <div key={l} className="mt-3">
              <p className="text-sm font-medium">Level {l} · {LEVEL[l].nama}</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {syarat[l].map((s) => (
                  <li key={s.label} className={s.ok ? "text-ink-2" : "text-muted"}>{s.ok ? "✓" : "○"} {s.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="card space-y-4">
          <div>
            <h2 className="font-semibold">Legalitas</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {u.legalitas.map((l) => (
                <li key={l.id} className="flex justify-between"><span>{l.jenis} {l.nomor && <span className="font-mono text-xs text-muted">{l.nomor}</span>}</span><StatusBadge status={l.status} /></li>
              ))}
              {!u.legalitas.length && <li className="text-muted">Belum ada.</li>}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Pelatihan</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {u.pelatihan.map((p) => (
                <li key={p.kelasId} className="flex justify-between gap-2">
                  <span>{KELAS.find((k) => k.id === p.kelasId)?.judul}</span>
                  <span className="shrink-0 text-ink-2">{p.selesai ? "Lulus" : `${p.progres}%`}</span>
                </li>
              ))}
              {!u.pelatihan.length && <li className="text-muted">Belum ada.</li>}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">KUR</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {u.kur.map((k) => (
                <li key={k.id} className="flex justify-between"><span>{rupiah(k.nominal)} · {k.tenorBulan} bln</span><StatusBadge status={k.status} /></li>
              ))}
              {!u.kur.length && <li className="text-muted">Belum ada.</li>}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
