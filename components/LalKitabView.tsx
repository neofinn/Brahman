"use client";

import { useMemo } from "react";
import type { Kundli } from "@/lib/jyotish";
import { lalKitab } from "@/lib/lalkitab";
import { Chart } from "./Charts";

const ABBR: Record<string, string> = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };

/** Lal Kitab: the chart with Mesha always in the 1st house, each planet's effect and upay, debts and sleeping houses. */
export function LalKitabView({ kundli }: { kundli: Kundli }) {
  const lk = useMemo(() => lalKitab(kundli), [kundli]);
  const planets = lk.placements.map((p) => ({ label: ABBR[p.planet], sign: p.house - 1 }));
  return (
    <div className="reading">
      <p className="lede" style={{ marginBottom: 12 }}>
        Lal Kitab (Pt. Roop Chand Joshi, 1939–1952) fixes Mesha in the 1st house and reads each planet by its house, with simple
        household remedies (upay). Do remedies only for afflicted planets, one at a time, in daytime, for 40–43 days.
      </p>
      <div className="two-col">
        <div><Chart style="north" lagna={0} planets={planets} title="Lal Kitab kundli" subtitle="Mesha in the 1st house" /></div>
        <div className="card">
          <h3>Pakka ghar and sleeping houses</h3>
          <p>In their pakka (permanent) house: <strong>{lk.placements.filter((p) => p.pakka).map((p) => p.planet).join(", ") || "none"}</strong></p>
          <p>Sleeping houses (empty and unaspected): <strong>{lk.sleepingHouses.join(", ") || "none"}</strong></p>
          <p className="sub">Lal Kitab says a sleeping house stays dormant until awakened by its remedy or a planet&apos;s aspect. Sleeping planets: {lk.sleepingPlanets.join(", ") || "none"} — interpretations of this rule vary between practitioners.</p>
        </div>
      </div>
      <section className="section">
        <h2>Planets by house</h2>
        {lk.placements.map((p) => (
          <div key={p.planet} className="reading-section">
            <h3>{p.planet} in house {p.house}{p.pakka ? " — pakka ghar" : ""}</h3>
            <p>{p.effect}</p>
            {p.remedies.length > 0 && <ul className="factors">{p.remedies.map((r) => <li key={r}>{r}</li>)}</ul>}
          </div>
        ))}
      </section>
      {lk.rinas.length > 0 && (
        <section className="section">
          <h2>Rin — ancestral debts</h2>
          {lk.rinas.map((r) => <div key={r.name} className="reading-section"><h3>{r.name}</h3><p>{r.reason}</p><p><strong>Collective remedy:</strong> {r.remedy}</p></div>)}
        </section>
      )}
      <section className="section">
        <h2>How to do Lal Kitab remedies</h2>
        <ul>{lk.generalRules.map((r) => <li key={r}>{r}</li>)}</ul>
        <p className="sub">Remedies follow commonly published Lal Kitab tables; where sources differ the most widely published version is used. Confirm with an experienced Lal Kitab practitioner before major remedies.</p>
      </section>
    </div>
  );
}
