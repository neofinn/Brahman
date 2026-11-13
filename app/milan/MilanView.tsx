"use client";

import Link from "next/link";
import { useState } from "react";
import { computeKundli } from "@/lib/jyotish";
import { getKriya } from "@/lib/kriyas";
import { milan, type MilanResult } from "@/lib/milan";
import { PLACES, zonedToUtc, type Place } from "@/lib/time";
import { PlacePicker } from "@/components/PlacePicker";

interface Person {
  name: string;
  date: string;
  time: string;
  place: Place;
}

const blank = (): Person => ({ name: "", date: "", time: "", place: PLACES[1] });

function PersonFields({ legend, value, onChange }: { legend: string; value: Person; onChange: (p: Person) => void }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      <label>Name (optional)<input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} /></label>
      <label>Date of birth<input type="date" required value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} /></label>
      <label>Time of birth<input type="time" required value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} /></label>
      <PlacePicker value={value.place} onChange={(place) => onChange({ ...value, place })} label="Place of birth" />
    </fieldset>
  );
}

export function MilanView() {
  return (
    <main>
      <div className="container">
        <h1>Kundli Milan</h1>
        <p className="lede">
          Ashtakoota guna milan — the eight kootas, 36 gunas in all — from the Moon sign and nakshatra of the boy and girl, with Nadi,
          Bhakoot and Mangal dosha checks, their traditional exceptions, and remedies. Computed on your device.
        </p>
        <MilanTool />
      </div>
    </main>
  );
}

/** The matching form and result, also embedded in the Ask Brahman chat. */
export function MilanTool({ onRitual }: { onRitual?: (id: string) => void }) {
  const [boy, setBoy] = useState<Person>(blank);
  const [girl, setGirl] = useState<Person>(blank);
  const [result, setResult] = useState<MilanResult | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const k = (p: Person) => computeKundli(zonedToUtc(p.date, p.time, p.place.timeZone), p.place);
    setResult(milan(k(boy), k(girl)));
  };

  return (
    <>
        <form onSubmit={submit}>
          <div className="milan-forms">
            <PersonFields legend="Boy (var)" value={boy} onChange={setBoy} />
            <PersonFields legend="Girl (kanya)" value={girl} onChange={setGirl} />
          </div>
          <p><button type="submit" className="btn">Match kundlis</button></p>
        </form>

        {result && (
          <section className="section reading">
            <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div className="score-big">{result.total}<span style={{ fontSize: "1rem" }}> / 36</span></div>
              <div style={{ flex: "1 1 240px" }}>
                <h2 style={{ margin: 0, textTransform: "capitalize" }}>{result.verdict}</h2>
                <p style={{ margin: "4px 0 0" }}>{result.summary}</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Koota</th><th>{boy.name || "Boy"}</th><th>{girl.name || "Girl"}</th><th>Gunas</th><th>About</th></tr></thead>
                <tbody>
                  {result.kootas.map((k) => (
                    <tr key={k.name}>
                      <td><strong>{k.name}</strong></td>
                      <td>{k.boy}</td>
                      <td>{k.girl}</td>
                      <td className={k.score === 0 ? "bad" : k.score === k.max ? "good" : undefined}>{k.score} / {k.max}</td>
                      <td>
                        {k.text}
                        {k.dosha && <div className={k.cancelled ? "good" : "bad"}>{k.dosha}{k.cancelled ? ` — cancelled: ${k.cancelled.join("; ")}` : ""}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="reading-section">
              <h3>Mangal dosha</h3>
              <p>{result.mangal.text}</p>
            </div>
            {result.remedies.length > 0 && (
              <div className="reading-section">
                <h3>Remedies</h3>
                <ul>
                  {result.remedies.map((r) => {
                    const k = r.ritual ? getKriya(r.ritual) : undefined;
                    return (
                      <li key={r.text}>
                        {r.text}{" "}
                        {k && (onRitual ? <button type="button" className="chip" onClick={() => onRitual(k.id)}>{k.title}</button> : <Link className="chip" href={`/kriyas/${k.id}`}>{k.title}</Link>)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <p className="disclaimer" style={{ textAlign: "left" }}>
              Tables follow the most widely used North Indian conventions; some kootas (Gana, Vashya) vary between traditions. Bhakoot and Nadi
              doshas show 0 gunas even when an exception applies — the cancellation is noted instead. Love, values and mutual respect
              matter more than any score.
            </p>
          </section>
        )}
    </>
  );
}
