"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import { KATEGORI_PANGAN, LEGALITAS } from "@/lib/data";
import { tanggal, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { JenisLegalitas } from "@/lib/types";

const DOKUMEN: Record<JenisLegalitas, string[]> = {
  NIB: ["KTP pemilik", "NPWP (opsional untuk usaha mikro)", "Alamat usaha"],
  PIRT: ["NIB", "Sertifikat penyuluhan keamanan pangan", "Foto dapur produksi", "Label kemasan"],
  HALAL: ["NIB", "Daftar bahan baku", "Alur proses produksi", "Pernyataan pelaku usaha (self-declare)"],
  MEREK: ["NIB", "Logo / etiket merek", "Daftar jenis barang/jasa"],
};

export default function Legalitas() {
  const { saya, ubahUmkm } = useStore();
  const u = saya!;
  const [aktif, setAktif] = useState<JenisLegalitas | null>(null);
  const [centang, setCentang] = useState<Record<string, boolean>>({});
  const punyaNib = u.legalitas.some((l) => l.jenis === "NIB" && l.status === "terbit");
  const pangan = KATEGORI_PANGAN.includes(u.kategori);

  const terakhir = (j: JenisLegalitas) =>
    [...u.legalitas].filter((l) => l.jenis === j).sort((a, b) => b.tanggalAjukan.localeCompare(a.tanggalAjukan))[0];

  const ajukan = (j: JenisLegalitas) => {
    const now = new Date().toISOString();
    ubahUmkm(u.id, (x) => ({
      ...x,
      legalitas: [...x.legalitas, { id: uid("l"), jenis: j, status: "diajukan", tanggalAjukan: now, tanggalUpdate: now }],
    }));
    setAktif(null);
    setCentang({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-page">Legalitas Usaha</h1>
        <p className="sub mt-1">Ajukan izin secara online. Petugas Dinas memverifikasi dan meneruskan ke instansi penerbit.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(LEGALITAS) as JenisLegalitas[]).map((j) => {
          const info = LEGALITAS[j];
          const l = terakhir(j);
          const butuhNib = j !== "NIB" && !punyaNib;
          const relevan = j === "PIRT" || j === "HALAL" ? pangan : true;
          const bisaAjukan = !butuhNib && (!l || l.status === "ditolak");
          return (
            <div key={j} className="card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{info.nama}</h2>
                  <p className="text-xs text-muted">Penerbit: {info.penerbit}</p>
                </div>
                {l ? <StatusBadge status={l.status} /> : <span className="text-xs text-muted">Belum diajukan</span>}
              </div>
              <p className="mt-2 text-sm text-ink-2">{info.keterangan}</p>
              {!relevan && <p className="mt-1 text-xs text-muted">Tidak wajib untuk kategori {u.kategori}.</p>}
              {l && (
                <div className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-ink-2">
                  Diajukan {tanggal(l.tanggalAjukan)} · diperbarui {tanggal(l.tanggalUpdate)}
                  {l.nomor && <div className="mt-1 font-mono text-ink">No. {l.nomor}</div>}
                  {l.catatan && <div className="mt-1">Catatan petugas: {l.catatan}</div>}
                </div>
              )}
              <div className="mt-auto pt-4">
                {butuhNib ? (
                  <p className="text-xs text-muted">Terbitkan NIB terlebih dahulu.</p>
                ) : bisaAjukan ? (
                  aktif === j ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Kelengkapan dokumen</p>
                      {DOKUMEN[j].map((d) => (
                        <label key={d} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!centang[d]} onChange={(e) => setCentang({ ...centang, [d]: e.target.checked })} />
                          {d}
                        </label>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <button className="btn-primary" disabled={!DOKUMEN[j].every((d) => centang[d])} onClick={() => ajukan(j)}>
                          Kirim pengajuan
                        </button>
                        <button className="btn-ghost" onClick={() => setAktif(null)}>Batal</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-ghost" onClick={() => { setAktif(j); setCentang({}); }}>
                      {l?.status === "ditolak" ? "Ajukan ulang" : "Ajukan"}
                    </button>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
