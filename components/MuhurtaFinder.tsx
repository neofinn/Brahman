"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getKriya } from "@/lib/kriyas";
import { ACTIVITIES, findMuhurtas, type Activity, type MuhurtaDay } from "@/lib/muhurta";
import { PLACES, formatDate, formatTime, todayIn, zonedToUtc, type Place } from "@/lib/time";
import { PlacePicker } from "./PlacePicker";

/** Finds auspicious days and time windows for an activity over the coming months. */
export function MuhurtaFinder({ initial = "griha-pravesh", onRitual }: { initial?: Activity; onRitual?: (id: string) => void }) {
  const [activity, setActivity] = useState<Activity>(initial);
  const [place, setPlace] = useState<Place>(PLACES[0]);
  const [from, setFrom] = useState("");
  const [days, setDays] = useState<MuhurtaDay[] | null>(null);

  useEffect(() => setFrom(todayIn(place.timeZone)), []);
  useEffect(() => {
    if (!from) return;
    // Panchang for ~90 days takes a few hundred milliseconds; let the selection paint first.
    const id = setTimeout(() => setDays(findMuhurtas(activity, from, place, 90, 8)), 20);
    return () => clearTimeout(id);
  }, [activity, place, from]);

  const def = ACTIVITIES[activity];
  const ritual = def.ritual ? getKriya(def.ritual) : undefined;
  const tz = place.timeZone;

  return (
    <div className="muhurta">
      <div className="form-row">
        <label>
          Activity
          <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
            {(Object.keys(ACTIVITIES) as Activity[]).map((a) => <option key={a} value={a}>{ACTIVITIES[a].title}</option>)}
          </select>
        </label>
        <label>
          From
          <input type="date" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} />
        </label>
        <PlacePicker value={place} onChange={setPlace} />
      </div>
      {days === null ? (
        <p className="sub">Reading the panchang for the next three months…</p>
      ) : days.length === 0 ? (
        <p>No fully auspicious day in the next 90 days for this activity (Chaturmas, Kharmas or a combust Jupiter or Venus may be blocking it). Try a later start date.</p>
      ) : (
        <div className="grid">
          {days.map((d) => (
            <div key={d.date} className="card muhurta-day">
              <h3 style={{ margin: 0 }}>{formatDate(zonedToUtc(d.date, "12:00", tz), tz)} · {d.weekday.split(" ")[0]} {d.quality === "best" && <span className="rating rating-excellent">Best</span>}</h3>
              <div className="sub">{d.tithi} · {d.nakshatra}</div>
              <ul className="factors">
                {d.windows.map((w) => <li key={w.label + w.start.toISOString()}>{formatTime(w.start, tz)} – {formatTime(w.end, tz)} {w.label !== "Shubh" && <strong>{w.label}</strong>}</li>)}
              </ul>
              {d.notes.length > 0 && <div className="sub">{d.notes.join(" · ")}</div>}
            </div>
          ))}
        </div>
      )}
      <p className="sub">
        Rules: nakshatras and weekdays suited to {def.title.toLowerCase()}; avoids Amavasya, Rikta tithis (4, 9, 14), Bhadra, inauspicious
        yogas, Rahu Kaal and Yamaganda{activity === "vivah" || activity === "griha-pravesh" || activity === "mundan" ? ", Chaturmas, Kharmas and combust Jupiter or Venus" : ""}.
        For marriage and griha pravesh, a pandit also checks the lagna at the chosen moment and the family&apos;s charts.
      </p>
      {ritual && (
        <p>
          Vidhi:{" "}
          {onRitual ? <button type="button" className="chip" onClick={() => onRitual(ritual.id)}>{ritual.title}</button> : <Link className="chip" href={`/kriyas/${ritual.id}`}>{ritual.title}</Link>}
        </p>
      )}
    </div>
  );
}
