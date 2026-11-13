"use client";

import { useMemo } from "react";
import type { Kundli } from "@/lib/jyotish";
import { readJaimini } from "@/lib/jaimini";
import { formatMonth } from "@/lib/predictions";

/** Jaimini: chara karakas, arudhas and upapada, karakamsha and ishta devata, raja yogas and the chara dasha. */
export function JaiminiView({ kundli, birthUtc }: { kundli: Kundli; birthUtc: Date }) {
  const j = useMemo(() => readJaimini(kundli, birthUtc), [kundli, birthUtc]);
  const now = Date.now();
  return (
    <div className="reading">
      <p className="lede" style={{ marginBottom: 12 }}>
        Maharishi Jaimini&apos;s system reads the chart through the seven chara karakas (ranked by degree), sign aspects (rashi
        drishti), arudha padas and the sign-based chara dasha.
      </p>
      <section className="section" style={{ marginTop: 0 }}>
        <h2>Key indications</h2>
        <ul>{j.points.map((p) => <li key={p}>{p}</li>)}</ul>
        {j.rajaYogas.length > 0 && (<><h3>Jaimini raja yogas</h3><ul>{j.rajaYogas.map((p) => <li key={p}>{p}</li>)}</ul></>)}
        <h3>Ishta devata</h3>
        <p>
          {j.ishtaDevata.reason}: worship <strong>{j.ishtaDevata.devata}</strong>; its avatara of Vishnu (BPHS ch. 2) is <strong>{j.ishtaDevata.avatara}</strong>.
        </p>
      </section>
      <section className="section">
        <h2>Chara karakas</h2>
        <div className="table-wrap">
          <table className="data"><thead><tr><th>Karaka</th><th>Graha</th><th>Signifies</th></tr></thead>
            <tbody>{j.karakas.map((c) => <tr key={c.karaka}><td>{c.karaka}</td><td>{c.graha}</td><td>{c.meaning}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <h2>Arudha padas</h2>
        <p className="sub">Arudha lagna (AL) {j.arudhaLagna} · Upapada (UL) {j.upapada} · Karakamsha {j.karakamsha}</p>
        <div className="table-wrap">
          <table className="data"><thead><tr>{j.arudhas.map((a) => <th key={a.house}>A{a.house}</th>)}</tr></thead>
            <tbody><tr>{j.arudhas.map((a) => <td key={a.house}>{a.sign}</td>)}</tr></tbody>
          </table>
        </div>
        {j.argalaOnLagna.length > 0 && (
          <p className="sub">Argala on the lagna: {j.argalaOnLagna.map((a) => `${a.planets.join(", ")} from the ${a.from}th${a.obstructedBy.length ? ` (obstructed by ${a.obstructedBy.join(", ")})` : ""}`).join("; ")}.</p>
        )}
      </section>
      <section className="section">
        <h2>Chara dasha (K. N. Rao)</h2>
        <div className="table-wrap">
          <table className="data"><thead><tr><th>Sign</th><th>Years</th><th>From</th><th>To</th></tr></thead>
            <tbody>
              {j.charaDasha.filter((p) => p.end.getTime() > now - 30 * 365 * 86400000).slice(0, 12).map((p) => {
                const on = p.start.getTime() <= now && p.end.getTime() > now;
                return <tr key={p.start.toISOString()} style={on ? { fontWeight: 700, color: "var(--saffron-strong)" } : undefined}><td>{p.sign}{on ? " (current)" : ""}</td><td>{p.years}</td><td>{formatMonth(p.start)}</td><td>{formatMonth(p.end)}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
