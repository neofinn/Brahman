"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { formatDegrees, RASHIS, type Kundli } from "@/lib/jyotish";
import { readKundli } from "@/lib/reading";
import { charaKarakas, vargaChart } from "@/lib/vargas";
import { kpChart } from "@/lib/kp";
import { readBnn } from "@/lib/bnn";
import { numerology } from "@/lib/numerology";
import { loShu, LO_SHU_LAYOUT, personalYear, PERSONAL_YEAR } from "@/lib/loshu";
import { readJaimini } from "@/lib/jaimini";
import { lalKitab } from "@/lib/lalkitab";
import { pastChapters } from "@/lib/lifeline";
import { confluence, presentConfluence } from "@/lib/confluence";
import { PAKKA_GHAR } from "@/lib/lalkitab";
import { formatMonth, predict } from "@/lib/predictions";
import { getGraha } from "@/lib/grahas";
import { formatDate, zonedToUtc } from "@/lib/time";
import { NorthChart } from "./Charts";
import { VARGAS } from "@/lib/vargas";
import { lifeGuide } from "@/lib/lifeguide";
import { gemsForGoals } from "@/lib/gems";
import { specialLagnas } from "@/lib/lagnas";
import { devataPlan } from "@/lib/devata";
import type { BirthInfo } from "./KundliReport";
import { FREE_REPORT, getReport, type ReportDef, type SectionId } from "@/lib/reports";
import { GEMS } from "@/lib/gems";
import { gemSafety } from "@/lib/predictions";

const ABBR: Record<string, string> = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };

/** The full printable report: every system, the predictions, the life so far and the final observations. */
function Report({ kundli, name, birth, report }: { kundli: Kundli; name?: string; birth: BirthInfo; report: ReportDef }) {
  const has = (sec: SectionId) => report.sections.includes(sec);
  const birthUtc = zonedToUtc(birth.date, birth.time, birth.place.timeZone);
  const reading = readKundli(kundli);
  const p = predict(kundli, { gender: birth.gender === "f" ? "female" : birth.gender === "m" ? "male" : undefined });
  const j = readJaimini(kundli, birthUtc);
  let kp: ReturnType<typeof kpChart> | null = null;
  try {
    kp = kpChart(birthUtc, birth.place.latitude, birth.place.longitude);
  } catch {}
  const lk = lalKitab(kundli);
  const bnn = readBnn(kundli, birth.gender);
  const num = numerology(birth.date, name);
  const ls = loShu(birth.date);
  const chapters = pastChapters(kundli, birthUtc);
  const areas = confluence(kundli, p, kp, { pakka: PAKKA_GHAR }).filter((a) => !report.areas || report.areas.includes(a.id));
  const present = presentConfluence(kundli, p, j, birth.date);
  const d9 = vargaChart(kundli, "D9");
  const moon = kundli.grahas[1];
  const py = personalYear(birth.date, new Date().getFullYear());
  const fullGuide = lifeGuide(kundli, p, birthUtc, birth.date);
  const guide = { ...fullGuide, answers: fullGuide.answers.filter((a) => !report.answers || report.answers.includes(a.id)) };
  const gems = gemsForGoals(kundli).filter((g) => !report.gemGoals || report.gemGoals.includes(g.id));
  const fullDevata = devataPlan(kundli, p, birthUtc);
  const devata = { ...fullDevata, goals: fullDevata.goals.filter((g) => !report.devataGoals || report.devataGoals.includes(g.goal)) };
  const pAreas = p.areas.filter((a) => !report.areas || report.areas.includes(a.id));
  const lagnas = specialLagnas(kundli, birthUtc, birth.place);
  const vargaRows: (typeof VARGAS)[] = [];
  const allVargas = VARGAS.filter((v) => v.id !== "D1" && v.id !== "D9" && (!report.vargas || report.vargas.includes(v.id)));
  for (let i = 0; i < allVargas.length; i += 3) vargaRows.push(allVargas.slice(i, i + 3));
  const d1Planets = kundli.grahas.map((g) => ({ label: `${ABBR[g.name]} ${Math.floor(g.rashi.degree)}°`, sign: g.rashi.index }));
  const d9Planets = d9.positions.map((x) => ({ label: ABBR[x.name], sign: x.sign }));

  const Block = ({ children, breakBefore }: { children: React.ReactNode; breakBefore?: boolean }) => <div className={`pdf-block${breakBefore ? " page-break" : ""}`}>{children}</div>;
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="pdf-h">{children}</h2>;

  return (
    <div className="pdf-report">
      <Block>
        <div className="pdf-cover">
          <div className="pdf-om">ॐ</div>
          <h1>{report.title}</h1>
          <p className="pdf-deva" style={{ margin: 0 }}>{report.hindi}</p>
          <p className="pdf-name">{name || "Native"}</p>
          <p>{formatDate(birthUtc, birth.place.timeZone)}, {birth.time} · {birth.place.name}({birth.place.latitude.toFixed(2)}°, {birth.place.longitude.toFixed(2)}°, {birth.place.timeZone})</p>
          <p>Lagna <strong>{kundli.lagna.rashi.name}</strong> {formatDegrees(kundli.lagna.rashi.degree)} · Rashi <strong>{moon.rashi.name}</strong> · Nakshatra <strong>{moon.nakshatra.name}</strong> pada {moon.nakshatra.pada}</p>
          <p className="pdf-small">Prepared by Brahman on {formatDate(new Date())}. Lahiri ayanamsa {formatDegrees(kundli.ayanamsa)}; whole-sign houses (KP: Placidus with Krishnamurti ayanamsa). Systems: Parashari (BPHS), Jaimini, KP, Lal Kitab, Bhrigu Nandi Nadi, Chaldean numerology and Lo Shu.</p>
        </div>
      </Block>

{has("guide-now") && (<>
      <Block breakBefore>
        <H>Your life guide — in plain words</H>
        <p className="pdf-small">Everything in this report — Parashari, Jaimini, KP, Lal Kitab, transits and numerology — brought together into answers about your life. Ages are shown so you can check the past and plan the future.</p>
        <p className="pdf-sub">This time of your life</p>
        {guide.now.map((l) => <p key={l}>{l}</p>)}
      </Block>
      </>)}
{has("career") && (<>
      <Block>
        <p className="pdf-sub">Your best career</p>
        <p>{guide.career.text}</p>
      </Block>
      </>)}
{has("answers") && (<>
      {guide.answers.map((a) => (
        <Block key={a.id}>
          <div className={`pdf-q${a.kind === "care" ? " care" : ""}`}>
            <h4>{a.question}</h4>
            <p><strong>{a.answer}</strong></p>
            <p className="pdf-small">Why: {a.why} Tip: {a.tip}</p>
          </div>
        </Block>
      ))}
      </>)}
{has("devata") && (<>
      <Block breakBefore>
        <H>Which deity to worship</H>
        <p className="pdf-sub">Your deities for life</p>
        {devata.core.map((c, i) => <p key={i}><strong>{c.deity.name}</strong> — for {c.for}. <span className="pdf-small">{c.why} Mantra: </span><span className="pdf-deva">{c.deity.mantra}</span><span className="pdf-small"> · {c.deity.day} · offer {c.deity.offering}</span></p>)}
        <p className="pdf-sub">Worship now — for your current dasha and transits</p>
        {devata.now.map((c, i) => <p key={i}><strong>{c.deity.name}</strong> — {c.deity.gives}. <span className="pdf-small">{c.why} Mantra: </span><span className="pdf-deva">{c.deity.mantra}</span></p>)}
      </Block>
      <Block>
        <p className="pdf-sub">Deity for each wish</p>
        <table className="pdf-table">
          <thead><tr><th>To get</th><th>Worship</th><th>Mantra and day</th></tr></thead>
          <tbody>{devata.goals.map((g) => <tr key={g.goal}><td>{g.goal}</td><td>{g.primary.name}{g.chart ? `, and ${g.chart.name} (your chart)` : ""}</td><td><span className="pdf-deva">{g.primary.mantra}</span> — {g.primary.day}</td></tr>)}</tbody>
        </table>
      </Block>
      <Block>
        <p className="pdf-sub">Deities through the coming years</p>
        <ul className="pdf-small">{devata.periods.map((x) => <li key={x.when}><strong>{x.when} ({x.maha}–{x.antar}):</strong> {x.deities.map((dd) => dd.name).join(" and ")}</li>)}</ul>
        {devata.doshas.length > 0 && <><p className="pdf-sub">For your doshas</p><ul className="pdf-small">{devata.doshas.map((x) => <li key={x.why}>{x.why}: {x.deity.name} — {x.deity.mantra}</li>)}</ul></>}
        <p className="pdf-sub">Daily worship</p>
        <ul className="pdf-small">{devata.daily.map((x) => <li key={x}>{x}</li>)}</ul>
      </Block>
      </>)}

{has("gems") && (<>
      <Block breakBefore>
        <H>Gemstones for your life goals</H>
        <p className="pdf-small">Chosen from the planets that govern each goal, and only when friendly for your lagna. Buy natural, untreated stones; energise with the mantra 108 times on the day; test 3–7 days.</p>
        <table className="pdf-table">
          <thead><tr><th>Goal</th><th>Best gem and how to wear</th><th>Avoid</th></tr></thead>
          <tbody>
            {gems.map((g) => (
              <tr key={g.goal}>
                <td>{g.goal}</td>
                <td>{g.recommended ? <><strong>{g.recommended.gem}</strong> {g.recommended.hindi} — {g.recommended.reason}. {g.recommended.finger}, {g.recommended.metal}, {g.recommended.day}, {g.recommended.weight}. Substitute: {g.recommended.substitute}.{g.alternative ? ` Also suits: ${g.alternative.gem}.` : ""}</> : "No gem — mantra, daan and worship instead"}</td>
                <td>{g.avoid.length ? g.avoid.map((a) => `${a.gem} (${a.planet})`).join(", ") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>
      </>)}

{has("charts") && (<>
      <Block breakBefore>
        <H>Birth charts</H>
        <div className="pdf-two">
          <div><NorthChart lagna={kundli.lagna.rashi.index} planets={d1Planets} title="D1 Rashi" subtitle={name} /><p className="pdf-cap">D1 Rashi chart</p></div>
          <div><NorthChart lagna={d9.lagna} planets={d9Planets} title="D9 Navamsha" /><p className="pdf-cap">D9 Navamsha chart</p></div>
        </div>
      </Block>
      </>)}

{has("vargas") && (<>
      {vargaRows.map((row, i) => (
        <Block key={i}>
          {i === 0 && <p className="pdf-sub">{report.vargas ? "Divisional charts for this report" : "All divisional charts (D1 to D60)"}</p>}
          <div className="pdf-three">
            {row.map((v) => {
              const c = vargaChart(kundli, v.id);
              return (
                <div key={v.id}>
                  <NorthChart lagna={c.lagna} planets={c.positions.map((x) => ({ label: ABBR[x.name], sign: x.sign }))} title={`${v.id} ${v.name}`} />
                  <p className="pdf-cap"><strong>{v.id} {v.name}</strong> — {v.signifies}</p>
                </div>
              );
            })}
          </div>
        </Block>
      ))}
      </>)}

{has("lagnas") && (<>
      <Block>
        <H>All the lagnas</H>
        <table className="pdf-table">
          <thead><tr><th>Lagna</th><th>Sign</th><th>Shows</th><th>In your chart</th></tr></thead>
          <tbody>{lagnas.map((l) => <tr key={l.name}><td>{l.name}</td><td>{l.signName}</td><td>{l.meaning}</td><td>{l.reading}</td></tr>)}</tbody>
        </table>
      </Block>
      </>)}

{has("planets") && (<>
      <Block breakBefore>
        <H>Graha positions</H>
        <table className="pdf-table">
          <thead><tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>House</th><th>Nakshatra (pada)</th><th>D9</th></tr></thead>
          <tbody>
            {kundli.grahas.map((g) => (
              <tr key={g.name}><td>{g.name}{g.retrograde && g.name !== "Rahu" && g.name !== "Ketu" ? " ᴿ" : ""}</td><td>{g.rashi.name}</td><td>{formatDegrees(g.rashi.degree)}</td><td>{g.house}</td><td>{g.nakshatra.name} ({g.nakshatra.pada})</td><td>{RASHIS[d9.positions.find((x) => x.name === g.name)!.sign]}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="pdf-small">Chara karakas: {charaKarakas(kundli).map((c) => `${c.karaka} ${c.graha}`).join(" · ")}</p>
      </Block>
      </>)}

{has("confluence") && (<>
      <Block breakBefore><H>Final observations — how each system votes</H>
        <p><strong>{p.summary}</strong></p>
        <p className="pdf-sub">The present</p>
        <ul>{present.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        <p><strong>{present.verdict}</strong></p>
      </Block>
      {areas.map((a) => (
        <Block key={a.id}>
          <p className="pdf-sub">{a.title} — {a.agreement}</p>
          <p>{a.summary}</p>
          <ul className="pdf-small">{a.votes.map((v) => <li key={v.system}>{v.vote > 0 ? "▲" : v.vote < 0 ? "▼" : "●"} {v.system}: {v.reason}</li>)}</ul>
        </Block>
      ))}
      </>)}

{has("parashari") && (<>
      <Block breakBefore><H>Parashari reading (Brihat Parashara Hora Shastra)</H><p>{reading.summary}</p></Block>
      {reading.sections.map((s) => (
        <Block key={s.title}>
          <p className="pdf-sub">{s.title}</p>
          {s.paragraphs.map((x) => <p key={x}>{x}</p>)}
          {s.bullets && s.bullets.length > 0 && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
        </Block>
      ))}
      </>)}

{has("yogas-doshas") && (<>
      <Block breakBefore><H>Rajyogas and doshas</H>
        {p.yogas.map((y, i) => <p key={y.name + i}><strong>{y.name}:</strong> {y.text}</p>)}
        {p.yogas.length === 0 && <p>No classical yoga stands out.</p>}
      </Block>
      <Block>
        {p.doshas.map((d) => <p key={d.name}><strong>{d.name} ({d.severity}):</strong> {d.text}{d.cancellations.length ? ` Softened by: ${d.cancellations.join("; ")}.` : ""}</p>)}
        {p.doshas.length === 0 && <p>No major dosha.</p>}
      </Block>
      </>)}

{has("areas") && (<>
      <Block breakBefore><H>Life areas and timing</H></Block>
      {pAreas.map((a) => (
        <Block key={a.id}>
          <p className="pdf-sub">{a.title} — {a.rating}</p>
          <p>{a.summary}</p>
          <p className="pdf-small">{a.factors.join(" · ")}</p>
          {a.fields && <p className="pdf-small">Suited fields: {a.fields.join("; ")}</p>}
          {a.windows.length > 0 && <p className="pdf-small">{a.id === "health" ? "Periods to watch" : "Likely windows"}: {a.windows.map((w) => `${formatMonth(w.start)} – ${formatMonth(w.end)}${w.strength === "strong" ? " ★" : ""}`).join("; ")}</p>}
        </Block>
      ))}
      </>)}

{has("forecast") && (<>
      <Block breakBefore><H>The next five years</H></Block>
      {p.periods.map((x) => (
        <Block key={x.start.toISOString()}>
          <p className="pdf-sub">{x.maha}–{x.antar} · {formatMonth(x.start)} – {formatMonth(x.end)} · {x.rating}</p>
          <p>{x.themes} {x.advice}</p>
          {x.transits.length > 0 && <ul className="pdf-small">{x.transits.map((t) => <li key={t.planet + t.date.toISOString()}>{formatMonth(t.date)}: {t.planet} {t.retrograde ? "returns to" : "enters"} {t.sign} ({t.fromMoon} from Moon) — {t.text}</li>)}</ul>}
        </Block>
      ))}
      </>)}

{has("remedies") && (<>
      <Block breakBefore><H>Upay — remedy plan</H></Block>
      {p.remedies.map((r) => (
        <Block key={r.graha}>
          <p className="pdf-sub">{r.purpose === "pacify" ? "Pacify" : "Strengthen"} {r.graha} ({r.devanagari}) — priority {r.priority}</p>
          <p className="pdf-small">{r.reasons.join(" · ")}</p>
          <p className="pdf-deva">{r.mantra.devanagari}</p>
          <p className="pdf-small">{r.mantra.iast} — japa {r.japa.toLocaleString("en-IN")} · {r.day} · {r.vrat} · daan: {r.daan} · rudraksha: {r.rudraksha}{r.gem ? ` · gem: ${r.gem}` : ""}</p>
        </Block>
      ))}
      <Block><p className="pdf-sub">Daily practices</p><ul>{p.practices.map((x) => <li key={x}>{x}</li>)}</ul></Block>
      </>)}

{has("jaimini") && (<>
      <Block breakBefore><H>Jaimini</H>
        <ul>{j.points.map((x) => <li key={x}>{x}</li>)}</ul>
        {j.rajaYogas.length > 0 && <ul>{j.rajaYogas.map((x) => <li key={x}>{x}</li>)}</ul>}
        <p>Ishta devata: {j.ishtaDevata.devata} ({j.ishtaDevata.avatara}) — {j.ishtaDevata.reason}.</p>
        <p className="pdf-small">Arudhas: {j.arudhas.map((a) => `A${a.house} ${a.sign}`).join(" · ")}</p>
        <p className="pdf-small">Chara dasha: {j.charaDasha.slice(0, 12).map((c) => `${c.sign} ${c.start.getFullYear()}–${c.end.getFullYear()}`).join(" · ")}</p>
      </Block>
      </>)}

      {has("kp") && kp && (
        <Block breakBefore><H>KP (Krishnamurti Paddhati)</H>
          <table className="pdf-table">
            <thead><tr><th>Cusp</th><th>Sign</th><th>Star lord</th><th>Sub lord</th><th>Signifies</th></tr></thead>
            <tbody>{kp.cusps.map((c) => <tr key={c.house}><td>{c.house}</td><td>{c.signName} {formatDegrees(c.longitude % 30)}</td><td>{c.lords.star}</td><td>{c.lords.sub}</td><td>{(kp!.planetHouses[c.lords.sub] ?? []).join(", ")}</td></tr>)}</tbody>
          </table>
        </Block>
      )}

{has("lalkitab") && (<>
      <Block breakBefore><H>Lal Kitab</H>
        <table className="pdf-table">
          <thead><tr><th>Graha</th><th>House</th><th>Effect</th></tr></thead>
          <tbody>{lk.placements.map((x) => <tr key={x.planet}><td>{x.planet}{x.pakka ? " (pakka ghar)" : ""}</td><td>{x.house}</td><td>{x.effect}</td></tr>)}</tbody>
        </table>
      </Block>
      <Block>
        <p className="pdf-sub">Lal Kitab upay</p>
        <ul className="pdf-small">{lk.placements.filter((x) => x.remedies.length).map((x) => <li key={x.planet}><strong>{x.planet} in {x.house}:</strong> {x.remedies.join("; ")}</li>)}</ul>
        {lk.rinas.length > 0 && (<><p className="pdf-sub">Rin (ancestral debts)</p><ul className="pdf-small">{lk.rinas.map((r) => <li key={r.name}><strong>{r.name}:</strong> {r.reason} Remedy: {r.remedy}</li>)}</ul></>)}
        <p className="pdf-small">{lk.generalRules.join(" ")}</p>
      </Block>
      </>)}

{has("bnn") && (<>
      <Block breakBefore><H>Bhrigu Nandi Nadi</H>
        {[["The native (Jupiter)", bnn.native], ["Career (Saturn)", bnn.career], ...(bnn.spouse ? [["Spouse", bnn.spouse] as const] : [])].map(([t, b]) => (
          <div key={t as string}><p className="pdf-sub">{t as string} — {(b as typeof bnn.native).karaka} in {(b as typeof bnn.native).sign}</p><ul className="pdf-small">{(b as typeof bnn.native).lines.map((l) => <li key={l}>{l}</li>)}</ul></div>
        ))}
      </Block>
      </>)}

{has("numerology") && (<>
      <Block breakBefore><H>Numerology and Lo Shu</H>
        {num.name && <p>Name number {num.name.compound} → {num.name.root} ({num.name.planet}): {num.name.traits}.</p>}
        <p>Birth number {num.birth.number} ({num.birth.planet}): {num.birth.traits}. Destiny number {num.destiny.number} ({num.destiny.planet}): {num.destiny.traits}.</p>
        <div className="loshu">{LO_SHU_LAYOUT.flat().map((n) => <div key={n} className={`loshu-cell${ls.counts[n] ? "" : " empty"}`}><span className="loshu-digits">{ls.counts[n] ? String(n).repeat(ls.counts[n]) : "—"}</span><span className="loshu-n">{n}</span></div>)}</div>
        {ls.planes.length > 0 && <p className="pdf-small">Planes: {ls.planes.map((x) => `${x.name} — ${x.text}`).join("; ")}</p>}
        {ls.missing.length > 0 && <p className="pdf-small">Missing: {ls.missing.map((m) => `${m.n} (${m.planet}) — ${m.text}. ${m.remedy}`).join(" ")}</p>}
        <p className="pdf-small">Personal year {new Date().getFullYear()}: {py} — {PERSONAL_YEAR[py]}. Lucky planet days: {getGraha(num.birth.planet).day}, {getGraha(num.destiny.planet).day}.</p>
      </Block>
      </>)}

{has("life") && (<>
      <Block breakBefore><H>Your life so far — verify against your past</H><p className="pdf-small">Each dasha period since birth with your age. Where the chart&apos;s description matches what happened, the birth time is right; where it doesn&apos;t, use the Life tab to test your birth time against remembered events.</p></Block>
      {chapters.map((c) => (
        <Block key={c.start.toISOString()}>
          <p className="pdf-sub">Age {Math.floor(c.ageFrom)}–{Math.ceil(c.ageTo)} · {c.maha}–{c.antar} · {formatMonth(c.start)} – {formatMonth(c.end)} · {c.rating}</p>
          <p className="pdf-small">{c.themes}{c.markers.length ? ` ${c.markers.join("; ")}.` : ""}</p>
        </Block>
      ))}
      </>)}

      <Block><p className="pdf-small pdf-disclaimer">Jyotisha describes tendencies, not fate. This report applies classical rules mechanically; for major decisions consult an experienced jyotishi. Remedies are gentle practices of worship, japa and charity.</p></Block>
    </div>
  );
}

/** html2canvas renders SVG without the page's stylesheet, so copy computed styles onto the chart elements. */
function inlineSvgStyles(root: HTMLElement) {
  const view = root.ownerDocument.defaultView ?? window;
  root.querySelectorAll("svg *").forEach((el) => {
    const cs = view.getComputedStyle(el);
    for (const prop of ["fill", "stroke", "stroke-width", "font-size", "font-weight", "font-family"]) el.setAttribute(prop, cs.getPropertyValue(prop));
  });
}

/** Renders any report element (made of .pdf-block sections) into an A4 PDF on the device. */
export async function renderPdf(element: React.ReactElement, footer: string): Promise<Blob> {
  const [{ jsPDF }, html2canvas] = await Promise.all([import("jspdf"), import("html2canvas").then((m) => m.default)]);
  // Render inside a small isolated iframe: html2canvas clones the whole document for every capture, so a tiny
  // document keeps it fast.
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-12000px;top:0;width:860px;height:1200px;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write('<!doctype html><html data-theme="light"><head><meta charset="utf-8"></head><body style="margin:0;background:#fff"></body></html>');
  doc.close();
  for (const el of Array.from(document.querySelectorAll("style"))) doc.head.appendChild(el.cloneNode(true));
  const host = doc.createElement("div");
  host.style.width = "794px";
  doc.body.appendChild(host);
  const root = createRoot(host);
  root.render(element);
  await new Promise((r) => setTimeout(r, 500));
  await doc.fonts?.ready;
  inlineSvgStyles(host);

  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 32;
  const usableW = pageW - margin * 2;
  const SCALE = 1.6;
  const ptPerPx = usableW / 794;
  // Lay the blocks out into page-sized groups first, then capture once per page (each capture has a fixed cost).
  const pageHeightPx = (pageH - margin * 2) / ptPerPx;
  const blocks = Array.from(host.querySelectorAll<HTMLElement>(".pdf-block"));
  const groups: HTMLElement[][] = [];
  let current: HTMLElement[] = [];
  let used = 0;
  for (const b of blocks) {
    const h = b.offsetHeight;
    if (current.length && (b.classList.contains("page-break") || used + h > pageHeightPx)) {
      groups.push(current);
      current = [];
      used = 0;
    }
    current.push(b);
    used += h;
  }
  if (current.length) groups.push(current);
  const report = host.querySelector<HTMLElement>(".pdf-report")!;
  const pagesEl = groups.map((g) => {
    const page = doc.createElement("div");
    page.className = "pdf-report pdf-page";
    g.forEach((b) => page.appendChild(b));
    return page;
  });
  report.replaceWith(...pagesEl);

  let firstPage = true;
  for (const page of pagesEl) {
    const canvas = await html2canvas(page, { scale: SCALE, backgroundColor: "#ffffff", logging: false, width: 794, windowWidth: 794 });
    // A single block taller than a page is sliced across pages.
    const slicePx = Math.floor(pageHeightPx * SCALE);
    for (let offset = 0; offset < canvas.height; offset += slicePx) {
      if (!firstPage) pdf.addPage();
      firstPage = false;
      const h = Math.min(slicePx, canvas.height - offset);
      const piece = doc.createElement("canvas");
      piece.width = canvas.width;
      piece.height = h;
      piece.getContext("2d")!.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);
      pdf.addImage(piece.toDataURL("image/jpeg", 0.82), "JPEG", margin, margin, usableW, (h / SCALE) * ptPerPx);
    }
  }
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(140);
    pdf.text(footer, margin, pageH - 14);
    pdf.text(`${i} / ${pages}`, pageW - margin, pageH - 14, { align: "right" });
  }
  // The blocks were moved into page wrappers, so React's tree no longer matches the DOM: drop the frame and let the
  // root be collected rather than unmounting it.
  frame.remove();
  void root;
  return pdf.output("blob");
}

/** Builds one kundli report (the free basic one or a purchased one) as a PDF. */
export function buildKundliPdf(kundli: Kundli, name: string | undefined, birth: BirthInfo, reportId = "complete"): Promise<Blob> {
  const report = getReport(reportId) ?? FREE_REPORT;
  return renderPdf(<Report kundli={kundli} name={name} birth={birth} report={report} />, `Brahman — ${report.title}${name ? ` · ${name}` : ""}`);
}

export const reportFilename = (title: string, name: string | undefined, date: string) =>
  `${title.replace(/[^\p{L}\p{N}]+/gu, "-")}-${(name || "native").replace(/[^\p{L}\p{N}]+/gu, "-")}-${date}.pdf`;

export async function saveFile(blob: Blob, filename: string): Promise<void> {
  const w = window as unknown as { claude?: { use?: (n: string) => Promise<{ save: (r: { filename: string; data: Blob }) => Promise<unknown> } | null> } };
  if (typeof w.claude?.use === "function") {
    const downloads = await w.claude.use("downloads");
    if (downloads) {
      await downloads.save({ filename, data: blob });
      return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** "Download free basic kundli" — the free PDF; detailed reports are bought from the report store. */
export function KundliPdfButton({ kundli, name, birth, reportId = FREE_REPORT.id, label }: { kundli: Kundli; name?: string; birth: BirthInfo; reportId?: string; label?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const go = async () => {
    setState("busy");
    setError("");
    try {
      const blob = await buildKundliPdf(kundli, name, birth, reportId);
      await saveFile(blob, reportFilename((getReport(reportId) ?? FREE_REPORT).title, name, birth.date));
      setState("done");
    } catch (e) {
      const err = e as { code?: string; message?: string };
      setState(err.code === "declined" ? "idle" : "error");
      if (err.code !== "declined") setError(err.message ?? "Could not create the PDF.");
    }
  };
  return (
    <span className="pdf-button">
      <button type="button" className="btn" onClick={go} disabled={state === "busy"}>
        {state === "busy" ? "Preparing your report (up to 20 seconds)…" : label ?? "⬇ Free basic kundli PDF"}
      </button>
      {state === "done" && <span className="good"> ✓ Report ready</span>}
      {state === "error" && <span className="bad"> {error}</span>}
    </span>
  );
}
