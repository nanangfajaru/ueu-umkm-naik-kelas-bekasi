"use client";

import { useState } from "react";
import { Progress, StatusBadge } from "@/components/ui";
import { KELAS, MENTOR } from "@/lib/data";
import { tanggal, uid } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function Pelatihan() {
  const { saya, ubahUmkm } = useStore();
  const u = saya!;
  const mentor = MENTOR.find((m) => m.kecamatan === u.kecamatan)!;
  const [jadwal, setJadwal] = useState({ tanggal: "", topik: "" });

  const ikut = (kelasId: string) =>
    ubahUmkm(u.id, (x) => ({ ...x, pelatihan: [...x.pelatihan, { kelasId, progres: 0 }] }));

  const lanjut = (kelasId: string, jumlahModul: number) =>
    ubahUmkm(u.id, (x) => ({
      ...x,
      pelatihan: x.pelatihan.map((p) => {
        if (p.kelasId !== kelasId) return p;
        const progres = Math.min(100, p.progres + Math.ceil(100 / jumlahModul));
        return { ...p, progres, selesai: progres >= 100 ? new Date().toISOString() : undefined };
      }),
    }));

  const pesan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jadwal.tanggal || !jadwal.topik.trim()) return;
    ubahUmkm(u.id, (x) => ({
      ...x,
      sesiMentor: [
        ...x.sesiMentor,
        { id: uid("s"), mentorId: mentor.id, tanggal: new Date(jadwal.tanggal).toISOString(), topik: jadwal.topik.trim(), status: "dijadwalkan" },
      ],
    }));
    setJadwal({ tanggal: "", topik: "" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h-page">Pelatihan &amp; Pembimbingan</h1>
        <p className="sub mt-1">Kelas digital gratis. Setiap modul yang selesai tercatat dan memengaruhi level serta skor kredit.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {KELAS.map((k) => {
          const p = u.pelatihan.find((x) => x.kelasId === k.id);
          const modulSelesai = p ? Math.round((p.progres / 100) * k.modul.length) : 0;
          return (
            <div key={k.id} className="card flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink-2">{k.kategori}</span>
                <span className="text-xs text-muted">{k.durasiJam} jam</span>
              </div>
              <h2 className="mt-3 font-semibold">{k.judul}</h2>
              {k.wajibSiapIndustri && <p className="mt-1 text-xs font-medium text-[var(--info)]">Wajib untuk Level Siap Industri</p>}
              <ul className="mt-3 space-y-1 text-sm">
                {k.modul.map((m, i) => (
                  <li key={m} className={i < modulSelesai ? "text-ink-2" : "text-muted"}>
                    <span aria-hidden className="mr-1.5">{i < modulSelesai ? "✓" : "○"}</span>
                    {m}
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-2 pt-4">
                {p && <Progress nilai={p.progres} label={`Progres ${k.judul}`} />}
                {!p ? (
                  <button className="btn-ghost w-full" onClick={() => ikut(k.id)}>Ikuti kelas</button>
                ) : p.selesai ? (
                  <p className="text-sm text-[var(--good)]">✓ Lulus {tanggal(p.selesai)} · sertifikat tersedia</p>
                ) : (
                  <button className="btn-primary w-full" onClick={() => lanjut(k.id, k.modul.length)}>
                    Selesaikan modul berikutnya ({modulSelesai}/{k.modul.length})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section id="mentor" className="card grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">Mentor pendamping Kec. {u.kecamatan}</h2>
          <p className="mt-2 font-medium">{mentor.nama}</p>
          <p className="text-sm text-muted">Keahlian: {mentor.keahlian}</p>
          <form onSubmit={pesan} className="mt-4 space-y-3">
            <div>
              <label className="label" htmlFor="tgl">Tanggal pendampingan</label>
              <input id="tgl" type="date" className="input" value={jadwal.tanggal} onChange={(e) => setJadwal({ ...jadwal, tanggal: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="topik">Topik yang ingin dibahas</label>
              <input id="topik" className="input" placeholder="mis. menghitung HPP" value={jadwal.topik} onChange={(e) => setJadwal({ ...jadwal, topik: e.target.value })} />
            </div>
            <button className="btn-primary">Jadwalkan</button>
          </form>
        </div>
        <div>
          <h3 className="text-sm font-medium text-ink-2">Riwayat sesi</h3>
          <ul className="mt-2 divide-y divide-line text-sm">
            {[...u.sesiMentor].reverse().map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                <span>
                  {s.topik}
                  <span className="block text-xs text-muted">{tanggal(s.tanggal)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  {s.status === "dijadwalkan" && (
                    <button
                      className="text-xs text-brand hover:underline"
                      onClick={() => ubahUmkm(u.id, (x) => ({ ...x, sesiMentor: x.sesiMentor.map((y) => (y.id === s.id ? { ...y, status: "selesai" } : y)) }))}
                    >
                      Tandai selesai
                    </button>
                  )}
                </span>
              </li>
            ))}
            {!u.sesiMentor.length && <li className="py-2 text-muted">Belum ada sesi.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
