"use client";

import { useEffect, useMemo, useState } from "react";
import type { Kundli } from "@/lib/jyotish";
import { LIFE_EVENTS, pastChapters, rectify, type LifeEvent, type LifeEventType } from "@/lib/lifeline";
import { formatMonth } from "@/lib/predictions";
import { zonedToUtc } from "@/lib/time";
import { RatingBadge } from "./PredictionsView";
import type { BirthInfo } from "./KundliReport";

const EVENTS_KEY = "brahman:life-events";

function loadEvents(key: string): LifeEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "{}")[key] ?? [];
  } catch {
    return [];
  }
}
function saveEvents(key: string, events: LifeEvent[]) {
  try {
    const all = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "{}");
    all[key] = events;
    localStorage.setItem(EVENTS_KEY, JSON.stringify(all));
  } catch {}
}

/** The native's life so far, chapter by chapter, and birth-time rectification from remembered events. */
export function LifeView({ kundli, birth, onRecompute }: { kundli: Kundli; birth: BirthInfo; onRecompute?: (time: string) => void }) {
  const birthUtc = useMemo(() => zonedToUtc(birth.date, birth.time, birth.place.timeZone), [birth]);
  const chapters = useMemo(() => pastChapters(kundli, birthUtc), [kundli, birthUtc]);
  const storeKey = `${birth.date}T${birth.time}@${birth.place.latitude},${birth.place.longitude}`;
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [type, setType] = useState<LifeEventType>("marriage");
  const [date, setDate] = useState("");
  useEffect(() => setEvents(loadEvents(storeKey)), [storeKey]);
  const update = (next: LifeEvent[]) => {
    setEvents(next);
    saveEvents(storeKey, next);
  };
  const result = useMemo(
    () => (events.length ? rectify(birth.time, (hm) => zonedToUtc(birth.date, hm, birth.place.timeZone), birth.place, events) : null),
    [events, birth],
  );

  return (
    <div className="reading">
      <p className="lede" style={{ marginBottom: 12 }}>
        Your life so far as the chart describes it — every dasha period since birth with your age. Check it against what really
        happened; then add a few dated events below and Brahman will test your birth time against them, so future predictions rest
        on a verified chart.
      </p>

      <section className="section" style={{ marginTop: 0 }}>
        <h2>Verify with your past events</h2>
        <div className="events-form">
          <label>Event
            <select value={type} onChange={(e) => setType(e.target.value as LifeEventType)}>
              {(Object.keys(LIFE_EVENTS) as LifeEventType[]).map((t) => <option key={t} value={t}>{LIFE_EVENTS[t].title}</option>)}
            </select>
          </label>
          <label>Month and year
            <input type="month" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().slice(0, 7)} min={birth.date.slice(0, 7)} />
          </label>
          <button type="button" className="btn" disabled={!date} onClick={() => { update([...events, { type, date }]); setDate(""); }}>Add event</button>
        </div>
        {events.length > 0 && result && (
          <>
            <ul className="factors">
              {result.given.matches.map((m, i) => (
                <li key={i}>
                  {LIFE_EVENTS[m.event.type].title}, {m.event.date}: {m.maha}–{m.antar} dasha — {m.why.length ? m.why.join("; ") : "no direct link (the event may have another cause, or the birth time differs)"}{" "}
                  <span className={`vote vote-${m.score >= 2 ? 1 : m.score >= 1 ? 0 : -1}`}>{m.score >= 2 ? "✓ matches" : m.score >= 1 ? "~ partial" : "✗ no match"}</span>{" "}
                  <button type="button" className="chip" onClick={() => update(events.filter((_, j) => j !== i))}>Remove</button>
                </li>
              ))}
            </ul>
            <p><strong>{result.advice}</strong></p>
            {result.candidates[0] && result.candidates[0].score > result.given.score && onRecompute && (
              <p><button type="button" className="btn secondary" onClick={() => onRecompute(result.candidates[0].time)}>Recompute the kundli with {result.candidates[0].time}</button></p>
            )}
            <p className="sub">Best-fitting times: {result.candidates.map((c) => `${c.time} (${c.lagna} lagna, score ${c.score})`).join(" · ")}. Events are tested against the Vimshottari dasha lords linked to their houses and the Jupiter–Saturn double transit; 3–5 well-dated events give the most reliable result.</p>
          </>
        )}
      </section>

      <section className="section">
        <h2>Your life chapter by chapter</h2>
        {chapters.map((c) => (
          <div key={c.start.toISOString()} className="reading-section period">
            <h3>Age {Math.floor(c.ageFrom)}–{Math.ceil(c.ageTo)} · {c.maha}–{c.antar} · {formatMonth(c.start)} – {formatMonth(c.end)} <RatingBadge rating={c.rating} /></h3>
            <p>{c.themes}</p>
            {c.markers.length > 0 && <ul className="factors">{c.markers.map((m) => <li key={m}>{m}</li>)}</ul>}
          </div>
        ))}
      </section>
    </div>
  );
}
