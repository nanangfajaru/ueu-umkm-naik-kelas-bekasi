"use client";

import { useEffect, useState } from "react";

const KEY = "super-umkm-bekasi:tema";

export function ThemeToggle() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.dataset.theme === "dark");
  }, []);

  const ganti = () => {
    const baru = !gelap;
    setGelap(baru);
    document.documentElement.dataset.theme = baru ? "dark" : "light";
    try {
      localStorage.setItem(KEY, baru ? "dark" : "light");
    } catch {
      /* abaikan */
    }
  };

  return (
    <button
      type="button"
      onClick={ganti}
      className="btn-ghost h-9 w-9 p-0"
      aria-label={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={gelap ? "Mode terang" : "Mode gelap"}
    >
      {gelap ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

/** Dijalankan sebelum render agar tidak berkedip; default mode terang. */
export const SKRIP_TEMA = `try{if(localStorage.getItem("${KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
