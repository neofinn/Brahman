// Final observations: the confluence of every technique. Each life area and the present period are judged
// independently by Parashari rules, Jaimini, KP, Lal Kitab and numerology, and the verdicts are compared — where the
// systems agree, the indication is strong; where they differ, it is mixed.
import { type Kundli } from "./jyotish.ts";
import { dignity } from "./reading.ts";
import { charaKarakas } from "./vargas.ts";
import { type KpChart } from "./kp.ts";
import { type AreaId, type Prediction } from "./predictions.ts";
import { arudha, rashiAspects, type JaiminiReading } from "./jaimini.ts";
import { personalYear, PERSONAL_YEAR } from "./loshu.ts";

export type Vote = 1 | 0 | -1;

export interface SystemVote {
  system: "Parashari" | "Jaimini" | "KP" | "Lal Kitab" | "Numerology";
  vote: Vote;
  reason: string;
}

export interface AreaConfluence {
  id: AreaId;
  title: string;
  votes: SystemVote[];
  agreement: "strong promise" | "promise" | "mixed" | "needs care" | "strong caution";
  summary: string;
}

const BENEFICS = ["Jupiter", "Venus", "Mercury", "Moon"];
const MALEFICS = ["Saturn", "Mars", "Rahu", "Ketu", "Sun"];

// KP: the cusp whose sub lord decides the matter, the houses that promise it and the houses that deny it.
const KP_RULES: Record<AreaId, { cusp: number; promise: number[]; deny: number[] }> = {
  career: { cusp: 10, promise: [2, 6, 10, 11], deny: [5, 8, 12] },
  wealth: { cusp: 2, promise: [2, 6, 11], deny: [5, 8, 12] },
  marriage: { cusp: 7, promise: [2, 7, 11], deny: [1, 6, 10] },
  children: { cusp: 5, promise: [2, 5, 11], deny: [1, 4, 10] },
  health: { cusp: 1, promise: [1, 5, 11], deny: [6, 8, 12] },
  education: { cusp: 4, promise: [4, 9, 11], deny: [3, 8, 12] },
  foreign: { cusp: 12, promise: [3, 9, 12], deny: [2, 4, 11] },
  spirituality: { cusp: 12, promise: [5, 9, 12], deny: [2, 6, 10] },
};

// Jaimini: the chara karaka that signifies each area.
const JAIMINI_KARAKA: Record<AreaId, number> = { career: 1, wealth: 1, marriage: 6, children: 4, health: 0, education: 2, foreign: 0, spirituality: 0 };
const KARAKA_LABEL = ["Atmakaraka", "Amatyakaraka", "Bhratrikaraka", "Matrikaraka", "Putrakaraka", "Gnatikaraka", "Darakaraka"];
const MAIN_HOUSE: Record<AreaId, number> = { career: 10, wealth: 2, marriage: 7, children: 5, health: 1, education: 4, foreign: 12, spirituality: 9 };

function jaiminiVote(k: Kundli, id: AreaId): SystemVote {
  const karakas = charaKarakas(k);
  const idx = Math.min(JAIMINI_KARAKA[id], karakas.length - 1);
  const planet = karakas[id === "marriage" ? karakas.length - 1 : idx].graha;
  const g = k.grahas.find((x) => x.name === planet)!;
  const d = dignity(g);
  let vote: Vote = d === "exalted" || d === "own sign" ? 1 : d === "debilitated" ? -1 : 0;
  let reason = `${id === "marriage" ? "Darakaraka" : KARAKA_LABEL[idx]} ${planet}${d ? ` is ${d}` : " is neither dignified nor debilitated"}`;
  if (id === "marriage") {
    const lagna = k.lagna.rashi.index;
    const ul = arudha(k, (lagna + 11) % 12);
    const second = k.grahas.filter((x) => x.rashi.index === (ul + 1) % 12).map((x) => x.name);
    if (second.length && second.every((p) => MALEFICS.includes(p))) {
      vote = -1;
      reason += `; only malefics (${second.join(", ")}) in the 2nd from the upapada`;
    } else if (second.some((p) => BENEFICS.includes(p))) {
      vote = Math.min(1, vote + 1) as Vote;
      reason += `; benefic ${second.filter((p) => BENEFICS.includes(p)).join(", ")} in the 2nd from the upapada`;
    }
  }
  if (id === "career" || id === "wealth") {
    const al = arudha(k, k.lagna.rashi.index);
    const eleventh = k.grahas.filter((x) => x.rashi.index === (al + 10) % 12).map((x) => x.name);
    if (eleventh.length) {
      vote = Math.min(1, vote + 1) as Vote;
      reason += `; ${eleventh.join(", ")} in the 11th from the arudha lagna`;
    }
  }
  return { system: "Jaimini", vote, reason };
}

function kpVote(kp: KpChart, id: AreaId): SystemVote {
  const rule = KP_RULES[id];
  const csl = kp.cusps[rule.cusp - 1].lords.sub;
  const sig = kp.planetHouses[csl] ?? [];
  const p = sig.filter((h) => rule.promise.includes(h)).length;
  const n = sig.filter((h) => rule.deny.includes(h)).length;
  const vote: Vote = p > n ? 1 : n > p ? -1 : 0;
  return { system: "KP", vote, reason: `${rule.cusp}th cusp sub lord ${csl} signifies houses ${sig.join(", ") || "—"} (promise ${rule.promise.join("-")}, denial ${rule.deny.join("-")})` };
}

function lalKitabVote(k: Kundli, id: AreaId, pakka?: Record<string, number[]>): SystemVote {
  const house = MAIN_HOUSE[id];
  const inHouse = k.grahas.filter((g) => g.house === house).map((g) => g.name);
  if (!inHouse.length) return { system: "Lal Kitab", vote: 0, reason: `House ${house} is empty in the Lal Kitab chart — its results come through its pakka-ghar planet and aspects` };
  let score = 0;
  const notes: string[] = [];
  for (const p of inHouse) {
    const own = pakka?.[p]?.includes(house);
    if (own) {
      score += 1;
      notes.push(`${p} in its pakka ghar`);
    } else if (BENEFICS.includes(p)) {
      score += 0.5;
      notes.push(`${p}`);
    } else if (["Saturn", "Rahu", "Ketu"].includes(p)) {
      score -= 1;
      notes.push(`${p} (needs upay)`);
    } else notes.push(p);
  }
  return { system: "Lal Kitab", vote: score >= 1 ? 1 : score <= -1 ? -1 : 0, reason: `House ${house}: ${notes.join(", ")}` };
}

const yearSpan = (a: Date, b: Date) => (a.getFullYear() === b.getFullYear() ? `in ${a.getFullYear()}` : `${a.getFullYear()}–${b.getFullYear()}`);

const AGREEMENT: [number, AreaConfluence["agreement"]][] = [[3, "strong promise"], [1, "promise"], [0, "mixed"], [-2, "needs care"]];

export function confluence(k: Kundli, prediction: Prediction, kp: KpChart | null, opts: { pakka?: Record<string, number[]> } = {}): AreaConfluence[] {
  return prediction.areas.map((a) => {
    const votes: SystemVote[] = [
      { system: "Parashari", vote: a.rating === "excellent" || a.rating === "favourable" ? 1 : a.rating === "challenging" ? -1 : 0, reason: `${a.rating} from houses, lords, karakas and aspects` },
      jaiminiVote(k, a.id),
      ...(kp ? [kpVote(kp, a.id)] : []),
      lalKitabVote(k, a.id, opts.pakka),
    ];
    const total = votes.reduce((s, v) => s + v.vote, 0);
    const agreement = total <= -3 ? "strong caution" : (AGREEMENT.find(([min]) => total >= min)?.[1] ?? "needs care");
    const agree = votes.filter((v) => v.vote === Math.sign(total)).length;
    const summary =
      agreement === "mixed"
        ? `The systems differ on ${a.title.toLowerCase()} — results depend on timing and effort; follow the dasha windows.`
        : `${agree} of ${votes.length} systems ${total > 0 ? "promise" : "caution about"} ${a.title.toLowerCase()}.${a.windows[0] ? ` The strongest timing is ${yearSpan(a.windows[0].start, a.windows[0].end)}.` : ""}`;
    return { id: a.id, title: a.title, votes, agreement, summary };
  });
}

export interface PresentConfluence {
  lines: string[];
  verdict: string;
}

/** The present period judged by Vimshottari, Jaimini chara dasha, transits and the numerology personal year. */
export function presentConfluence(k: Kundli, prediction: Prediction, jaimini: JaiminiReading, birthDate: string, now = new Date()): PresentConfluence {
  const lines: string[] = [];
  let score = 0;
  if (prediction.current) {
    const r = prediction.current.rating;
    score += r === "excellent" ? 2 : r === "favourable" ? 1 : r === "challenging" ? -1 : 0;
    lines.push(`Vimshottari: ${prediction.current.maha}–${prediction.current.antar}, a ${r} period. ${prediction.current.themes}`);
  }
  if (jaimini.currentChara) {
    const signIndex = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"].indexOf(jaimini.currentChara.sign);
    const inSign = k.grahas.filter((g) => g.rashi.index === signIndex).map((g) => g.name);
    const aspecting = k.grahas.filter((g) => rashiAspects(g.rashi.index).includes(signIndex)).map((g) => g.name);
    const good = [...inSign, ...aspecting].filter((p) => BENEFICS.includes(p)).length;
    const bad = [...inSign, ...aspecting].filter((p) => ["Saturn", "Rahu", "Ketu", "Mars"].includes(p)).length;
    score += good > bad ? 1 : bad > good ? -1 : 0;
    lines.push(`Jaimini chara dasha of ${jaimini.currentChara.sign} (until ${jaimini.currentChara.end.getFullYear()}): ${inSign.length ? `${inSign.join(", ")} in it` : "no planet in it"}${aspecting.length ? `, aspected by ${aspecting.join(", ")}` : ""} — ${good > bad ? "supportive" : bad > good ? "demanding" : "balanced"}.`);
  }
  const hard = prediction.transitsNow.filter((t) => t.effect === "hard").length;
  const good = prediction.transitsNow.filter((t) => t.effect === "good").length;
  score += good > hard ? 1 : hard > good ? -1 : 0;
  lines.push(`Transits: ${prediction.transitsNow.map((t) => `${t.planet} ${t.effect}`).join(", ")}.`);
  const py = personalYear(birthDate, now.getFullYear());
  lines.push(`Numerology personal year ${py}: ${PERSONAL_YEAR[py]}.`);
  const verdict = score >= 2 ? "The techniques agree that this is a time to act and grow." : score <= -2 ? "The techniques agree that this is a time for patience, care and remedies." : "The techniques are mixed — steady effort, with remedies for the weaker side.";
  return { lines, verdict };
}
