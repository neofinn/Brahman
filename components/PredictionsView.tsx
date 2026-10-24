"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Kundli } from "@/lib/jyotish";
import { getKriya } from "@/lib/kriyas";
import { AREA_TITLES, formatMonth, predict, type AreaId, type AreaReading, type Rating } from "@/lib/predictions";

const RATING_LABEL: Record<Rating, string> = { excellent: "Excellent", favourable: "Favourable", mixed: "Mixed", challenging: "Needs care" };

export function RatingBadge({ rating }: { rating: Rating }) {
  return <span className={`rating rating-${rating}`}>{RATING_LABEL[rating]}</span>;
}

function RitualChip({ id, onRitual }: { id: string; onRitual?: (id: string) => void }) {
  const k = getKriya(id);
  if (!k) return null;
  return onRitual ? (
    <button type="button" className="chip" onClick={() => onRitual(id)}>{k.title}</button>
  ) : (
    <Link className="chip" href={`/kriyas/${id}`}>{k.title}</Link>
  );
}

const span = (a: Date, b: Date) => `${formatMonth(a)} – ${formatMonth(b)}`;

function AreaCard({ a, focus }: { a: AreaReading; focus?: boolean }) {
  return (
    <div className={`card${focus ? " focus" : ""}`}>
      <h3>{a.title} <RatingBadge rating={a.rating} /></h3>
      <p>{a.summary}</p>
      <ul className="factors">{a.factors.map((f) => <li key={f}>{f}</li>)}</ul>
      {a.fields && <p className="sub">Suited fields — {a.fields.join("; ")}.</p>}
      {a.windows.length > 0 ? (
        <>
          <p style={{ marginBottom: 4 }}><strong>{a.id === "health" ? "Periods to watch" : "Likely windows"}:</strong></p>
          <ul className="factors">
            {a.windows.map((w) => <li key={w.start.toISOString()}>{span(w.start, w.end)}{w.strength === "strong" ? " ★" : ""} — {w.why}</li>)}
          </ul>
        </>
      ) : (
        focus && <p className="sub">No strong dasha-and-transit window in the next ten years — results come gradually through steady effort and the remedies below.</p>
      )}
    </div>
  );
}

/** Rule-based predictions: yogas, doshas, life areas, dasha forecast, transits and a remedy plan. */
export function PredictionsView({ kundli, gender, focus, onRitual }: { kundli: Kundli; gender?: "m" | "f"; focus?: AreaId; onRitual?: (id: string) => void }) {
  const p = useMemo(() => predict(kundli, { gender: gender === "f" ? "female" : gender === "m" ? "male" : undefined }), [kundli, gender]);
  const focused = focus && p.areas.find((a) => a.id === focus);
  const areas = focused ? p.areas.filter((a) => a.id !== focus) : p.areas;
  const raja = p.yogas.filter((y) => y.kind !== "other");
  const other = p.yogas.filter((y) => y.kind === "other");

  return (
    <div className="predictions reading">
      {focused && (
        <section className="section" style={{ marginTop: 0 }}>
          <h2>Your question — {AREA_TITLES[focused.id].toLowerCase()}</h2>
          <AreaCard a={focused} focus />
        </section>
      )}
      <p className="lede" style={{ marginBottom: 12 }}>{p.summary}</p>

      {p.current && (
        <section className="section" style={{ marginTop: 0 }}>
          <h2>Now: {p.current.maha}–{p.current.antar} <RatingBadge rating={p.current.rating} /></h2>
          <p>{p.current.themes}</p>
          <p>{p.current.advice}</p>
          <ul>
            {p.current.transits.map((t) => (
              <li key={t.planet}><strong>{t.planet}</strong> in {t.sign} ({t.fromMoon} from your Moon): {t.text}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2>Rajyogas and blessings</h2>
        {raja.length + other.length === 0 && <p>No classical yoga stands out — results come through effort and the dashas.</p>}
        {[...raja, ...other].map((y, i) => (
          <div key={y.name + i} className="reading-section">
            <h3>{y.name}</h3>
            <p>{y.text}</p>
          </div>
        ))}
      </section>

      <section className="section">
        <h2>Doshas</h2>
        {p.doshas.length === 0 && <p>No major dosha in this chart. 🙏</p>}
        {p.doshas.map((d) => (
          <div key={d.name} className="reading-section">
            <h3>{d.name} <span className={`rating ${d.severity === "cancelled" ? "rating-excellent" : d.severity === "high" ? "rating-challenging" : "rating-mixed"}`}>{d.severity === "cancelled" ? "Cancelled" : `${d.severity[0].toUpperCase()}${d.severity.slice(1)}`}</span></h3>
            <p>{d.text}</p>
            {d.cancellations.length > 0 && <p className="sub">Softened by: {d.cancellations.join("; ")}.</p>}
            {d.severity !== "cancelled" && (
              <>
                <ul>{d.practices.map((x) => <li key={x}>{x}</li>)}</ul>
                <p>{d.rituals.map((id) => <RitualChip key={id} id={id} onRitual={onRitual} />)}</p>
              </>
            )}
          </div>
        ))}
      </section>

      <section className="section">
        <h2>Life areas</h2>
        <div className="grid">
          {areas.map((a) => <AreaCard key={a.id} a={a} />)}
        </div>
        <p className="sub">Windows combine the dasha of planets linked to the area with the double transit of Jupiter and Saturn over its house (from the lagna or the Moon). ★ marks the strongest.</p>
      </section>

      <section className="section">
        <h2>Next five years — dasha forecast</h2>
        {p.periods.map((x) => (
          <div key={x.start.toISOString()} className="reading-section period">
            <h3>{x.maha}–{x.antar} · {span(x.start, x.end)} <RatingBadge rating={x.rating} /></h3>
            <p>{x.themes} {x.advice}</p>
            {x.transits.length > 0 && (
              <ul className="factors">
                {x.transits.map((t) => (
                  <li key={t.planet + t.date.toISOString()}>{formatMonth(t.date)}: {t.planet} {t.retrograde ? "moves back into" : "enters"} {t.sign} ({t.fromMoon} from Moon) — {t.text}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="section">
        <h2>Upay — your remedy plan</h2>
        <p className="sub">In order of priority. Mantra japa can be spread over 40 days; daan is best on the graha&apos;s day.</p>
        <div className="grid">
          {p.remedies.map((r) => (
            <div key={r.graha} className="card">
              <h3>{r.purpose === "pacify" ? "Pacify" : "Strengthen"} {r.graha} <span className="deva">({r.devanagari})</span> {r.priority === 1 && <span className="rating rating-challenging">First</span>}</h3>
              <p className="sub">{r.reasons.join(" · ")}</p>
              <p className="deva mantra-line">{r.mantra.devanagari}</p>
              <p className="sub">{r.mantra.iast}</p>
              <ul className="factors">
                <li>Japa: {r.japa.toLocaleString("en-IN")} in total (about {Math.ceil(r.japa / 40 / 108)} mala{Math.ceil(r.japa / 40 / 108) > 1 ? "s" : ""} a day for 40 days)</li>
                <li>Day: {r.day} · {r.vrat}</li>
                <li>Daan: {r.daan}</li>
                <li>Rudraksha: {r.rudraksha}</li>
                {r.gem && <li>Gem: {r.gem}</li>}
              </ul>
              <p>{r.rituals.map((id) => <RitualChip key={id} id={id} onRitual={onRitual} />)}</p>
            </div>
          ))}
        </div>
        <h3>Daily practices</h3>
        <ul>{p.practices.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>
    </div>
  );
}
