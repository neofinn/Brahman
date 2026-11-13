"use client";

import { useMemo } from "react";
import type { Kundli } from "@/lib/jyotish";
import { lifeGuide } from "@/lib/lifeguide";
import { gemsForGoals } from "@/lib/gems";
import { specialLagnas } from "@/lib/lagnas";
import { predict } from "@/lib/predictions";
import { zonedToUtc } from "@/lib/time";
import type { BirthInfo } from "./KundliReport";

export function useLifeGuide(kundli: Kundli, birth: BirthInfo) {
  return useMemo(() => {
    const birthUtc = zonedToUtc(birth.date, birth.time, birth.place.timeZone);
    const p = predict(kundli, { gender: birth.gender === "f" ? "female" : birth.gender === "m" ? "male" : undefined });
    return { guide: lifeGuide(kundli, p, birthUtc, birth.date), gems: gemsForGoals(kundli), lagnas: specialLagnas(kundli, birthUtc, birth.place) };
  }, [kundli, birth]);
}

/** Your life guide in plain words: now, career, timing of life events, care periods, gems for goals and the lagnas. */
export function LifeGuideView({ kundli, birth }: { kundli: Kundli; birth: BirthInfo }) {
  const { guide, gems, lagnas } = useLifeGuide(kundli, birth);
  return (
    <div className="reading life-guide">
      <p className="lede" style={{ marginBottom: 12 }}>
        Your chart in plain words — every technique (Parashari, Jaimini, KP, Lal Kitab, transits and numerology) brought together
        into answers about your life, with dates and ages.
      </p>
      <section className="section" style={{ marginTop: 0 }}>
        <h2>This time of your life</h2>
        {guide.now.map((l) => <p key={l}>{l}</p>)}
      </section>
      <section className="section">
        <h2>Your best career</h2>
        <p>{guide.career.text}</p>
      </section>
      <section className="section">
        <h2>When will it happen?</h2>
        <div className="grid">
          {guide.answers.map((a) => (
            <div key={a.id} className={`card guide-${a.kind}`}>
              <h3>{a.question}</h3>
              <p><strong>{a.answer}</strong></p>
              <p className="sub">Why: {a.why}</p>
              <p className="sub">Tip: {a.tip}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Gemstones for your life goals</h2>
        <p className="sub">Chosen from the planets that govern each goal, and only if they are friendly for your lagna. A gem strengthens a planet — never wear one for a planet that rules a difficult house in your chart.</p>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Goal</th><th>Best gem</th><th>Also suits</th><th>Avoid</th></tr></thead>
            <tbody>
              {gems.map((g) => (
                <tr key={g.goal}>
                  <td>{g.goal}</td>
                  <td>{g.recommended ? <><strong>{g.recommended.gem}</strong> ({g.recommended.hindi}) — {g.recommended.reason}. {g.recommended.finger}, {g.recommended.metal}, {g.recommended.day}; substitute: {g.recommended.substitute}</> : "No gem — use mantra and daan"}</td>
                  <td>{g.alternative ? `${g.alternative.gem} (${g.alternative.planet})` : "—"}</td>
                  <td>{g.avoid.length ? g.avoid.map((a) => `${a.gem} (${a.planet})`).join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sub">How to wear: buy a natural, untreated stone; energise it with the planet&apos;s mantra 108 times on its day; test for 3–7 days and remove it if sleep, health or mood suffers. Consult an astrologer before wearing blue sapphire, hessonite or cat&apos;s eye.</p>
      </section>
      <section className="section">
        <h2>All the lagnas</h2>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Lagna</th><th>Sign</th><th>Shows</th><th>In your chart</th></tr></thead>
            <tbody>{lagnas.map((l) => <tr key={l.name}><td>{l.name} <span className="deva">{l.devanagari}</span></td><td>{l.signName}</td><td>{l.meaning}</td><td>{l.reading}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
