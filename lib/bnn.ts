// Bhrigu Nandi Nadi (as taught in the R. G. Rao tradition): read the rashi chart without the lagna, through the
// connections of key planets — the same sign, trines (5th, 9th), the 2nd (what follows), the 12th (what precedes)
// and the 7th. A retrograde planet also acts from the sign behind it. Jupiter is the native (jeeva), Saturn is
// karma (career), Venus is the wife in a man's chart and Mars the husband in a woman's.
import * as Astronomy from "astronomy-engine";
import { RASHIS, rashiOf, siderealLongitude, type Kundli } from "./jyotish.ts";

export type Relation = "with" | "trine" | "2nd" | "12th" | "7th";

export interface Connection {
  planet: string;
  relation: Relation;
  viaRetrograde: boolean;
}

const RELATION_TEXT: Record<Relation, string> = {
  with: "in the same sign",
  trine: "in trine (5th/9th)",
  "2nd": "in the 2nd — shapes what follows",
  "12th": "in the 12th — shapes what came before",
  "7th": "opposite (7th)",
};

function relationBetween(from: number, to: number): Relation | null {
  const d = ((to - from) % 12 + 12) % 12;
  if (d === 0) return "with";
  if (d === 4 || d === 8) return "trine";
  if (d === 1) return "2nd";
  if (d === 11) return "12th";
  if (d === 6) return "7th";
  return null;
}

export function connections(k: Kundli, karaka: string): Connection[] {
  const from = k.grahas.find((g) => g.name === karaka)!;
  const out: Connection[] = [];
  for (const g of k.grahas) {
    if (g.name === karaka) continue;
    let rel = relationBetween(from.rashi.index, g.rashi.index);
    let via = false;
    // A retrograde planet (not the nodes) also gives results from the previous sign.
    if (!rel && g.retrograde && !["Rahu", "Ketu"].includes(g.name)) {
      rel = relationBetween(from.rashi.index, (g.rashi.index + 11) % 12);
      via = !!rel;
    }
    if (rel) out.push({ planet: g.name, relation: rel, viaRetrograde: via });
  }
  const order: Relation[] = ["with", "trine", "2nd", "12th", "7th"];
  return out.sort((a, b) => order.indexOf(a.relation) - order.indexOf(b.relation));
}

const JUPITER_WITH: Record<string, string> = {
  Sun: "a strong bond with the father; dignity, leadership and connections with authority or government",
  Moon: "closeness to the mother; an imaginative, caring mind; travel and dealings with the public",
  Mars: "courage and drive; interest in technical work, land or property; ties with brothers",
  Mercury: "intelligence and good education; skill in business, communication, writing or teaching",
  Venus: "comforts, refinement and the arts; for a man, a supportive wife who brings prosperity",
  Saturn: "dharma–karma yoga: life is tied to work and responsibility, and career becomes central",
  Rahu: "unconventional paths, foreign connections and ambition; moments of confusion about direction",
  Ketu: "spiritual inclination and detachment; interest in mantra, astrology or the occult",
};

const SATURN_WITH: Record<string, string> = {
  Sun: "work connected with government, administration or authority",
  Moon: "work involving travel, the public, hospitality, care, water or liquids",
  Mars: "technical, engineering, machinery, land, construction, defence, police or surgical work",
  Mercury: "accounts, commerce, writing, communication, IT or teaching",
  Jupiter: "respected work — teaching, law, finance, advisory or religious roles",
  Venus: "arts, design, fashion, beauty, finance, luxury goods or vehicles",
  Rahu: "foreign companies, technology, aviation or large organisations; sudden turns in career",
  Ketu: "research, medicine, law, spirituality or behind-the-scenes technical work; breaks in career",
};

const SPOUSE_WITH: Record<string, string> = {
  Sun: "a spouse with dignity and status, perhaps from a respected family",
  Moon: "a caring, emotional spouse; family life matters greatly",
  Mars: "an energetic, passionate partnership; the spouse may be technical or assertive",
  Mercury: "a youthful, intelligent, communicative spouse",
  Jupiter: "a wise, cultured, dharmic spouse",
  Venus: "a loving, artistic spouse and a comfortable home",
  Saturn: "a mature, responsible spouse; marriage may come later or after delays",
  Rahu: "an unconventional match — different background or foreign connection",
  Ketu: "a spiritually minded spouse; some detachment within the marriage",
};

export interface BnnReading {
  native: { karaka: string; sign: string; lines: string[] };
  career: { karaka: string; sign: string; lines: string[] };
  spouse?: { karaka: string; sign: string; lines: string[] };
  transits: string[];
}

function lines(conns: Connection[], table: Record<string, string>): string[] {
  return conns.filter((c) => table[c.planet]).map((c) => `${c.planet} ${RELATION_TEXT[c.relation]}${c.viaRetrograde ? " (through its retrogression)" : ""}: ${table[c.planet]}.`);
}

export function readBnn(k: Kundli, gender?: "m" | "f", now = new Date()): BnnReading {
  const signOf = (n: string) => RASHIS[k.grahas.find((g) => g.name === n)!.rashi.index];
  const reading: BnnReading = {
    native: { karaka: "Jupiter", sign: signOf("Jupiter"), lines: lines(connections(k, "Jupiter"), JUPITER_WITH) },
    career: { karaka: "Saturn", sign: signOf("Saturn"), lines: lines(connections(k, "Saturn"), SATURN_WITH) },
    transits: [],
  };
  if (gender) {
    const spouse = gender === "m" ? "Venus" : "Mars";
    reading.spouse = { karaka: spouse, sign: signOf(spouse), lines: lines(connections(k, spouse), SPOUSE_WITH) };
  }

  // Timing: transiting Jupiter and Saturn activate the natal planets they meet or trine.
  const jupNow = rashiOf(siderealLongitude(Astronomy.Body.Jupiter, now)).index;
  const satNow = rashiOf(siderealLongitude(Astronomy.Body.Saturn, now)).index;
  for (const [transit, sign, theme] of [["Jupiter", jupNow, "growth and blessings"], ["Saturn", satNow, "effort, responsibility and lasting change"]] as const) {
    const touched = k.grahas.filter((g) => { const r = relationBetween(sign, g.rashi.index); return r === "with" || r === "trine"; }).map((g) => g.name);
    if (touched.length) reading.transits.push(`Transiting ${transit} in ${RASHIS[sign]} activates natal ${touched.join(", ")} — bringing ${theme} to what they signify.`);
  }
  const natalJup = k.grahas.find((g) => g.name === "Jupiter")!.rashi.index;
  const natalSat = k.grahas.find((g) => g.name === "Saturn")!.rashi.index;
  if (satNow === natalJup) reading.transits.push("Saturn is passing over natal Jupiter — a major turning point in career and life direction.");
  if (jupNow === natalSat) reading.transits.push("Jupiter is passing over natal Saturn — a favourable year for career growth and recognition.");
  return reading;
}
