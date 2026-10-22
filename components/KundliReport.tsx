"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDegrees, RASHIS, RASHIS_DEVANAGARI, type Kundli } from "@/lib/jyotish";
import { getKriya } from "@/lib/kriyas";
import { antardashas, readKundli } from "@/lib/reading";
import { formatDate } from "@/lib/time";
import { GrahaCard } from "./GrahaCard";

// South Indian chart: signs are fixed around the edge of a 4×4 grid, starting with Meena at top-left.
const SIGN_CELLS: Record<number, [row: number, col: number]> = {
  11: [1, 1], 0: [1, 2], 1: [1, 3], 2: [1, 4],
  10: [2, 1], 3: [2, 4],
  9: [3, 1], 4: [3, 4],
  8: [4, 1], 7: [4, 2], 6: [4, 3], 5: [4, 4],
};

const ABBR: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

const isNode = (name: string) => name === "Rahu" || name === "Ketu";

export function RashiChart({ kundli, name }: { kundli: Kundli; name?: string }) {
  const bySign = new Map<number, string[]>();
  for (const g of kundli.grahas) {
    const list = bySign.get(g.rashi.index) ?? [];
    list.push(`${ABBR[g.name]}${g.retrograde && !isNode(g.name) ? "ᴿ" : ""} ${Math.floor(g.rashi.degree)}°`);
    bySign.set(g.rashi.index, list);
  }
  return (
    <div className="chart" role="img" aria-label="South Indian style rashi chart">
      {Object.entries(SIGN_CELLS).map(([sign, [row, col]]) => {
        const idx = Number(sign);
        return (
          <div key={sign} className={`cell${idx === kundli.lagna.rashi.index ? " lagna" : ""}`} style={{ gridRow: row, gridColumn: col }}>
            <div className="sign">{RASHIS[idx]} <span className="deva">{RASHIS_DEVANAGARI[idx]}</span></div>
            {(bySign.get(idx) ?? []).map((p) => <span key={p} className="planet">{p}</span>)}
          </div>
        );
      })}
      <div className="center">
        <div>
          <div className="deva" style={{ fontSize: "1.4rem" }}>राशि चक्र</div>
          <div>{name || "Rashi chart"}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Lagna {kundli.lagna.rashi.name}</div>
        </div>
      </div>
    </div>
  );
}

export function KundliReport({ kundli, name, onRitual }: { kundli: Kundli; name?: string; onRitual?: (id: string) => void }) {
  const reading = useMemo(() => readKundli(kundli), [kundli]);
  const now = Date.now();
  const current = kundli.dashas.find((d) => d.start.getTime() <= now && now < d.end.getTime());
  const remedyGrahas = [...new Map(reading.remedies.map((r) => [r.graha, r])).values()];

  return (
    <div className="kundli-report">
      <div className="two-col">
        <RashiChart kundli={kundli} name={name} />
        <div className="card">
          <h3>Key points</h3>
          <p>Lagna: <strong>{kundli.lagna.rashi.name}</strong> {formatDegrees(kundli.lagna.rashi.degree)}</p>
          <p>Rashi (Moon sign): <strong>{kundli.grahas[1].rashi.name}</strong></p>
          <p>Nakshatra: <strong>{kundli.grahas[1].nakshatra.name}</strong> pada {kundli.grahas[1].nakshatra.pada}</p>
          <p>Sun sign (sidereal): <strong>{kundli.grahas[0].rashi.name}</strong></p>
          {current && <p>Mahadasha: <strong>{current.lord}</strong> until {formatDate(current.end)}</p>}
          <p style={{ fontSize: "0.8rem" }}>Lahiri ayanamsa {formatDegrees(kundli.ayanamsa)} · whole-sign houses</p>
        </div>
      </div>

      <section className="section reading">
        <h2>Brahman&apos;s reading</h2>
        {reading.sections.map((s) => (
          <div key={s.title} className="reading-section">
            <h3>{s.title}</h3>
            {s.paragraphs.map((p) => <p key={p}>{p}</p>)}
            {s.bullets && s.bullets.length > 0 && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
          </div>
        ))}
      </section>

      {(remedyGrahas.length > 0 || reading.rituals.length > 0) && (
        <section className="section">
          <h2>Upay — remedies</h2>
          {reading.rituals.length > 0 && (
            <p>
              Recommended rites:{" "}
              {reading.rituals.map((id) => {
                const k = getKriya(id);
                if (!k) return null;
                return onRitual ? (
                  <button key={id} type="button" className="chip" onClick={() => onRitual(id)}>{k.title}</button>
                ) : (
                  <Link key={id} className="chip" href={`/kriyas/${id}`}>{k.title}</Link>
                );
              })}
            </p>
          )}
          <div className="grid">
            {remedyGrahas.map((r) => (
              <div key={r.graha} className="card"><GrahaCard name={r.graha} reason={r.reason} /></div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>Graha positions</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Pada</th></tr>
            </thead>
            <tbody>
              {kundli.grahas.map((g) => (
                <tr key={g.name}>
                  <td>{g.name}{g.sanskrit !== g.name && <span className="deva"> ({g.sanskrit})</span>}{g.retrograde && !isNode(g.name) ? " ᴿ" : ""}</td>
                  <td>{g.rashi.name}</td>
                  <td>{formatDegrees(g.rashi.degree)}</td>
                  <td>{g.house}</td>
                  <td>{g.nakshatra.name}</td>
                  <td>{g.nakshatra.pada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Vimshottari dasha</h2>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Mahadasha</th><th>From</th><th>To</th></tr></thead>
            <tbody>
              {kundli.dashas.map((d) => {
                const isCurrent = d === current;
                return (
                  <tr key={d.lord} style={isCurrent ? { fontWeight: 700, color: "var(--saffron-strong)" } : undefined}>
                    <td>{d.lord}{isCurrent ? " (current)" : ""}</td>
                    <td>{formatDate(d.start)}</td>
                    <td>{formatDate(d.end)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {current && (
          <>
            <h3>Antardashas in {current.lord} mahadasha</h3>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Antardasha</th><th>From</th><th>To</th></tr></thead>
                <tbody>
                  {antardashas(current).map((a) => {
                    const on = a.start.getTime() <= now && now < a.end.getTime();
                    return (
                      <tr key={a.lord} style={on ? { fontWeight: 700, color: "var(--saffron-strong)" } : undefined}>
                        <td>{current.lord}–{a.lord}{on ? " (current)" : ""}</td>
                        <td>{formatDate(a.start)}</td>
                        <td>{formatDate(a.end)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
      <p className="disclaimer" style={{ textAlign: "left" }}>
        Jyotisha describes tendencies, not fate. Readings are generated from classical Parashari rules; for major decisions, consult an experienced jyotishi.
      </p>
    </div>
  );
}
