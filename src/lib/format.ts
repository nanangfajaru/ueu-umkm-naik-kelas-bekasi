export const rupiah = (n: number) =>
  "Rp" + Math.round(n).toLocaleString("id-ID");

export const rupiahRingkas = (n: number) => {
  if (n >= 1e12) return `Rp${(n / 1e12).toLocaleString("id-ID", { maximumFractionDigits: 1 })} T`;
  if (n >= 1e9) return `Rp${(n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (n >= 1e6) return `Rp${(n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (n >= 1e3) return `Rp${(n / 1e3).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return rupiah(n);
};

export const angka = (n: number) => n.toLocaleString("id-ID");

export const persen = (n: number, digit = 0) =>
  `${(n * 100).toLocaleString("id-ID", { maximumFractionDigits: digit })}%`;

export const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export const tanggalJam = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const uid = (prefix = "") =>
  prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
