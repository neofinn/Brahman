"use client";

import { computeKundli, formatDegrees, type Kundli } from "@/lib/jyotish";
import { milan } from "@/lib/milan";
import { predict } from "@/lib/predictions";
import { readJaimini } from "@/lib/jaimini";
import { formatDate, zonedToUtc, type Place } from "@/lib/time";
import { NorthChart } from "./Charts";
import { renderPdf } from "./KundliPdf";

export interface PersonBirth {
  name: string;
  date: string;
  time: string;
  place: Place;
}

const ABBR: Record<string, string> = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };

function Side({ p, k, label }: { p: PersonBirth; k: Kundli; label: string }) {
  const moon = k.grahas[1];
  const pr = predict(k, { gender: label === "Boy" ? "male" : "female" });
  const marriage = pr.areas.find((a) => a.id === "marriage")!;
  const j = readJaimini(k, zonedToUtc(p.date, p.time, p.place.timeZone));
  return (
    <div>
      <NorthChart lagna={k.lagna.rashi.index} planets={k.grahas.map((g) => ({ label: ABBR[g.name], sign: g.rashi.index }))} title={`${label}: ${p.name || label}`} />
      <p className="pdf-cap"><strong>{label}: {p.name || "—"}</strong> · {formatDate(zonedToUtc(p.date, p.time, p.place.timeZone), p.place.timeZone)}, {p.time}, {p.place.name}</p>
      <p className="pdf-small">Lagna {k.lagna.rashi.name} {formatDegrees(k.lagna.rashi.degree)} · Rashi {moon.rashi.name} · Nakshatra {moon.nakshatra.name} ({moon.nakshatra.pada})</p>
      <p className="pdf-small"><strong>Marriage in this chart — {marriage.rating}:</strong> {marriage.summary} {j.points.find((x) => x.startsWith("Upapada")) ?? ""}</p>
    </div>
  );
}

function MilanReport({ boy, girl }: { boy: PersonBirth; girl: PersonBirth }) {
  const kb = computeKundli(zonedToUtc(boy.date, boy.time, boy.place.timeZone), boy.place);
  const kg = computeKundli(zonedToUtc(girl.date, girl.time, girl.place.timeZone), girl.place);
  const r = milan(kb, kg);
  return (
    <div className="pdf-report">
      <div className="pdf-block">
        <div className="pdf-cover">
          <div className="pdf-om">ॐ</div>
          <h1>Kundli Milan Report</h1>
          <p className="pdf-deva" style={{ margin: 0 }}>कुण्डली मिलान</p>
          <p className="pdf-name">{boy.name || "Boy"} & {girl.name || "Girl"}</p>
          <p style={{ fontSize: 40, fontWeight: 700, color: "var(--saffron-strong)", margin: "10px 0 0" }}>{r.total} / 36</p>
          <p><strong style={{ textTransform: "capitalize" }}>{r.verdict}</strong></p>
          <p className="pdf-small">Prepared by Brahman on {formatDate(new Date())}. Ashtakoota guna milan on the Moon signs and nakshatras (Lahiri ayanamsa), with Nadi, Bhakoot and Mangal dosha checks.</p>
        </div>
      </div>
      <div className="pdf-block page-break">
        <h2 className="pdf-h">The verdict</h2>
        <p>{r.summary}</p>
        <table className="pdf-table">
          <thead><tr><th>Koota</th><th>{boy.name || "Boy"}</th><th>{girl.name || "Girl"}</th><th>Gunas</th><th>What it means</th></tr></thead>
          <tbody>{r.kootas.map((k) => <tr key={k.name}><td><strong>{k.name}</strong></td><td>{k.boy}</td><td>{k.girl}</td><td>{k.score} / {k.max}</td><td>{k.text}{k.dosha ? ` ${k.dosha}${k.cancelled ? ` — cancelled: ${k.cancelled.join("; ")}` : ""}.` : ""}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="pdf-block">
        <p className="pdf-sub">Mangal dosha</p>
        <p>{r.mangal.text}</p>
        {r.remedies.length > 0 && (<><p className="pdf-sub">Remedies</p><ul>{r.remedies.map((x) => <li key={x.text}>{x.text}</li>)}</ul></>)}
      </div>
      <div className="pdf-block page-break">
        <h2 className="pdf-h">Both charts</h2>
        <div className="pdf-two"><Side p={boy} k={kb} label="Boy" /><Side p={girl} k={kg} label="Girl" /></div>
      </div>
      <div className="pdf-block"><p className="pdf-small pdf-disclaimer">Guna milan is one part of matching; the full charts, the families&apos; values and the couple&apos;s understanding matter as much. Tables follow common North Indian conventions; some kootas vary between traditions.</p></div>
    </div>
  );
}

export function buildMilanPdf(boy: PersonBirth, girl: PersonBirth): Promise<Blob> {
  return renderPdf(<MilanReport boy={boy} girl={girl} />, `Brahman — Kundli Milan · ${boy.name || "Boy"} & ${girl.name || "Girl"}`);
}
