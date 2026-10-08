"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buatSeed, VERSI_DB } from "./seed";
import type { Db, Session, Umkm } from "./types";

const KEY_DB = "super-umkm-bekasi:db";
const KEY_SESI = "super-umkm-bekasi:sesi";

interface Store {
  siap: boolean;
  db: Db;
  sesi: Session | null;
  saya: Umkm | null;
  masuk: (s: Session) => void;
  keluar: () => void;
  tambahUmkm: (u: Umkm) => void;
  ubahUmkm: (id: string, fn: (u: Umkm) => Umkm) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

function baca<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function tulis(key: string, val: unknown) {
  try {
    if (val === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* penyimpanan browser tidak tersedia: data tetap di memori */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db>({ versi: VERSI_DB, umkm: [] });
  const [sesi, setSesi] = useState<Session | null>(null);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const tersimpan = baca<Db>(KEY_DB);
    const awal = tersimpan && tersimpan.versi === VERSI_DB ? tersimpan : buatSeed();
    if (!tersimpan) tulis(KEY_DB, awal);
    setDb(awal);
    setSesi(baca<Session>(KEY_SESI));
    setSiap(true);
  }, []);

  const simpan = useCallback((fn: (d: Db) => Db) => {
    setDb((lama) => {
      const baru = fn(lama);
      tulis(KEY_DB, baru);
      return baru;
    });
  }, []);

  const store = useMemo<Store>(
    () => ({
      siap,
      db,
      sesi,
      saya: sesi?.role === "umkm" ? db.umkm.find((u) => u.id === sesi.umkmId) ?? null : null,
      masuk: (s) => {
        tulis(KEY_SESI, s);
        setSesi(s);
      },
      keluar: () => {
        tulis(KEY_SESI, null);
        setSesi(null);
      },
      tambahUmkm: (u) => simpan((d) => ({ ...d, umkm: [u, ...d.umkm] })),
      ubahUmkm: (id, fn) => simpan((d) => ({ ...d, umkm: d.umkm.map((u) => (u.id === id ? fn(u) : u)) })),
      resetDemo: () => {
        const baru = buatSeed();
        tulis(KEY_DB, baru);
        setDb(baru);
      },
    }),
    [siap, db, sesi, simpan],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore harus di dalam StoreProvider");
  return s;
}
