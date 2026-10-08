"use client";

import { useMemo, useState } from "react";
import { BarChart } from "@/components/charts";
import { QrisIlustrasi } from "@/components/qris";
import { Kosong, Progress, StatusBadge } from "@/components/ui";
import { AMBANG } from "@/lib/data";
import { rupiah, rupiahRingkas, tanggal, tanggalJam, uid } from "@/lib/format";
import { hitungSkor, omzetQrisBulanan } from "@/lib/scoring";
import { useStore } from "@/lib/store";

const HARI = 24 * 60 * 60 * 1000;

export default function KreditDigital() {
  const { saya, ubahUmkm } = useStore();
  const u = saya!;
  const skor = useMemo(() => hitungSkor(u), [u]);
  const [bayar, setBayar] = useState("");
  const [kur, setKur] = useState({ nominal: "", tenor: "24", tujuan: "" });
  const [pesan, setPesan] = useState("");

  const mingguan = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 13 }, (_, i) => {
      const akhir = now - (12 - i) * 7 * HARI;
      const awal = akhir - 7 * HARI;
      const tx = u.transaksi.filter((t) => {
        const w = new Date(t.tanggal).getTime();
        return w > awal && w <= akhir;
      });
      return {
        label: new Date(akhir).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        nilai: tx.reduce((s, t) => s + t.nominal, 0),
        detail: `${tx.length} transaksi`,
      };
    });
  }, [u.transaksi]);

  const aktifkan = () =>
    ubahUmkm(u.id, (x) => ({ ...x, qrisAktif: true, merchantId: `ID${Date.now()}${Math.floor(Math.random() * 10)}` }));

  const simulasiBayar = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(bayar);
    if (!(n >= 1000)) return;
    ubahUmkm(u.id, (x) => ({
      ...x,
      transaksi: [{ id: uid("t"), tanggal: new Date().toISOString(), nominal: n, keterangan: "Pembayaran QRIS" }, ...x.transaksi],
    }));
    setBayar("");
  };

  const kurAktif = u.kur.find((k) => k.status === "diajukan");
  const ajukanKur = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(kur.nominal);
    if (!(n >= 1_000_000) || n > skor.plafonRekomendasi || !kur.tujuan.trim()) {
      setPesan(`Isi nominal antara Rp1 jt dan ${rupiah(skor.plafonRekomendasi)}, serta tujuan penggunaan.`);
      return;
    }
    ubahUmkm(u.id, (x) => ({
      ...x,
      kur: [
        ...x.kur,
        { id: uid("k"), nominal: n, tenorBulan: Number(kur.tenor), tujuan: kur.tujuan.trim(), skorSaatAjukan: skor.skor, status: "diajukan", tanggal: new Date().toISOString() },
      ],
    }));
    setKur({ nominal: "", tenor: "24", tujuan: "" });
    setPesan("Pengajuan terkirim ke Bank BJB melalui Dinas KUKM.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-page">Kredit Digital</h1>
        <p className="sub mt-1">Setiap pembayaran QRIS tercatat otomatis dan menjadi dasar skor kredit untuk pengajuan KUR (Bank BJB).</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <section className="card">
          <h2 className="font-semibold">QRIS usaha</h2>
          {u.qrisAktif ? (
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="rounded-lg border border-line bg-white p-3 text-center text-black">
                <div className="mb-1 text-xs font-bold tracking-widest">QRIS</div>
                <QrisIlustrasi kode={u.merchantId!} />
                <div className="mt-1 max-w-[160px] truncate text-xs font-semibold">{u.namaUsaha}</div>
                <div className="text-[10px]">NMID {u.merchantId}</div>
              </div>
              <form onSubmit={simulasiBayar} className="w-full space-y-2">
                <p className="text-sm text-ink-2">Simulasikan pembeli membayar dengan memindai QRIS:</p>
                <label className="label" htmlFor="bayar">Nominal (Rp)</label>
                <input id="bayar" type="number" min={1000} step={500} className="input" value={bayar} onChange={(e) => setBayar(e.target.value)} placeholder="25000" />
                <button className="btn-primary w-full">Terima pembayaran</button>
                <p className="text-xs text-muted">Prototipe: di sistem nyata data masuk dari PJP/bank penyelenggara QRIS.</p>
              </form>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-ink-2">QRIS belum aktif. Aktifkan agar transaksi tercatat dan skor kredit Anda bisa naik hingga 400 poin.</p>
              <button className="btn-primary" onClick={aktifkan}>Aktifkan QRIS</button>
            </div>
          )}
        </section>

        <section className="card">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-semibold">Skor kredit alternatif</h2>
              <p className="sub">Rentang 300–850 · minimal {AMBANG.kurMinSkor} untuk rekomendasi KUR</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-semibold tabular-nums">{skor.skor}</div>
              <div className="text-sm text-ink-2">{skor.grade}</div>
            </div>
          </div>
          <div className="mt-3">
            <Progress nilai={skor.skor - 300} maks={550} label="Skor kredit" />
          </div>
          <ul className="mt-5 space-y-3">
            {skor.komponen.map((k) => (
              <li key={k.label}>
                <div className="flex justify-between text-sm">
                  <span>{k.label}</span>
                  <span className="tabular-nums text-ink-2">{k.nilai}/{k.maks}</span>
                </div>
                <Progress nilai={k.nilai} maks={k.maks} label={k.label} />
                <p className="mt-0.5 text-xs text-muted">{k.keterangan}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-semibold">Omzet QRIS per minggu</h2>
            <p className="sub">13 minggu terakhir</p>
          </div>
          <div className="text-right text-sm">
            <span className="text-muted">Rata-rata per bulan </span>
            <span className="font-semibold tabular-nums">{rupiahRingkas(omzetQrisBulanan(u))}</span>
          </div>
        </div>
        <div className="mt-4">
          {u.transaksi.length ? (
            <BarChart data={mingguan} format={rupiahRingkas} judul="Omzet QRIS per minggu" />
          ) : (
            <Kosong>Belum ada transaksi QRIS.</Kosong>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-semibold">Ajukan KUR</h2>
          <p className="sub">Plafon rekomendasi berdasarkan skor &amp; omzet: <b className="text-ink">{rupiah(skor.plafonRekomendasi)}</b></p>
          {skor.skor < AMBANG.kurMinSkor ? (
            <p className="mt-4 rounded-lg bg-[var(--warn-soft)] p-3 text-sm text-[var(--warn)]">
              Skor Anda belum mencapai {AMBANG.kurMinSkor}. Tingkatkan transaksi QRIS, lengkapi legalitas, dan ikuti pelatihan.
            </p>
          ) : kurAktif ? (
            <p className="mt-4 rounded-lg bg-[var(--info-soft)] p-3 text-sm text-[var(--info)]">
              Pengajuan {rupiah(kurAktif.nominal)} sedang diproses.
            </p>
          ) : (
            <form onSubmit={ajukanKur} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="nom">Nominal (Rp)</label>
                <input id="nom" type="number" className="input" value={kur.nominal} onChange={(e) => setKur({ ...kur, nominal: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="tenor">Tenor</label>
                <select id="tenor" className="input" value={kur.tenor} onChange={(e) => setKur({ ...kur, tenor: e.target.value })}>
                  {[12, 24, 36].map((t) => <option key={t} value={t}>{t} bulan</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="tujuan">Tujuan penggunaan</label>
                <input id="tujuan" className="input" placeholder="mis. membeli mesin pengemas" value={kur.tujuan} onChange={(e) => setKur({ ...kur, tujuan: e.target.value })} />
              </div>
              <button className="btn-primary sm:col-span-2">Kirim pengajuan</button>
            </form>
          )}
          {pesan && <p className="mt-2 text-sm text-ink-2">{pesan}</p>}
          {u.kur.length > 0 && (
            <ul className="mt-4 divide-y divide-line text-sm">
              {u.kur.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-2 py-2">
                  <span>
                    {rupiah(k.nominal)} · {k.tenorBulan} bln
                    <span className="block text-xs text-muted">{tanggal(k.tanggal)} · skor {k.skorSaatAjukan}{k.catatan ? ` · ${k.catatan}` : ""}</span>
                  </span>
                  <StatusBadge status={k.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2 className="font-semibold">Riwayat transaksi</h2>
          <ul className="mt-3 max-h-80 divide-y divide-line overflow-y-auto text-sm">
            {u.transaksi.slice(0, 30).map((t) => (
              <li key={t.id} className="flex justify-between py-2">
                <span className="text-ink-2">{tanggalJam(t.tanggal)}</span>
                <span className="tabular-nums">{rupiah(t.nominal)}</span>
              </li>
            ))}
            {!u.transaksi.length && <li className="py-2 text-muted">Belum ada transaksi.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
