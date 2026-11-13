"use client";

import { useMemo } from "react";
import { LO_SHU_LAYOUT, loShu, personalYear, PERSONAL_YEAR } from "@/lib/loshu";

/** The Lo Shu grid of the birth date with its planes, missing and repeated numbers, and remedies. */
export function LoShuGrid({ date }: { date: string }) {
  const g = useMemo(() => loShu(date), [date]);
  const year = new Date().getFullYear();
  const py = personalYear(date, year);
  return (
    <div className="reading-section">
      <h3>Lo Shu grid</h3>
      <div className="loshu" role="table" aria-label="Lo Shu grid">
        {LO_SHU_LAYOUT.flat().map((n) => (
          <div key={n} className={`loshu-cell${g.counts[n] ? "" : " empty"}`} role="cell">
            <span className="loshu-digits">{g.counts[n] ? String(n).repeat(g.counts[n]) : "—"}</span>
            <span className="loshu-n">{n}</span>
          </div>
        ))}
      </div>
      <p className="sub">Digits of the birth date, with the conductor number {g.conductor}{g.digits.length > 0 && new Date(date).getDate() >= 10 ? ` and driver number ${g.driver}` : ""}. Driver (birth day) {g.driver}, conductor (destiny) {g.conductor}.</p>
      {g.planes.length > 0 && <p><strong>Complete planes:</strong> {g.planes.map((p) => `${p.name} (${p.numbers.join("-")}) — ${p.text}`).join("; ")}.</p>}
      {g.present.length > 0 && <p><strong>Present:</strong> {g.present.join("; ")}.</p>}
      {g.repeated.length > 0 && <p><strong>Repeated:</strong> {g.repeated.join("; ")}.</p>}
      {g.missing.length > 0 && (
        <>
          <p style={{ marginBottom: 4 }}><strong>Missing numbers and remedies:</strong></p>
          <ul className="factors">{g.missing.map((m) => <li key={m.n}>{m.n} ({m.planet}) — {m.text}. {m.remedy}</li>)}</ul>
        </>
      )}
      <p><strong>Personal year {year}:</strong> {py} — {PERSONAL_YEAR[py]}.</p>
    </div>
  );
}
