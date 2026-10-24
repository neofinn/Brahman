"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDegrees, RASHIS, type Kundli } from "@/lib/jyotish";
import { getKriya } from "@/lib/kriyas";
import { antardashas, readKundli } from "@/lib/reading";
import { charaKarakas, karakamsha, vargaChart, vargottama, VARGAS } from "@/lib/vargas";
import { kpChart, rulingPlanets } from "@/lib/kp";
import { readBnn } from "@/lib/bnn";
import { numerology } from "@/lib/numerology";
import { getGraha } from "@/lib/grahas";
import { formatDate, zonedToUtc, type Place } from "@/lib/time";
import { Chart, type ChartStyle } from "./Charts";
import { GrahaCard } from "./GrahaCard";
import { PredictionsView } from "./PredictionsView";
import { JaiminiView } from "./JaiminiView";
import { LalKitabView } from "./LalKitabView";
import { LifeView } from "./LifeView";
import { ConfluenceView } from "./ConfluenceView";
import { LoShuGrid } from "./LoShuGrid";
import { KundliPdfButton } from "./KundliPdf";
import type { AreaId } from "@/lib/predictions";

const ABBR: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};
const isNode = (name: string) => name === "Rahu" || name === "Ketu";
const STYLE_KEY = "brahman:chart-style";

export interface BirthInfo {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  place: Place;
  gender?: "m" | "f";
}

type Tab = "parashari" | "predictions" | "final" | "life" | "jaimini" | "kp" | "lalkitab" | "bnn" | "numerology";

export function KundliReport({ kundli, name, birth, onRitual, initialTab, focus, onRecompute }: {
  kundli: Kundli; name?: string; birth?: BirthInfo; onRitual?: (id: string) => void; initialTab?: Tab; focus?: AreaId; onRecompute?: (time: string) => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? "parashari");
  const [style, setStyle] = useState<ChartStyle>("north");
  const [varga, setVarga] = useState("D1");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STYLE_KEY);
      if (saved === "north" || saved === "south") setStyle(saved);
    } catch {}
  }, []);
  const changeStyle = (s: ChartStyle) => {
    setStyle(s);
    try {
      localStorage.setItem(STYLE_KEY, s);
    } catch {}
  };

  return (
    <div className="kundli-report">
      {birth && <p style={{ margin: "4px 0 8px" }}><KundliPdfButton kundli={kundli} name={name} birth={birth} /></p>}
      <div className="tabs" role="tablist">
        {([["parashari", "Parashari (BPHS)"], ["predictions", "Predictions & remedies"], ["final", "Final observations"], ["life", "Life so far"], ["jaimini", "Jaimini"], ["kp", "KP"], ["lalkitab", "Lal Kitab"], ["bnn", "Bhrigu Nandi Nadi"], ["numerology", "Numerology & Lo Shu"]] as [Tab, string][]).filter(([t]) => birth || !["final", "life", "jaimini"].includes(t)).map(([t, label]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>
      {tab === "parashari" && <Parashari kundli={kundli} name={name} style={style} onStyle={changeStyle} varga={varga} onVarga={setVarga} onRitual={onRitual} />}
      {tab === "predictions" && <PredictionsView kundli={kundli} gender={birth?.gender} focus={focus} onRitual={onRitual} />}
      {tab === "final" && birth && <ConfluenceView kundli={kundli} birth={birth} />}
      {tab === "life" && birth && <LifeView kundli={kundli} birth={birth} onRecompute={onRecompute} />}
      {tab === "jaimini" && birth && <JaiminiView kundli={kundli} birthUtc={zonedToUtc(birth.date, birth.time, birth.place.timeZone)} />}
      {tab === "lalkitab" && <LalKitabView kundli={kundli} />}
      {tab === "kp" && (birth ? <KpView birth={birth} /> : <p className="sub">KP needs the exact birth time and place.</p>)}
      {tab === "bnn" && <BnnView kundli={kundli} gender={birth?.gender} />}
      {tab === "numerology" && (birth ? <NumerologyView date={birth.date} name={name} /> : null)}
      <p className="disclaimer" style={{ textAlign: "left" }}>
        Jyotisha describes tendencies, not fate. Readings follow classical rules mechanically; for major decisions, consult an experienced jyotishi.
      </p>
    </div>
  );
}

function StyleSwitch({ style, onStyle }: { style: ChartStyle; onStyle: (s: ChartStyle) => void }) {
  return (
    <div className="segmented" role="group" aria-label="Chart style">
      <button type="button" className={style === "north" ? "on" : ""} onClick={() => onStyle("north")}>North Indian</button>
      <button type="button" className={style === "south" ? "on" : ""} onClick={() => onStyle("south")}>South Indian</button>
    </div>
  );
}

function Parashari({ kundli, name, style, onStyle, varga, onVarga, onRitual }: {
  kundli: Kundli; name?: string; style: ChartStyle; onStyle: (s: ChartStyle) => void; varga: string; onVarga: (v: string) => void; onRitual?: (id: string) => void;
}) {
  const reading = useMemo(() => readKundli(kundli), [kundli]);
  const chart = useMemo(() => vargaChart(kundli, varga), [kundli, varga]);
  const karakas = useMemo(() => charaKarakas(kundli), [kundli]);
  const now = Date.now();
  const current = kundli.dashas.find((d) => d.start.getTime() <= now && now < d.end.getTime());
  const remedyGrahas = [...new Map(reading.remedies.map((r) => [r.graha, r])).values()];
  const planets = chart.positions.map((p) => {
    const g = kundli.grahas.find((x) => x.name === p.name)!;
    return { label: `${ABBR[p.name]}${p.retrograde && !isNode(p.name) ? "ᴿ" : ""}${varga === "D1" ? ` ${Math.floor(g.rashi.degree)}°` : ""}`, sign: p.sign };
  });
  const vo = vargottama(kundli);

  return (
    <>
      <div className="chart-tools">
        <StyleSwitch style={style} onStyle={onStyle} />
        <label style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: 6 }}>
          Chart
          <select value={varga} onChange={(e) => onVarga(e.target.value)}>
            {VARGAS.map((v) => <option key={v.id} value={v.id}>{v.id} {v.name}</option>)}
          </select>
        </label>
      </div>
      <div className="two-col">
        <div>
          <Chart style={style} lagna={chart.lagna} planets={planets} title={`${chart.varga.id} ${chart.varga.sanskrit}`} subtitle={name || chart.varga.name} />
          <p className="sub">{chart.varga.id} {chart.varga.name} ({chart.varga.sanskrit}) shows {chart.varga.signifies}. Lagna: {RASHIS[chart.lagna]}.</p>
        </div>
        <div className="card">
          <h3>Key points</h3>
          <p>Lagna: <strong>{kundli.lagna.rashi.name}</strong> {formatDegrees(kundli.lagna.rashi.degree)}</p>
          <p>Rashi (Moon sign): <strong>{kundli.grahas[1].rashi.name}</strong></p>
          <p>Nakshatra: <strong>{kundli.grahas[1].nakshatra.name}</strong> pada {kundli.grahas[1].nakshatra.pada}</p>
          <p>Atmakaraka: <strong>{karakas[0].graha}</strong> · Karakamsha: <strong>{RASHIS[karakamsha(kundli)]}</strong></p>
          {current && <p>Mahadasha: <strong>{current.lord}</strong> until {formatDate(current.end)}</p>}
          {vo.length > 0 && <p>Vargottama: <strong>{vo.join(", ")}</strong></p>}
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

      <section className="section">
        <h2>Chara karakas (Jaimini, per BPHS)</h2>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Karaka</th><th>Graha</th><th>Degree in sign</th><th>Signifies</th></tr></thead>
            <tbody>
              {karakas.map((c) => (
                <tr key={c.karaka}><td>{c.karaka}</td><td>{c.graha}</td><td>{formatDegrees(c.degree)}</td><td>{c.meaning}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Pada</th><th>D9</th></tr>
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
                  <td>{RASHIS[vargaChart(kundli, "D9").positions.find((p) => p.name === g.name)!.sign]}</td>
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
    </>
  );
}

function KpView({ birth }: { birth: BirthInfo }) {
  const result = useMemo(() => {
    try {
      const date = zonedToUtc(birth.date, birth.time, birth.place.timeZone);
      return { chart: kpChart(date, birth.place.latitude, birth.place.longitude) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [birth]);
  const ruling = useMemo(() => {
    const now = new Date();
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: birth.place.timeZone, weekday: "short" }).format(now);
    return rulingPlanets(now, birth.place.latitude, birth.place.longitude, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd));
  }, [birth.place]);
  if ("error" in result) return <p className="bad">{result.error}</p>;
  const { chart } = result;
  const deg = (lon: number) => `${RASHIS[Math.floor(lon / 30)]} ${formatDegrees(lon % 30)}`;
  return (
    <>
      <p className="lede" style={{ marginBottom: 12 }}>
        Krishnamurti Paddhati uses the KP ayanamsa ({formatDegrees(chart.ayanamsa)}), Placidus house cusps, and the sub lord of each
        cusp and planet — the sub lord decides whether a matter is promised.
      </p>
      <section className="section" style={{ marginTop: 0 }}>
        <h2>Cusps (Placidus)</h2>
        <div className="table-wrap">
          <table className="data lords">
            <thead><tr><th>Cusp</th><th>Position</th><th>Sign lord</th><th>Star lord</th><th>Sub lord</th><th>Sub-sub</th></tr></thead>
            <tbody>
              {chart.cusps.map((c) => (
                <tr key={c.house}><td>{c.house}</td><td>{deg(c.longitude)}</td><td>{c.lords.sign}</td><td>{c.lords.star}</td><td><strong>{c.lords.sub}</strong></td><td>{c.lords.subSub}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <h2>Planets</h2>
        <div className="table-wrap">
          <table className="data lords">
            <thead><tr><th>Planet</th><th>Position</th><th>House</th><th>Star lord</th><th>Sub lord</th><th>Sub-sub</th><th>Signifies houses</th></tr></thead>
            <tbody>
              {chart.planets.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}{p.retrograde && !isNode(p.name) ? " ᴿ" : ""}</td><td>{deg(p.longitude)}</td><td>{p.house}</td>
                  <td>{p.star}</td><td><strong>{p.sub}</strong></td><td>{p.subSub}</td><td>{(chart.planetHouses[p.name] ?? []).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <h2>House significators</h2>
        <p className="sub">Strongest first: A — planets in the star of the occupants · B — occupants · C — planets in the star of the cusp lord · D — the cusp lord.</p>
        <div className="table-wrap">
          <table className="data lords">
            <thead><tr><th>House</th><th>A</th><th>B</th><th>C</th><th>D</th></tr></thead>
            <tbody>
              {chart.significators.map((s) => (
                <tr key={s.house}><td>{s.house}</td>{s.levels.map((l, i) => <td key={i}>{l.join(", ") || "—"}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section">
        <h2>Ruling planets now</h2>
        <p>
          Day lord <strong>{ruling.dayLord}</strong> · Moon: sign lord <strong>{ruling.moon.sign}</strong>, star lord <strong>{ruling.moon.star}</strong>, sub lord <strong>{ruling.moon.sub}</strong> ·
          Ascendant: sign lord <strong>{ruling.lagna.sign}</strong>, star lord <strong>{ruling.lagna.star}</strong>, sub lord <strong>{ruling.lagna.sub}</strong>
        </p>
        <p className="sub">Computed for this moment at {birth.place.name}. In KP, ruling planets confirm which significators will act and help time events.</p>
      </section>
    </>
  );
}

function BnnView({ kundli, gender }: { kundli: Kundli; gender?: "m" | "f" }) {
  const r = useMemo(() => readBnn(kundli, gender), [kundli, gender]);
  const block = (title: string, b: { karaka: string; sign: string; lines: string[] }) => (
    <div className="reading-section">
      <h3>{title} — {b.karaka} in {b.sign}</h3>
      {b.lines.length ? <ul>{b.lines.map((l) => <li key={l}>{l}</li>)}</ul> : <p>No planets in its trines, 2nd, 12th or 7th — {b.karaka} works on its own.</p>}
    </div>
  );
  return (
    <section className="reading">
      <p className="lede" style={{ marginBottom: 12 }}>
        Bhrigu Nandi Nadi reads the rashi chart without the lagna: each key planet is joined by the planets in the same sign, in trine,
        in the 2nd and 12th, and opposite it. A retrograde planet also acts from the sign behind it.
      </p>
      {block("The native (jeeva)", r.native)}
      {block("Career (karma)", r.career)}
      {r.spouse ? block(gender === "m" ? "Wife" : "Husband", r.spouse) : <p className="sub">Choose male or female in the birth details to see the spouse reading (Venus for a man, Mars for a woman).</p>}
      <div className="reading-section">
        <h3>Transits now</h3>
        {r.transits.length ? <ul>{r.transits.map((t) => <li key={t}>{t}</li>)}</ul> : <p>Jupiter and Saturn are not touching natal planets by conjunction or trine just now.</p>}
      </div>
    </section>
  );
}

function NumerologyView({ date, name }: { date: string; name?: string }) {
  const n = useMemo(() => numerology(date, name), [date, name]);
  const planetLine = (planet: string) => {
    const g = getGraha(planet);
    return `${g.sanskrit} — favourable day ${g.day}, colour ${g.color}`;
  };
  return (
    <section className="reading">
      <p className="lede" style={{ marginBottom: 12 }}>Chaldean numerology gives each letter a value from 1 to 8 (9 is sacred and unassigned) and reads the name with the birth date.</p>
      {n.name ? (
        <div className="reading-section">
          <h3>Name number: {n.name.compound} → {n.name.root} ({n.name.planet})</h3>
          <p>{n.name.letters.map((l) => `${l.letter}=${l.value}`).join(" · ")}</p>
          <p>Number {n.name.root} brings {n.name.traits}. {planetLine(n.name.planet)}.</p>
        </div>
      ) : (
        <p className="sub">Add a name in the birth details for the name number.</p>
      )}
      <div className="reading-section">
        <h3>Birth number: {n.birth.number} ({n.birth.planet})</h3>
        <p>From the day of birth: {n.birth.traits}. {planetLine(n.birth.planet)}.</p>
      </div>
      <LoShuGrid date={date} />
      <div className="reading-section">
        <h3>Destiny number: {n.destiny.compound} → {n.destiny.number} ({n.destiny.planet})</h3>
        <p>From the full date of birth: {n.destiny.traits}. {planetLine(n.destiny.planet)}.</p>
      </div>
      {n.name && n.name.root !== n.destiny.number && (
        <p className="sub">The name number ({n.name.root}) differs from the destiny number ({n.destiny.number}); numerologists often suggest name spellings that harmonise with the birth or destiny number.</p>
      )}
    </section>
  );
}
