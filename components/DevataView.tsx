"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Kundli } from "@/lib/jyotish";
import { devataPlan, type Deity } from "@/lib/devata";
import { getKriya } from "@/lib/kriyas";
import { getKatha } from "@/lib/kathas";
import { predict } from "@/lib/predictions";
import { zonedToUtc } from "@/lib/time";
import type { BirthInfo } from "./KundliReport";

function DeityLine({ deity, onRitual }: { deity: Deity; onRitual?: (id: string) => void }) {
  return (
    <>
      <p className="deva mantra-line">{deity.mantra}</p>
      <p className="sub">{deity.iast}</p>
      <p className="sub">Day: {deity.day} · Offer: {deity.offering} · Stotra: {deity.stotra}</p>
      <div className="chips">
        {deity.rituals.map((id) => {
          const k = getKriya(id);
          if (!k) return null;
          return onRitual ? <button key={id} type="button" className="chip" onClick={() => onRitual(id)}>{k.title}</button> : <Link key={id} className="chip" href={`/kriyas/${id}`}>{k.title}</Link>;
        })}
        {deity.kathas.slice(0, 2).map((id) => {
          const k = getKatha(id);
          return k ? <Link key={id} className="chip" href={`/katha/${id}`}>{k.title.split(/[—(]/)[0].trim()}</Link> : null;
        })}
      </div>
    </>
  );
}

/** Which deity to worship, from the kundli and the dasha, and for which goal. */
export function DevataView({ kundli, birth, onRitual }: { kundli: Kundli; birth: BirthInfo; onRitual?: (id: string) => void }) {
  const plan = useMemo(() => {
    const birthUtc = zonedToUtc(birth.date, birth.time, birth.place.timeZone);
    return devataPlan(kundli, predict(kundli, { gender: birth.gender === "f" ? "female" : birth.gender === "m" ? "male" : undefined }), birthUtc);
  }, [kundli, birth]);
  return (
    <div className="reading">
      <p className="lede" style={{ marginBottom: 12 }}>
        Which deity to worship, read from your kundli and dasha: the deities closest to you for life, the ones to please in the
        present period, and the deity for each wish.
      </p>
      <section className="section" style={{ marginTop: 0 }}>
        <h2>Your deities for life</h2>
        <div className="grid">
          {plan.core.map((c, i) => (
            <div key={c.deity.id + i} className="card">
              <h3>{c.deity.name} <span className="deva">({c.deity.devanagari})</span></h3>
              <p><strong>For:</strong> {c.for}</p>
              <p className="sub">{c.why}</p>
              <DeityLine deity={c.deity} onRitual={onRitual} />
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Worship now — for your current dasha and transits</h2>
        <div className="grid">
          {plan.now.map((c, i) => (
            <div key={c.deity.id + i} className="card">
              <h3>{c.deity.name}</h3>
              <p className="sub">{c.why}</p>
              <p><strong>Brings:</strong> {c.deity.gives}</p>
              <DeityLine deity={c.deity} onRitual={onRitual} />
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Deity for each wish</h2>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>To get</th><th>Worship</th><th>Mantra</th><th>Day</th></tr></thead>
            <tbody>
              {plan.goals.map((g) => (
                <tr key={g.goal}>
                  <td>{g.goal}</td>
                  <td><strong>{g.primary.name}</strong>{g.chart ? ` — and ${g.chart.name} (your chart)` : ""}<div className="sub">{g.why}</div></td>
                  <td className="deva">{g.primary.mantra}</td>
                  <td>{g.primary.day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <h2>Deities through the coming years</h2>
        {plan.periods.map((p) => (
          <div key={p.when} className="reading-section">
            <h3>{p.when} · {p.maha}–{p.antar}: {p.deities.map((d) => d.name).join(" and ")}</h3>
            <p className="sub">{p.focus}</p>
          </div>
        ))}
      </section>
      {plan.doshas.length > 0 && (
        <section className="section">
          <h2>Deities for your doshas</h2>
          <ul>{plan.doshas.map((x) => <li key={x.why}><strong>{x.why}:</strong> {x.deity.name} — <span className="deva">{x.deity.mantra}</span>, {x.deity.day}.</li>)}</ul>
        </section>
      )}
      <section className="section">
        <h2>Your daily worship</h2>
        <ul>{plan.daily.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className="sub">Follow your family&apos;s kuldevi or kuldevta as well — tradition places the family deity first. Worship with love, not fear; every deity is a form of the one Bhagwan.</p>
      </section>
    </div>
  );
}
