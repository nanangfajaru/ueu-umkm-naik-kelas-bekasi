/** Ilustrasi kode QR (bukan QR yang dapat dipindai) yang diturunkan dari Merchant ID. */
export function QrisIlustrasi({ kode, ukuran = 160 }: { kode: string; ukuran?: number }) {
  const n = 25;
  let h = 0;
  for (const c of kode) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const acak = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
  const sel: [number, number][] = [];
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && acak() < 0.5) sel.push([x, y]);

  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width={7} height={7} fill="#111" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#111" />
    </g>
  );

  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={ukuran} height={ukuran} role="img" aria-label="Kode QRIS merchant (ilustrasi)" className="rounded-md bg-white">
      <rect x={-1} y={-1} width={n + 2} height={n + 2} fill="#fff" />
      {sel.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#111" />)}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  );
}
