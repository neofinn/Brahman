// The native's life so far, read from the chart — so it can be matched against what really happened — and birth-time
// rectification from remembered events, which sharpens every future prediction.
import { computeKundli, type Kundli, type Observer } from "./jyotish.ts";
import { sadeSati } from "./reading.ts";
import { dashaAt, doubleTransit, periodsBetween, significators, type Period } from "./predictions.ts";

const YEAR_MS = 365.2425 * 86400000;

export type LifeEventType = "marriage" | "child" | "career" | "education" | "foreign" | "property" | "father" | "mother" | "health" | "setback";

export const LIFE_EVENTS: Record<LifeEventType, { title: string; houses: number[]; karakas: string[] }> = {
  marriage: { title: "Marriage or engagement", houses: [7, 2, 11], karakas: ["Venus", "Jupiter"] },
  child: { title: "Birth of a child", houses: [5, 9, 11], karakas: ["Jupiter"] },
  career: { title: "First job, promotion or business start", houses: [10, 6, 11], karakas: ["Sun", "Saturn"] },
  education: { title: "Graduation or higher studies", houses: [4, 5, 9], karakas: ["Mercury", "Jupiter"] },
  foreign: { title: "Going or settling abroad", houses: [12, 9, 3], karakas: ["Rahu"] },
  property: { title: "Buying a house, land or vehicle", houses: [4, 11], karakas: ["Mars", "Venus"] },
  father: { title: "Father's serious illness or passing", houses: [9, 10, 4], karakas: ["Sun"] },
  mother: { title: "Mother's serious illness or passing", houses: [4, 11, 10], karakas: ["Moon"] },
  health: { title: "Major illness, surgery or accident", houses: [6, 8, 1, 12], karakas: ["Mars", "Saturn"] },
  setback: { title: "Major loss, job loss or legal trouble", houses: [8, 12, 6], karakas: ["Saturn", "Rahu"] },
};

export interface LifeEvent {
  type: LifeEventType;
  date: string; // YYYY-MM or YYYY-MM-DD
}

export interface PastChapter extends Period {
  ageFrom: number;
  ageTo: number;
  markers: string[];
}

/** Every antardasha from birth until now, with the native's age, what it promised, and the big transits within it. */
export function pastChapters(k: Kundli, birth: Date, now = new Date()): PastChapter[] {
  const age = (d: Date) => Math.max(0, (d.getTime() - birth.getTime()) / YEAR_MS);
  const moon = k.grahas.find((g) => g.name === "Moon")!.rashi.index;
  // Sade Sati windows from birth, found by stepping forward one window at a time.
  const sadeSatis: { start: Date; end: Date }[] = [];
  let probe = birth;
  for (let i = 0; i < 4 && probe < now; i++) {
    const ss = sadeSati(moon, probe);
    if (!ss || ss.start > now) break;
    if (!sadeSatis.some((s) => Math.abs(s.start.getTime() - ss.start.getTime()) < YEAR_MS)) sadeSatis.push({ start: ss.start, end: ss.end });
    probe = new Date(ss.end.getTime() + 30 * 86400000);
  }
  return periodsBetween(k, birth, now).map((p) => {
    const markers: string[] = [];
    for (const ss of sadeSatis) if (ss.start < p.end && ss.end > p.start) markers.push("Shani Sade Sati ran in this period — pressure, responsibility and maturing");
    for (const ret of [12, 24, 36, 48, 60, 72]) {
      const t = birth.getTime() + ret * 0.9886 * YEAR_MS; // Jupiter's 11.86-year cycle
      if (t >= p.start.getTime() && t < p.end.getTime()) markers.push(`Jupiter return around age ${Math.round(ret * 0.9886)} — a new cycle of growth`);
    }
    for (const ret of [29.5, 59]) {
      const t = birth.getTime() + ret * YEAR_MS;
      if (t >= p.start.getTime() && t < p.end.getTime()) markers.push(`Saturn return around age ${Math.round(ret)} — a turning point of maturity and responsibility`);
    }
    return { ...p, ageFrom: Math.round(age(p.start) * 10) / 10, ageTo: Math.round(age(p.end) * 10) / 10, markers };
  });
}

const eventDate = (d: string) => new Date(`${d.length === 7 ? `${d}-15` : d}T12:00:00Z`);

export interface EventMatch {
  event: LifeEvent;
  maha: string;
  antar: string;
  score: number;
  why: string[];
}

/** How well one chart explains one remembered event: the dasha lords' link to its houses and the double transit. */
export function matchEvent(k: Kundli, e: LifeEvent): EventMatch | null {
  const def = LIFE_EVENTS[e.type];
  const at = eventDate(e.date);
  const d = dashaAt(k, at);
  if (!d) return null;
  const sig = significators(k, def.houses, def.karakas);
  const why: string[] = [];
  let score = 0;
  if (sig.has(d.maha)) {
    score += 1;
    why.push(`${d.maha} mahadasha is linked to the ${def.houses[0]}th house matters`);
  }
  if (sig.has(d.antar)) {
    score += 1.5;
    why.push(`${d.antar} antardasha is linked to them`);
  }
  if (doubleTransit(k, def.houses[0], at)) {
    score += 1;
    why.push(`Jupiter and Saturn both touched the ${def.houses[0]}th house`);
  }
  return { event: e, maha: d.maha, antar: d.antar, score, why };
}

export interface Rectification {
  given: { score: number; matches: EventMatch[] };
  candidates: { offsetMinutes: number; time: string; lagna: string; score: number }[];
  advice: string;
}

/**
 * Birth-time rectification: tries times up to ±`range` minutes around the recorded time and scores how well each
 * chart's dashas and transits explain the remembered events. `birthLocal` is HH:MM; `toUtc` converts a local time.
 */
export function rectify(birthLocal: string, toUtc: (hhmm: string) => Date, observer: Observer, events: LifeEvent[], range = 90, step = 6): Rectification {
  const [h, m] = birthLocal.split(":").map(Number);
  const scoreFor = (k: Kundli) => {
    const matches = events.map((e) => matchEvent(k, e)).filter((x): x is EventMatch => Boolean(x));
    return { score: matches.reduce((a, b) => a + b.score, 0), matches };
  };
  const candidates: Rectification["candidates"] = [];
  for (let off = -range; off <= range; off += step) {
    const mins = (((h * 60 + m + off) % 1440) + 1440) % 1440;
    const time = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    const k = computeKundli(toUtc(time), observer);
    candidates.push({ offsetMinutes: off, time, lagna: k.lagna.rashi.name, score: Math.round(scoreFor(k).score * 10) / 10 });
  }
  const given = scoreFor(computeKundli(toUtc(birthLocal), observer));
  candidates.sort((a, b) => b.score - a.score || Math.abs(a.offsetMinutes) - Math.abs(b.offsetMinutes));
  const best = candidates[0];
  const max = events.length * 3.5;
  const advice = !events.length
    ? "Add a few dated life events to check the birth time."
    : best.score <= given.score + 0.5
      ? `The recorded time explains your events well (${Math.round((given.score / max) * 100)}% fit). Future predictions can rely on it.`
      : `A birth time near ${best.time} (lagna ${best.lagna}) explains your events better (${Math.round((best.score / max) * 100)}% fit against ${Math.round((given.score / max) * 100)}%). If your recorded time is approximate, consider recomputing the kundli with ${best.time}.`;
  return { given: { score: Math.round(given.score * 10) / 10, matches: given.matches }, candidates: candidates.slice(0, 5), advice };
}
