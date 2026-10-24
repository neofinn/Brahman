// "Your life guide": the confluence of the chart turned into plain answers a native can use — what this time of life
// is about, when the first job, marriage and children are likely, the best career, when to take special care of
// relationships, health, money and reputation, and good times to invest, buy a house or take a loan.
import { type Kundli } from "./jyotish.ts";
import { SIGN_LORDS } from "./reading.ts";
import { charaKarakas, vargaChart } from "./vargas.ts";
import { dashaAt, doubleTransit, formatMonth, significators, transitHouse, type Prediction } from "./predictions.ts";
import { personalYear, PERSONAL_YEAR } from "./loshu.ts";

const YEAR_MS = 365.2425 * 86400000;
const MONTH_MS = YEAR_MS / 12;

export interface Window {
  from: Date;
  to: Date;
  peak: number;
}

export interface GuideAnswer {
  id: string;
  question: string;
  answer: string;
  windows: { from: Date; to: Date; text: string }[];
  why: string;
  tip: string;
  kind: "opportunity" | "care";
}

export interface LifeGuide {
  now: string[];
  career: { fields: string[]; text: string };
  answers: GuideAnswer[];
}

const CAREER_TEXT: Record<string, string> = {
  Sun: "government service, administration, politics, medicine or any leadership role",
  Moon: "hospitality, food, nursing and healthcare, travel, public relations or anything dealing with the public",
  Mars: "engineering, defence or police, surgery, sports, real estate or technical trades",
  Mercury: "business and trade, accounting and finance, IT and software, writing, media or teaching languages",
  Jupiter: "teaching, law, banking and finance, consulting, counselling or religious and charitable work",
  Venus: "arts, design, fashion, film and media, beauty, hospitality or luxury goods",
  Saturn: "industry and manufacturing, mining, oil, construction, law and justice, or long-term service in large organisations",
  Rahu: "technology, foreign companies, aviation, research, politics or unconventional new fields",
  Ketu: "research, programming, healing, spiritual work or highly specialised technical skills",
};

interface Rule {
  houses: number[];
  karakas: string[];
  /** Dasha lords ruling these houses weaken the result (or, for care rules, are the risk itself). */
  against?: number[];
  transit?: (k: Kundli, at: Date) => number;
  doubleOn?: number;
}

function lordOf(k: Kundli, h: number) {
  return SIGN_LORDS[(k.lagna.rashi.index + h - 1) % 12];
}

function score(k: Kundli, rule: Rule, at: Date): number {
  const d = dashaAt(k, at);
  if (!d) return 0;
  const sig = significators(k, rule.houses, rule.karakas);
  const against = new Set((rule.against ?? []).map((h) => lordOf(k, h)));
  let s = (sig.has(d.maha) ? 1 : 0) + (sig.has(d.antar) ? 1.5 : 0);
  if (against.has(d.antar) && !sig.has(d.antar)) s -= 1;
  if (against.has(d.maha) && !sig.has(d.maha)) s -= 0.5;
  if (rule.doubleOn && doubleTransit(k, rule.doubleOn, at)) s += 1;
  if (rule.transit) s += rule.transit(k, at);
  return s;
}

/** Months where the score reaches `threshold`, merged into windows (gaps of a month bridged, under 2 months dropped). */
function scan(k: Kundli, rule: Rule, from: Date, to: Date, threshold: number): Window[] {
  const out: Window[] = [];
  let cur: Window | null = null;
  let miss = 0;
  for (let t = from.getTime(); t <= to.getTime(); t += MONTH_MS) {
    const s = score(k, rule, new Date(t));
    if (s >= threshold) {
      if (cur) {
        cur.to = new Date(t + MONTH_MS);
        cur.peak = Math.max(cur.peak, s);
      } else cur = { from: new Date(t), to: new Date(t + MONTH_MS), peak: s };
      miss = 0;
    } else if (cur && ++miss > 1) {
      out.push(cur);
      cur = null;
      miss = 0;
    }
  }
  if (cur) out.push(cur);
  return out.filter((w) => w.to.getTime() - w.from.getTime() >= 2 * MONTH_MS - 1);
}

/** Scan at the strictest threshold that finds something: strong first, then moderate. */
function adaptive(k: Kundli, rule: Rule, from: Date, to: Date, levels = [3, 2.5, 2, 1.5]): Window[] {
  for (const t of levels) {
    const ws = scan(k, rule, from, to, t);
    if (ws.length) return ws;
  }
  return [];
}

const overlap = (a: Window, b: Window) => Math.max(0, Math.min(a.to.getTime(), b.to.getTime()) - Math.max(a.from.getTime(), b.from.getTime()));
/** Drop opportunity windows that mostly fall inside care windows, so the guide never says "invest" and "be careful" at once. */
const outside = (ws: Window[], care: Window[]) => ws.filter((w) => care.reduce((s, c) => s + overlap(w, c), 0) < 0.5 * (w.to.getTime() - w.from.getTime()));

/** Care rules: the risk is high when a dasha lord is a lord of the given difficult houses or a malefic tied to the area. */
function careRule(k: Kundli, area: number[], difficult: number[], transit: (k: Kundli, at: Date) => number): Rule {
  const lords = difficult.map((h) => lordOf(k, h));
  const malefics = ["Saturn", "Rahu", "Ketu", "Mars"].filter((p) => {
    const g = k.grahas.find((x) => x.name === p)!;
    return area.includes(g.house) || area.some((h) => lordOf(k, h) === p);
  });
  return { houses: [], karakas: [...new Set([...lords, ...malefics])], transit };
}

export function lifeGuide(k: Kundli, prediction: Prediction, birth: Date, birthDate: string, now = new Date()): LifeGuide {
  const age = (d: Date) => Math.floor((d.getTime() - birth.getTime()) / YEAR_MS);
  const at = (years: number) => new Date(birth.getTime() + years * YEAR_MS);
  const nowAge = age(now);
  const span = (w: Window) => `${formatMonth(w.from)} – ${formatMonth(w.to)} (age ${age(w.from)}${age(w.to) !== age(w.from) ? `–${age(w.to)}` : ""})`;
  const answers: GuideAnswer[] = [];
  const later = (y: number) => new Date(now.getTime() + y * YEAR_MS);
  const top = (ws: Window[], n: number) => [...ws].sort((a, b) => b.peak - a.peak).slice(0, n).sort((a, b) => a.from.getTime() - b.from.getTime());

  // --- Right now ----------------------------------------------------------------------
  const nowLines: string[] = [];
  const cur = prediction.current;
  if (cur) {
    const mood = cur.rating === "excellent" ? "one of the best phases of your life" : cur.rating === "favourable" ? "a good, growing phase" : cur.rating === "mixed" ? "a phase of mixed results, where effort decides the outcome" : "a testing phase that asks for patience";
    nowLines.push(`You are now in ${mood}, which lasts until ${formatMonth(cur.end)} (you are ${nowAge}). ${cur.themes}`);
    nowLines.push(cur.advice);
  }
  for (const t of prediction.transitsNow) if (t.effect !== "mixed") nowLines.push(`${t.planet}: ${t.text}`);
  const py = personalYear(birthDate, now.getFullYear());
  nowLines.push(`In numerology, ${now.getFullYear()} is your personal year ${py}: ${PERSONAL_YEAR[py]}.`);
  const next = prediction.periods.find((p) => p.start > now);
  if (next) nowLines.push(`From ${formatMonth(next.start)} the next phase (${next.maha}–${next.antar}) is ${next.rating === "excellent" || next.rating === "favourable" ? "more favourable" : next.rating === "mixed" ? "mixed" : "more demanding"}: ${next.themes}`);

  // --- Career ---------------------------------------------------------------------------
  const karakas = charaKarakas(k);
  const amk = karakas[1].graha;
  const tenthLord = lordOf(k, 10);
  const inTenth = k.grahas.filter((g) => g.house === 10).map((g) => g.name);
  const d10 = vargaChart(k, "D10");
  const d10Lord = SIGN_LORDS[d10.lagna];
  const careerPlanets = [...new Set([tenthLord, ...inTenth, amk, d10Lord])].slice(0, 3);
  const career = {
    fields: careerPlanets.map((p) => CAREER_TEXT[p]),
    text: `Your 10th house lord is ${tenthLord}${inTenth.length ? `, with ${inTenth.join(", ")} in the 10th house` : ""}; your career significator (amatyakaraka) is ${amk}; your career chart (D10) rises in ${d10.varga.name === "Dashamsha" ? ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"][d10.lagna] : ""} ruled by ${d10Lord}. Together they point to: ${careerPlanets.map((p) => CAREER_TEXT[p]).join("; or ")}.`,
  };

  const careerRule: Rule = { houses: [10, 6, 2, 11], karakas: ["Sun", "Saturn", amk], against: [8, 12], doubleOn: 10 };
  const firstJob = adaptive(k, careerRule, at(18), at(35))[0];
  if (firstJob) {
    const past = firstJob.to < now;
    answers.push({
      id: "first-job", question: "When will I get my first job or start earning?", kind: "opportunity",
      answer: past ? `Your chart shows the start of earning around ${span(firstJob)}. If your first job came then, your birth time is confirmed and the timings below can be trusted.` : `Your first job is most likely around ${span(firstJob)}. Apply widely and network during this window.`,
      windows: [{ from: firstJob.from, to: firstJob.to, text: span(firstJob) }],
      why: "The dasha of planets linked to your 10th (career) and 6th (service) houses runs, while Jupiter and Saturn together activate your 10th house.",
      tip: "Start serious preparation a year before the window — the chart opens doors, effort walks through them.",
    });
  }
  const promotions = top(adaptive(k, { ...careerRule, transit: (kk, d) => ([10, 11, 1].includes(transitHouse(kk, "Jupiter", d)) ? 0.5 : 0) }, now, later(10)), 4);
  answers.push({
    id: "career-rise", question: "When will my career rise — promotion, a better job or business growth?", kind: "opportunity",
    answer: promotions.length ? `The strongest periods for career growth in the next ten years are ${promotions.map(span).join("; ")}.` : "No single standout window in the next ten years — growth comes steadily through skill and persistence.",
    windows: promotions.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Career-house dashas combine with Jupiter's support to your 10th and 11th houses.",
    tip: "Ask for the promotion, change jobs or launch the business inside these windows; avoid quitting in the gaps.",
  });

  // --- Relationships --------------------------------------------------------------------
  if (nowAge < 45) {
    const marriage = top(adaptive(k, { houses: [7, 2, 11], karakas: ["Venus", "Jupiter"], against: [6, 8, 12], doubleOn: 7 }, new Date(Math.max(now.getTime(), at(21).getTime())), at(40)), 3);
    answers.push({
      id: "marriage", question: "When will I get married?", kind: "opportunity",
      answer: marriage.length ? `Marriage is most strongly indicated around ${marriage.map(span).join("; ")}.` : "No strong marriage window shows before 40 — kundli matching and remedies (Gauri–Shankar worship, Thursday fasting) are advised.",
      windows: marriage.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
      why: "Dashas of planets tied to your 7th house of marriage, with Jupiter and Saturn together activating the 7th.",
      tip: "Already married? These windows bring an engagement, a new phase or renewal in the relationship instead.",
    });
  }
  const heartRule = careRule(k, [5, 7], [6, 8, 12], (kk, d) => ([5, 7].includes(transitHouse(kk, "Saturn", d)) ? 1 : 0) + ([5, 7].includes(transitHouse(kk, "Rahu", d)) ? 0.5 : 0));
  const heartAll = scan(k, heartRule, at(16), later(10), 2.5);
  const heartPast = heartAll.filter((w) => w.to < now).slice(-3);
  const heartAhead = top(heartAll.filter((w) => w.to >= now), 3);
  answers.push({
    id: "heartbreak", question: "When can I face heartbreak or relationship trouble?", kind: "care",
    answer: `${heartPast.length ? `Looking back, relationship stress was likely around ${heartPast.map(span).join("; ")} — check whether this matches your life. ` : ""}${heartAhead.length ? `Ahead, take extra care of love and marriage around ${heartAhead.map(span).join("; ")}.` : "No strong relationship-stress period shows ahead."}`,
    windows: [...heartPast, ...heartAhead].map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Dashas of the lords of difficult houses (6, 8, 12) or malefics tied to your 5th (love) and 7th (partner) houses, and Saturn or Rahu passing over them.",
    tip: "In these periods avoid ego clashes and hasty breakups; speak calmly, give space, and worship Shiva–Parvati on Mondays.",
  });

  // --- Care: health, wealth, status -----------------------------------------------------
  const health = top(scan(k, careRule(k, [1, 6, 8], [6, 8, 12], (kk, d) => ([1, 8].includes(transitHouse(kk, "Saturn", d)) ? 1 : 0) + (transitHouse(kk, "Rahu", d) === 1 ? 0.5 : 0)), now, later(10), 2.5), 4);
  answers.push({
    id: "health", question: "When should I take special care of my health?", kind: "care",
    answer: health.length ? `Take extra care of health around ${health.map(span).join("; ")}. Get regular check-ups then and avoid risks.` : "No major health warning period shows in the next ten years — keep up a healthy routine.",
    windows: health.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Dashas of the 6th (disease), 8th (sudden events) and 12th (hospital) lords, with Saturn over your Moon or its 8th.",
    tip: "Mahamrityunjaya japa, a disciplined routine and timely medical advice protect you best.",
  });
  const wealthAll = scan(k, careRule(k, [2, 11], [8, 12], (kk, d) => ([12, 2, 8].includes(transitHouse(kk, "Saturn", d)) ? 1 : 0) + ([2, 8].includes(transitHouse(kk, "Rahu", d)) ? 0.5 : 0)), now, later(10), 2.5);
  const wealthCare = top(wealthAll, 3);
  answers.push({
    id: "wealth-care", question: "When should I be careful with money?", kind: "care",
    answer: wealthCare.length ? `Be careful with money, lending and speculation around ${wealthCare.map(span).join("; ")}.` : "No major money-loss period shows in the next ten years.",
    windows: wealthCare.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Dashas of the 8th and 12th lords (losses and expenses), with Saturn or Rahu over your 2nd, 8th or 12th from the Moon.",
    tip: "Keep an emergency fund, avoid guarantees and loans to others, and donate a little regularly.",
  });
  const statusCare = top(scan(k, careRule(k, [10, 1], [6, 8, 12], (kk, d) => ([10, 1].includes(transitHouse(kk, "Saturn", d)) ? 1 : 0) + ([10, 1].includes(transitHouse(kk, "Rahu", d)) ? 0.5 : 0)), now, later(10), 2.5), 3);
  answers.push({
    id: "status-care", question: "When should I protect my reputation and social status?", kind: "care",
    answer: statusCare.length ? `Guard your reputation, avoid conflicts with seniors and stay clear of controversy around ${statusCare.map(span).join("; ")}.` : "No major threat to reputation shows in the next ten years.",
    windows: statusCare.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Dashas of difficult-house lords tied to your 10th (status) and 1st (self), with Saturn or Rahu over them.",
    tip: "Keep promises, document agreements, and serve elders — the classical protection of reputation.",
  });

  // --- Good times: investment, house, loan, children ------------------------------------
  const investRule: Rule = { houses: [2, 5, 11], karakas: ["Jupiter"], against: [8, 12], transit: (kk, d) => ([2, 5, 9, 11].includes(transitHouse(kk, "Jupiter", d)) ? 1 : 0) - ([8, 12].includes(transitHouse(kk, "Saturn", d)) ? 1 : 0) };
  const invest = top(outside(adaptive(k, investRule, now, later(10)), wealthAll), 4);
  answers.push({
    id: "investment", question: "Which time is good for investment?", kind: "opportunity",
    answer: invest.length ? `The best periods to invest are ${invest.map(span).join("; ")}.` : "No standout investment window — invest steadily and avoid speculation.",
    windows: invest.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Dashas of your 2nd (savings), 5th (speculation) and 11th (gains) lords, with Jupiter favourable from your Moon and Saturn not in the 8th or 12th.",
    tip: "Long-term investments made in these windows grow best; avoid risky bets outside them.",
  });
  const house = top(adaptive(k, { houses: [4, 11], karakas: ["Mars", "Venus"], against: [8, 12], doubleOn: 4 }, now, later(10)), 3);
  answers.push({
    id: "house", question: "When is a good time to buy a house, land or vehicle?", kind: "opportunity",
    answer: house.length ? `Buying property is best around ${house.map(span).join("; ")}.` : "No strong property window in the next ten years — buy when finances allow, on a good muhurta.",
    windows: house.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Dashas of your 4th (home) and 11th (gains) lords and Mars (land) or Venus (comforts), with Jupiter and Saturn together on your 4th house.",
    tip: "Use the muhurta finder for the registry and griha pravesh dates within these windows.",
  });
  const loan = top(adaptive(k, { houses: [6, 11], karakas: [], against: [8, 12], transit: (kk, d) => (transitHouse(kk, "Saturn", d) === 12 ? -1 : 0) }, now, later(10), [2.5, 2, 1.5]), 3);
  answers.push({
    id: "loan", question: "When is a good time to take a loan?", kind: "opportunity",
    answer: loan.length ? `Loans taken around ${loan.map(span).join("; ")} are easier to get and to repay.` : "No clear loan window — borrow only what your income can repay.",
    windows: loan.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "In jyotisha the 6th house governs loans and the 11th their repayment; their dashas, free of the 8th and 12th lords, favour borrowing.",
    tip: "Avoid taking loans in Saturn's 12th-from-Moon phase, and start repaying early in an 11th-lord period.",
  });
  if (nowAge < 48) {
    const kids = top(adaptive(k, { houses: [5, 9, 11], karakas: ["Jupiter"], against: [6, 8, 12], doubleOn: 5 }, new Date(Math.max(now.getTime(), at(22).getTime())), at(45)), 3);
    answers.push({
      id: "children", question: "When is a good time to have children?", kind: "opportunity",
      answer: kids.length ? `Childbirth is most strongly indicated around ${kids.map(span).join("; ")}.` : "No strong window shows — Santan Gopal mantra and Jupiter worship are the classical remedies.",
      windows: kids.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
      why: "Dashas of your 5th (children) and 9th lords and Jupiter, with Jupiter and Saturn together on your 5th house.",
      tip: "Plan conception in these windows, with medical guidance; Jupiter worship on Thursdays supports it.",
    });
  }
  const abroad = top(adaptive(k, { houses: [12, 9, 3], karakas: ["Rahu"], doubleOn: 12 }, now, later(10)), 3);
  answers.push({
    id: "abroad", question: "When can I travel or settle abroad?", kind: "opportunity",
    answer: abroad.length ? `Foreign travel or settlement is most likely around ${abroad.map(span).join("; ")}.` : "No strong foreign-settlement window in the next ten years; short trips remain possible.",
    windows: abroad.map((w) => ({ from: w.from, to: w.to, text: span(w) })),
    why: "Dashas of your 12th (foreign lands), 9th (long journeys) and 3rd lords or Rahu, with Jupiter and Saturn on your 12th.",
    tip: "File visas and job applications inside these windows.",
  });

  return { now: nowLines, career, answers };
}
