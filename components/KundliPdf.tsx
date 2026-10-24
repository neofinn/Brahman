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
import type { BirthInfo } from "./KundliReport";

const ABBR: Record<string, string> = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };

/** The full printable report: every system, the predictions, the life so far and the final observations. */
function Report({ kundli, name, birth }: { kundli: Kundli; name?: string; birth: BirthInfo }) {
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
  const areas = confluence(kundli, p, kp, { pakka: PAKKA_GHAR });
  const present = presentConfluence(kundli, p, j, birth.date);
  const d9 = vargaChart(kundli, "D9");
  const moon = kundli.grahas[1];
  const py = personalYear(birth.date, new Date().getFullYear());
  const d1Planets = kundli.grahas.map((g) => ({ label: `${ABBR[g.name]} ${Math.floor(g.rashi.degree)}°`, sign: g.rashi.index }));
  const d9Planets = d9.positions.map((x) => ({ label: ABBR[x.name], sign: x.sign }));

  const Block = ({ children, breakBefore }: { children: React.ReactNode; breakBefore?: boolean }) => <div className={`pdf-block${breakBefore ? " page-break" : ""}`}>{children}</div>;
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="pdf-h">{children}</h2>;

  return (
    <div className="pdf-report">
      <Block>
        <div className="pdf-cover">
          <div className="pdf-om">ॐ</div>
          <h1>Janma Kundli Report</h1>
          <p className="pdf-name">{name || "Native"}</p>
          <p>{formatDate(birthUtc, birth.place.timeZone)}, {birth.time} · {birth.place.name}({birth.place.latitude.toFixed(2)}°, {birth.place.longitude.toFixed(2)}°, {birth.place.timeZone})</p>
          <p>Lagna <strong>{kundli.lagna.rashi.name}</strong> {formatDegrees(kundli.lagna.rashi.degree)} · Rashi <strong>{moon.rashi.name}</strong> · Nakshatra <strong>{moon.nakshatra.name}</strong> pada {moon.nakshatra.pada}</p>
          <p className="pdf-small">Prepared by Brahman on {formatDate(new Date())}. Lahiri ayanamsa {formatDegrees(kundli.ayanamsa)}; whole-sign houses (KP: Placidus with Krishnamurti ayanamsa). Systems: Parashari (BPHS), Jaimini, KP, Lal Kitab, Bhrigu Nandi Nadi, Chaldean numerology and Lo Shu.</p>
        </div>
      </Block>

      <Block>
        <H>Birth charts</H>
        <div className="pdf-two">
          <div><NorthChart lagna={kundli.lagna.rashi.index} planets={d1Planets} title="D1 Rashi" subtitle={name} /><p className="pdf-cap">D1 Rashi chart</p></div>
          <div><NorthChart lagna={d9.lagna} planets={d9Planets} title="D9 Navamsha" /><p className="pdf-cap">D9 Navamsha chart</p></div>
        </div>
      </Block>

      <Block>
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

      <Block breakBefore><H>Final observations — confluence of all techniques</H>
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

      <Block breakBefore><H>Parashari reading (Brihat Parashara Hora Shastra)</H><p>{reading.summary}</p></Block>
      {reading.sections.map((s) => (
        <Block key={s.title}>
          <p className="pdf-sub">{s.title}</p>
          {s.paragraphs.map((x) => <p key={x}>{x}</p>)}
          {s.bullets && s.bullets.length > 0 && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
        </Block>
      ))}

      <Block breakBefore><H>Rajyogas and doshas</H>
        {p.yogas.map((y, i) => <p key={y.name + i}><strong>{y.name}:</strong> {y.text}</p>)}
        {p.yogas.length === 0 && <p>No classical yoga stands out.</p>}
      </Block>
      <Block>
        {p.doshas.map((d) => <p key={d.name}><strong>{d.name} ({d.severity}):</strong> {d.text}{d.cancellations.length ? ` Softened by: ${d.cancellations.join("; ")}.` : ""}</p>)}
        {p.doshas.length === 0 && <p>No major dosha.</p>}
      </Block>

      <Block breakBefore><H>Life areas and timing</H></Block>
      {p.areas.map((a) => (
        <Block key={a.id}>
          <p className="pdf-sub">{a.title} — {a.rating}</p>
          <p>{a.summary}</p>
          <p className="pdf-small">{a.factors.join(" · ")}</p>
          {a.fields && <p className="pdf-small">Suited fields: {a.fields.join("; ")}</p>}
          {a.windows.length > 0 && <p className="pdf-small">{a.id === "health" ? "Periods to watch" : "Likely windows"}: {a.windows.map((w) => `${formatMonth(w.start)} – ${formatMonth(w.end)}${w.strength === "strong" ? " ★" : ""}`).join("; ")}</p>}
        </Block>
      ))}

      <Block breakBefore><H>The next five years</H></Block>
      {p.periods.map((x) => (
        <Block key={x.start.toISOString()}>
          <p className="pdf-sub">{x.maha}–{x.antar} · {formatMonth(x.start)} – {formatMonth(x.end)} · {x.rating}</p>
          <p>{x.themes} {x.advice}</p>
          {x.transits.length > 0 && <ul className="pdf-small">{x.transits.map((t) => <li key={t.planet + t.date.toISOString()}>{formatMonth(t.date)}: {t.planet} {t.retrograde ? "returns to" : "enters"} {t.sign} ({t.fromMoon} from Moon) — {t.text}</li>)}</ul>}
        </Block>
      ))}

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

      <Block breakBefore><H>Jaimini</H>
        <ul>{j.points.map((x) => <li key={x}>{x}</li>)}</ul>
        {j.rajaYogas.length > 0 && <ul>{j.rajaYogas.map((x) => <li key={x}>{x}</li>)}</ul>}
        <p>Ishta devata: {j.ishtaDevata.devata} ({j.ishtaDevata.avatara}) — {j.ishtaDevata.reason}.</p>
        <p className="pdf-small">Arudhas: {j.arudhas.map((a) => `A${a.house} ${a.sign}`).join(" · ")}</p>
        <p className="pdf-small">Chara dasha: {j.charaDasha.slice(0, 12).map((c) => `${c.sign} ${c.start.getFullYear()}–${c.end.getFullYear()}`).join(" · ")}</p>
      </Block>

      {kp && (
        <Block breakBefore><H>KP (Krishnamurti Paddhati)</H>
          <table className="pdf-table">
            <thead><tr><th>Cusp</th><th>Sign</th><th>Star lord</th><th>Sub lord</th><th>Signifies</th></tr></thead>
            <tbody>{kp.cusps.map((c) => <tr key={c.house}><td>{c.house}</td><td>{c.signName} {formatDegrees(c.longitude % 30)}</td><td>{c.lords.star}</td><td>{c.lords.sub}</td><td>{(kp!.planetHouses[c.lords.sub] ?? []).join(", ")}</td></tr>)}</tbody>
          </table>
        </Block>
      )}

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

      <Block breakBefore><H>Bhrigu Nandi Nadi</H>
        {[["The native (Jupiter)", bnn.native], ["Career (Saturn)", bnn.career], ...(bnn.spouse ? [["Spouse", bnn.spouse] as const] : [])].map(([t, b]) => (
          <div key={t as string}><p className="pdf-sub">{t as string} — {(b as typeof bnn.native).karaka} in {(b as typeof bnn.native).sign}</p><ul className="pdf-small">{(b as typeof bnn.native).lines.map((l) => <li key={l}>{l}</li>)}</ul></div>
        ))}
      </Block>

      <Block breakBefore><H>Numerology and Lo Shu</H>
        {num.name && <p>Name number {num.name.compound} → {num.name.root} ({num.name.planet}): {num.name.traits}.</p>}
        <p>Birth number {num.birth.number} ({num.birth.planet}): {num.birth.traits}. Destiny number {num.destiny.number} ({num.destiny.planet}): {num.destiny.traits}.</p>
        <div className="loshu">{LO_SHU_LAYOUT.flat().map((n) => <div key={n} className={`loshu-cell${ls.counts[n] ? "" : " empty"}`}><span className="loshu-digits">{ls.counts[n] ? String(n).repeat(ls.counts[n]) : "—"}</span><span className="loshu-n">{n}</span></div>)}</div>
        {ls.planes.length > 0 && <p className="pdf-small">Planes: {ls.planes.map((x) => `${x.name} — ${x.text}`).join("; ")}</p>}
        {ls.missing.length > 0 && <p className="pdf-small">Missing: {ls.missing.map((m) => `${m.n} (${m.planet}) — ${m.text}. ${m.remedy}`).join(" ")}</p>}
        <p className="pdf-small">Personal year {new Date().getFullYear()}: {py} — {PERSONAL_YEAR[py]}. Lucky planet days: {getGraha(num.birth.planet).day}, {getGraha(num.destiny.planet).day}.</p>
      </Block>

      <Block breakBefore><H>Your life so far — verify against your past</H><p className="pdf-small">Each dasha period since birth with your age. Where the chart&apos;s description matches what happened, the birth time is right; where it doesn&apos;t, use the Life tab to test your birth time against remembered events.</p></Block>
      {chapters.map((c) => (
        <Block key={c.start.toISOString()}>
          <p className="pdf-sub">Age {Math.floor(c.ageFrom)}–{Math.ceil(c.ageTo)} · {c.maha}–{c.antar} · {formatMonth(c.start)} – {formatMonth(c.end)} · {c.rating}</p>
          <p className="pdf-small">{c.themes}{c.markers.length ? ` ${c.markers.join("; ")}.` : ""}</p>
        </Block>
      ))}

      <Block><p className="pdf-small pdf-disclaimer">Jyotisha describes tendencies, not fate. This report applies classical rules mechanically; for major decisions consult an experienced jyotishi. Remedies are gentle practices of worship, japa and charity.</p></Block>
    </div>
  );
}

/** html2canvas renders SVG without the page's stylesheet, so copy computed styles onto the chart elements. */
function inlineSvgStyles(root: HTMLElement) {
  root.querySelectorAll("svg *").forEach((el) => {
    const cs = getComputedStyle(el);
    for (const prop of ["fill", "stroke", "stroke-width", "font-size", "font-weight", "font-family"]) el.setAttribute(prop, cs.getPropertyValue(prop));
  });
}

async function buildPdf(kundli: Kundli, name: string | undefined, birth: BirthInfo): Promise<Blob> {
  const [{ jsPDF }, html2canvas] = await Promise.all([import("jspdf"), import("html2canvas").then((m) => m.default)]);
  const host = document.createElement("div");
  host.setAttribute("data-theme", "light");
  host.style.cssText = "position:fixed;left:-12000px;top:0;width:794px;";
  document.body.appendChild(host);
  const root = createRoot(host);
  root.render(<Report kundli={kundli} name={name} birth={birth} />);
  await new Promise((r) => setTimeout(r, 400));
  await document.fonts?.ready;
  inlineSvgStyles(host);

  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 32;
  const usableW = pageW - margin * 2;
  const SCALE = 1.6;
  const ptPerPx = usableW / 794;
  let y = margin;
  let firstOnPage = true;
  for (const block of Array.from(host.querySelectorAll<HTMLElement>(".pdf-block"))) {
    if (block.classList.contains("page-break") && !firstOnPage) {
      pdf.addPage();
      y = margin;
      firstOnPage = true;
    }
    const canvas = await html2canvas(block, { scale: SCALE, backgroundColor: "#ffffff", logging: false, width: 794, windowWidth: 794 });
    const pxH = canvas.height / SCALE;
    let hPt = pxH * ptPerPx;
    if (y + hPt > pageH - margin && hPt <= pageH - margin * 2) {
      pdf.addPage();
      y = margin;
    }
    if (hPt <= pageH - margin - y) {
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.82), "JPEG", margin, y, usableW, hPt);
      y += hPt + 6;
    } else {
      // Taller than a page: slice it.
      let offset = 0;
      while (offset < canvas.height) {
        const roomPt = pageH - margin - y;
        const slicePx = Math.min(canvas.height - offset, Math.floor((roomPt / ptPerPx) * SCALE));
        const piece = document.createElement("canvas");
        piece.width = canvas.width;
        piece.height = slicePx;
        piece.getContext("2d")!.drawImage(canvas, 0, offset, canvas.width, slicePx, 0, 0, canvas.width, slicePx);
        hPt = (slicePx / SCALE) * ptPerPx;
        pdf.addImage(piece.toDataURL("image/jpeg", 0.82), "JPEG", margin, y, usableW, hPt);
        offset += slicePx;
        if (offset < canvas.height) {
          pdf.addPage();
          y = margin;
        } else y += hPt + 6;
      }
    }
    firstOnPage = false;
  }
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(140);
    pdf.text(`Brahman — Janma Kundli Report${name ? ` · ${name}` : ""}`, margin, pageH - 14);
    pdf.text(`${i} / ${pages}`, pageW - margin, pageH - 14, { align: "right" });
  }
  root.unmount();
  host.remove();
  return pdf.output("blob");
}

async function saveFile(blob: Blob, filename: string): Promise<void> {
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

/** "Download PDF report" — builds the full report on the device. */
export function KundliPdfButton({ kundli, name, birth }: { kundli: Kundli; name?: string; birth: BirthInfo }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const go = async () => {
    setState("busy");
    setError("");
    try {
      const blob = await buildPdf(kundli, name, birth);
      await saveFile(blob, `Kundli-${(name || "report").replace(/[^\p{L}\p{N}]+/gu, "-")}-${birth.date}.pdf`);
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
        {state === "busy" ? "Preparing the report…" : "⬇ Download PDF report"}
      </button>
      {state === "done" && <span className="good"> ✓ Report ready</span>}
      {state === "error" && <span className="bad"> {error}</span>}
    </span>
  );
}
