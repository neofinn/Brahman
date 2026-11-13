"use client";

import { RASHIS, RASHIS_DEVANAGARI } from "@/lib/jyotish";

export type ChartStyle = "north" | "south";

export interface ChartPlanet {
  label: string; // e.g. "Su 12°" or "Maᴿ"
  sign: number; // 0 = Mesha
}

interface ChartProps {
  lagna: number; // sign index of the ascendant
  planets: ChartPlanet[];
  title: string;
  subtitle?: string;
}

// North Indian chart: houses are fixed (1st at the top centre, counter-clockwise), signs rotate with the lagna.
const NORTH_HOUSE_CENTRES: [number, number][] = [
  [200, 105], [100, 48], [48, 100], [105, 200], [48, 300], [100, 352], [200, 295], [300, 352], [352, 300], [295, 200], [352, 100], [300, 48],
];
// The inner corner of each house, where its sign number is written.
const NORTH_INNER_CORNERS: [number, number][] = [
  [200, 200], [100, 100], [100, 100], [200, 200], [100, 300], [100, 300], [200, 200], [300, 300], [300, 300], [200, 200], [300, 100], [300, 100],
];

export function NorthChart({ lagna, planets, title, subtitle }: ChartProps) {
  return (
    <svg className="north-chart" viewBox="0 0 400 400" role="img" aria-label={`${title}: North Indian chart`}>
      <rect x="1" y="1" width="398" height="398" className="nc-frame" />
      <line x1="1" y1="1" x2="399" y2="399" className="nc-line" />
      <line x1="399" y1="1" x2="1" y2="399" className="nc-line" />
      <polygon points="200,1 399,200 200,399 1,200" className="nc-line" fill="none" />
      {NORTH_HOUSE_CENTRES.map(([x, y], i) => {
        const sign = (lagna + i) % 12;
        const here = planets.filter((p) => p.sign === sign);
        const [cx, cy] = NORTH_INNER_CORNERS[i];
        const nx = cx + (x - cx) * 0.24;
        const ny = cy + (y - cy) * 0.24;
        const lineHeight = here.length > 3 ? 13 : 15;
        const top = y - ((here.length - 1) * lineHeight) / 2 - (i % 3 === 0 ? 10 : 0);
        return (
          <g key={i}>
            <text x={nx} y={ny} className={`nc-sign${i === 0 ? " lagna" : ""}`} textAnchor="middle" dominantBaseline="middle">{sign + 1}</text>
            {here.map((p, j) => (
              <text key={p.label} x={x} y={top + j * lineHeight} className="nc-planet" textAnchor="middle" dominantBaseline="middle">{p.label}</text>
            ))}
            {i === 0 && <text x={x} y={top + here.length * lineHeight + (here.length ? 2 : 6)} className="nc-asc" textAnchor="middle" dominantBaseline="middle">Asc</text>}
          </g>
        );
      })}
      <title>{subtitle ? `${title} — ${subtitle}` : title}</title>
    </svg>
  );
}

// South Indian chart: signs are fixed around the edge of a 4×4 grid, starting with Meena at top-left.
const SIGN_CELLS: Record<number, [row: number, col: number]> = {
  11: [1, 1], 0: [1, 2], 1: [1, 3], 2: [1, 4],
  10: [2, 1], 3: [2, 4],
  9: [3, 1], 4: [3, 4],
  8: [4, 1], 7: [4, 2], 6: [4, 3], 5: [4, 4],
};

export function SouthChart({ lagna, planets, title, subtitle }: ChartProps) {
  return (
    <div className="chart" role="img" aria-label={`${title}: South Indian chart`}>
      {Object.entries(SIGN_CELLS).map(([sign, [row, col]]) => {
        const idx = Number(sign);
        return (
          <div key={sign} className={`cell${idx === lagna ? " lagna" : ""}`} style={{ gridRow: row, gridColumn: col }}>
            <div className="sign">{RASHIS[idx]} <span className="deva">{RASHIS_DEVANAGARI[idx]}</span></div>
            {planets.filter((p) => p.sign === idx).map((p) => <span key={p.label} className="planet">{p.label}</span>)}
          </div>
        );
      })}
      <div className="center">
        <div>
          <div className="deva" style={{ fontSize: "1.2rem" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

export function Chart({ style, ...props }: ChartProps & { style: ChartStyle }) {
  return style === "north" ? <NorthChart {...props} /> : <SouthChart {...props} />;
}
