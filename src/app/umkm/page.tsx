"use client";

import Link from "next/link";
import { LevelBadge, LevelTrack, Kpi, StatusBadge } from "@/components/ui";
import { LEVEL, MENTOR } from "@/lib/data";
import { rupiahRingkas, tanggal } from "@/lib/format";
import { hitungLevel, legalTerbit, omzetQrisBulanan, pelatihanSelesai } from "@/lib/scoring";
import { useStore } from "@/lib/store";

export default function BerandaUmkm() {
  const { saya } = useStore();
  const u = saya!;
  const { level, syarat, skor } = hitungLevel(u);
  const berikut = level < 4 ? ((level + 1) as 2 | 3 | 4) : null;
  const mentor = MENTOR.find((m) => m.kecamatan === u.kecamatan);
  const sesi = u.sesiMentor.filter((s) => s.status === "dijadwalkan");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="sub">Halo, {u.namaPemilik}</p>
          <h1 className="h-page">{u.namaUsaha}</h1>
          <p className="sub mt-1">
            {u.kategori} · Desa {u.desa}, Kec. {u.kecamatan} · ID {u.id}
          </p>
        </div>
        <LevelBadge level={level} />
      </div>

      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">Status UMKM</h2>
          <p className="sub">Level dihitung otomatis setiap ada data baru.</p>
        </div>
        <LevelTrack level={level} />
        {berikut ? (
          <div className="rounded-lg bg-surface-2 p-4">
            <p className="text-sm font-medium">
              Syarat naik ke Level {berikut} · {LEVEL[berikut].nama}
            </p>
            <ul className="mt-2 space-y-1.5">
              {syarat[berikut].map((s) => (
                <li key={s.label} className="flex items-start gap-2 text-sm">
                  <span className={s.ok ? "text-[var(--good)]" : "text-muted"} aria-label={s.ok ? "terpenuhi" : "belum"}>
                    {s.ok ? "✓" : "○"}
                  </span>
                  <span className={s.ok ? "text-ink-2 line-through decoration-1" : ""}>{s.label}</span>
                  {!s.ok && s.link && (
                    <Link href={s.link} className="ml-auto shrink-0 text-xs font-medium text-brand">Kerjakan →</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="rounded-lg bg-brand-soft p-4 text-sm text-brand-strong">
            Selamat! Usaha Anda berstatus <b>Siap Industri</b> dan dapat mengikuti tender kebutuhan non-inti pabrik di Pasar UMKM Bekasi (Program 2).
          </p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Skor kredit" nilai={skor.skor} catatan={skor.grade} />
        <Kpi label="Omzet QRIS / bulan" nilai={rupiahRingkas(omzetQrisBulanan(u))} catatan={u.qrisAktif ? "rata-rata 90 hari" : "QRIS belum aktif"} />
        <Kpi label="Izin terbit" nilai={`${legalTerbit(u).length} / 4`} catatan="NIB · PIRT · Halal · Merek" />
        <Kpi label="Pelatihan selesai" nilai={pelatihanSelesai(u).length} catatan={`${u.pelatihan.length - pelatihanSelesai(u).length} sedang berjalan`} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">Mentor pendamping</h2>
          {mentor && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-strong">
                {mentor.nama.split(" ").map((x) => x[0]).join("")}
              </div>
              <div>
                <p className="font-medium">{mentor.nama}</p>
                <p className="text-sm text-muted">Mentor Kec. {mentor.kecamatan} · {mentor.keahlian}</p>
              </div>
            </div>
          )}
          <div className="mt-4 text-sm">
            {sesi.length ? (
              sesi.map((s) => (
                <p key={s.id} className="flex items-center justify-between">
                  <span>{s.topik} · {tanggal(s.tanggal)}</span>
                  <StatusBadge status={s.status} />
                </p>
              ))
            ) : (
              <p className="text-muted">Belum ada jadwal pendampingan.</p>
            )}
          </div>
          <Link href="/umkm/pelatihan#mentor" className="btn-ghost mt-4">Atur jadwal pendampingan</Link>
        </div>
        <div className="card">
          <h2 className="font-semibold">Pengajuan legalitas</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {u.legalitas.length ? (
              u.legalitas.map((l) => (
                <li key={l.id} className="flex items-center justify-between">
                  <span>{l.jenis}</span>
                  <StatusBadge status={l.status} />
                </li>
              ))
            ) : (
              <li className="text-muted">Belum ada pengajuan. Mulai dari NIB.</li>
            )}
          </ul>
          <Link href="/umkm/legalitas" className="btn-ghost mt-4">Kelola legalitas</Link>
        </div>
      </section>
    </div>
  );
}
