"use client";

import { useMemo } from "react";
import type { Kundli } from "@/lib/jyotish";
import { confluence, presentConfluence } from "@/lib/confluence";
import { readJaimini } from "@/lib/jaimini";
import { kpChart } from "@/lib/kp";
import { PAKKA_GHAR } from "@/lib/lalkitab";
import { predict } from "@/lib/predictions";
import { zonedToUtc } from "@/lib/time";
import type { BirthInfo } from "./KundliReport";

const LABEL = { "strong promise": "Strong promise", promise: "Promise", mixed: "Mixed", "needs care": "Needs care", "strong caution": "Strong caution" } as const;
const CLASS = { "strong promise": "rating-excellent", promise: "rating-favourable", mixed: "rating-mixed", "needs care": "rating-challenging", "strong caution": "rating-challenging" } as const;

export function useConfluence(kundli: Kundli, birth: BirthInfo) {
  return useMemo(() => {
    const birthUtc = zonedToUtc(birth.date, birth.time, birth.place.timeZone);
    const p = predict(kundli, { gender: birth.gender === "f" ? "female" : birth.gender === "m" ? "male" : undefined });
    let kp = null;
    try {
      kp = kpChart(birthUtc, birth.place.latitude, birth.place.longitude);
    } catch {}
    const j = readJaimini(kundli, birthUtc);
    return { areas: confluence(kundli, p, kp, { pakka: PAKKA_GHAR }), present: presentConfluence(kundli, p, j, birth.date), prediction: p };
  }, [kundli, birth]);
}

/** Final observations: every life area and the present judged by each system, and where they agree. */
export function ConfluenceView({ kundli, birth }: { kundli: Kundli; birth: BirthInfo }) {
  const { areas, present } = useConfluence(kundli, birth);
  return (
    <div className="reading">
      <p className="lede" style={{ marginBottom: 12 }}>
        Final observations from the confluence of techniques: each area of life is judged separately by Parashari rules, Jaimini, KP
        and Lal Kitab, and the present period by Vimshottari, Jaimini chara dasha, transits and numerology. Where they agree, the
        indication is strong.
      </p>
      <section className="section" style={{ marginTop: 0 }}>
        <h2>The present</h2>
        <ul>{present.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        <p><strong>{present.verdict}</strong></p>
      </section>
      <section className="section">
        <h2>Life areas</h2>
        <div className="grid">
          {areas.map((a) => (
            <div key={a.id} className="card">
              <h3>{a.title} <span className={`rating ${CLASS[a.agreement]}`}>{LABEL[a.agreement]}</span></h3>
              <p>{a.summary}</p>
              <ul className="factors">
                {a.votes.map((v) => <li key={v.system}><span className={`vote vote-${v.vote}`}>{v.vote > 0 ? "▲" : v.vote < 0 ? "▼" : "●"}</span> <strong>{v.system}:</strong> {v.reason}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
