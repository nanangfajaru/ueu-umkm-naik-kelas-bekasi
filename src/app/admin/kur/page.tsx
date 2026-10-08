"use client";

import Link from "next/link";
import { Kosong, StatusBadge } from "@/components/ui";
import { rupiah, tanggal } from "@/lib/format";
import { hitungSkor } from "@/lib/scoring";
import { useStore } from "@/lib/store";

export default function PengajuanKur() {
  const { db, ubahUmkm } = useStore();
  const semua = db.umkm
    .flatMap((u) => u.kur.map((k) => ({ u, k })))
    .sort((a, b) => b.k.tanggal.localeCompare(a.k.tanggal));
  const antre = semua.filter(({ k }) => k.status === "diajukan");
  const riwayat = semua.filter(({ k }) => k.status !== "diajukan");
  const totalDisetujui = riwayat.filter(({ k }) => k.status === "disetujui").reduce((s, { k }) => s + k.nominal, 0);

  const putuskan = (umkmId: string, kurId: string, status: "disetujui" | "ditolak", catatan: string) =>
    ubahUmkm(umkmId, (x) => ({ ...x, kur: x.kur.map((k) => (k.id === kurId ? { ...k, status, catatan } : k)) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-page">Pengajuan KUR</h1>
        <p className="sub mt-1">Rekomendasi Dinas ke Bank BJB berdasarkan skor kredit alternatif dari transaksi QRIS. Total disetujui: <b className="text-ink">{rupiah(totalDisetujui)}</b></p>
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Menunggu keputusan ({antre.length})</h2>
        {antre.length === 0 ? (
          <Kosong>Tidak ada pengajuan baru.</Kosong>
        ) : (
          <ul className="space-y-3">
            {antre.map(({ u, k }) => {
              const s = hitungSkor(u);
              const sesuai = k.nominal <= s.plafonRekomendasi;
              return (
                <li key={k.id} className="card flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex-1">
                    <p className="font-semibold">{rupiah(k.nominal)} · {k.tenorBulan} bulan</p>
                    <p className="text-sm">
                      <Link href={`/admin/umkm/${u.id}`} className="hover:text-brand hover:underline">{u.namaUsaha}</Link>
                      <span className="text-muted"> · {u.kecamatan} · {k.tujuan}</span>
                    </p>
                    <p className="text-xs text-muted">
                      Diajukan {tanggal(k.tanggal)} · skor saat ini {s.skor} ({s.grade}) · plafon rekomendasi {rupiah(s.plafonRekomendasi)}
                    </p>
                    <p className={`mt-1 text-xs ${sesuai ? "text-[var(--good)]" : "text-[var(--warn)]"}`}>
                      {sesuai ? "✓ Nominal sesuai plafon rekomendasi" : "▲ Nominal melebihi plafon rekomendasi"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary" onClick={() => putuskan(u.id, k.id, "disetujui", "Direkomendasikan ke Bank BJB")}>Rekomendasikan</button>
                    <button className="btn-ghost text-[var(--bad)]" onClick={() => putuskan(u.id, k.id, "ditolak", "Belum memenuhi kelayakan")}>Tolak</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card overflow-x-auto p-0">
        <h2 className="p-5 pb-2 font-semibold">Riwayat</h2>
        <table className="tbl min-w-[640px]">
          <thead>
            <tr><th>UMKM</th><th>Kecamatan</th><th className="text-right">Nominal</th><th className="text-right">Skor</th><th>Tanggal</th><th>Status</th></tr>
          </thead>
          <tbody>
            {riwayat.map(({ u, k }) => (
              <tr key={k.id}>
                <td>{u.namaUsaha}</td>
                <td>{u.kecamatan}</td>
                <td className="text-right tabular-nums">{rupiah(k.nominal)}</td>
                <td className="text-right tabular-nums">{k.skorSaatAjukan}</td>
                <td>{tanggal(k.tanggal)}</td>
                <td><StatusBadge status={k.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
