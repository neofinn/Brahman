// Kundli Milan — Ashtakoota guna matching (36 points) on the Moon's sign and nakshatra, as used in North India.
// Tables follow the most widely published versions; where traditions differ, the choice is noted beside the table.
import { NAKSHATRAS, RASHIS, type Kundli } from "./jyotish.ts";
import { ganaOf, mangalDosha, nadiOf, SIGN_LORDS } from "./reading.ts";

export interface Koota {
  name: string;
  max: number;
  score: number;
  boy: string;
  girl: string;
  text: string;
  dosha?: string;
  cancelled?: string[];
}

export interface MilanResult {
  kootas: Koota[];
  total: number;
  verdict: "excellent" | "very good" | "acceptable" | "not recommended";
  summary: string;
  mangal: { boy: boolean; girl: boolean; text: string };
  remedies: { text: string; ritual?: string }[];
}

interface MoonInfo {
  rashi: number;
  degree: number;
  nakshatra: number;
  pada: number;
}

const moonOf = (k: Kundli): MoonInfo => {
  const m = k.grahas.find((g) => g.name === "Moon")!;
  return { rashi: m.rashi.index, degree: m.rashi.degree, nakshatra: m.nakshatra.index, pada: m.nakshatra.pada };
};

// 1. Varna (1): by Moon sign. Brahmin > Kshatriya > Vaishya > Shudra.
const VARNAS = ["Shudra", "Vaishya", "Kshatriya", "Brahmin"];
const VARNA_OF = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]; // Mesha … Meena

// 2. Vashya (2): category by Moon sign; Dhanu and Makara are split at 15°.
const VASHYAS = ["Chatushpada", "Manava", "Jalachara", "Vanachara", "Keeta"];
function vashyaOf(m: MoonInfo): number {
  const fixed = [0, 0, 1, 2, 3, 1, 1, 4, -1, -1, 1, 2];
  if (m.rashi === 8) return m.degree < 15 ? 1 : 0; // Dhanu: human first half, quadruped second
  if (m.rashi === 9) return m.degree < 15 ? 0 : 2; // Makara: quadruped first half, aquatic second
  return fixed[m.rashi];
}
// Rows = bride, columns = groom (the matrix published by most calculators).
const VASHYA_TABLE = [
  [2, 1, 1, 1.5, 1],
  [1, 2, 1.5, 0, 1],
  [1, 1.5, 2, 1, 1],
  [0, 0, 0, 2, 0],
  [1, 1, 1, 0, 2],
];

// 4. Yoni (4): animal of each nakshatra, and the symmetric compatibility matrix.
const YONIS = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"];
export const YONI_OF = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
export const YONI_TABLE = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

// 5. Graha Maitri (5): natural friendship of the Moon-sign lords (Parashari).
const MAITRI: Record<string, { f: string[]; e: string[] }> = {
  Sun: { f: ["Moon", "Mars", "Jupiter"], e: ["Venus", "Saturn"] },
  Moon: { f: ["Sun", "Mercury"], e: [] },
  Mars: { f: ["Sun", "Moon", "Jupiter"], e: ["Mercury"] },
  Mercury: { f: ["Sun", "Venus"], e: ["Moon"] },
  Jupiter: { f: ["Sun", "Moon", "Mars"], e: ["Mercury", "Venus"] },
  Venus: { f: ["Mercury", "Saturn"], e: ["Sun", "Moon"] },
  Saturn: { f: ["Mercury", "Venus"], e: ["Sun", "Moon", "Mars"] },
};
const rel = (a: string, b: string) => (MAITRI[a].f.includes(b) ? "F" : MAITRI[a].e.includes(b) ? "E" : "N");
function maitriScore(a: string, b: string): number {
  if (a === b) return 5;
  const pair = [rel(a, b), rel(b, a)].sort().join("");
  return ({ FF: 5, FN: 4, NN: 3, EF: 1, EN: 0.5, EE: 0 } as Record<string, number>)[pair];
}

// 6. Gana (6): rows = groom, columns = bride (Deva, Manushya, Rakshasa) — the version used by most software.
// Some texts instead give a simple symmetric table (same 6, Deva–Manushya 5, Manushya–Rakshasa 1, Deva–Rakshasa 0).
const GANAS = ["Deva", "Manushya", "Rakshasa"];
const GANA_TABLE = [
  [6, 6, 0],
  [5, 6, 0],
  [1, 0, 6],
];

const count = (from: number, to: number, n: number) => ((to - from + n) % n) + 1;

export function milan(boyK: Kundli, girlK: Kundli): MilanResult {
  const b = moonOf(boyK), g = moonOf(girlK);
  const kootas: Koota[] = [];
  const lordB = SIGN_LORDS[b.rashi], lordG = SIGN_LORDS[g.rashi];
  const lordsFriendly = lordB === lordG || (rel(lordB, lordG) === "F" && rel(lordG, lordB) === "F");

  const vb = VARNA_OF[b.rashi], vg = VARNA_OF[g.rashi];
  kootas.push({ name: "Varna", max: 1, score: vb >= vg ? 1 : 0, boy: VARNAS[vb], girl: VARNAS[vg], text: "Spiritual temperament and ego — how naturally the couple respect each other's nature." });

  const yb = vashyaOf(b), yg = vashyaOf(g);
  kootas.push({ name: "Vashya", max: 2, score: VASHYA_TABLE[yg][yb], boy: VASHYAS[yb], girl: VASHYAS[yg], text: "Mutual attraction and influence — who draws whom, and how easily the couple adjust." });

  const tara = (from: number, to: number) => ![3, 5, 7].includes(count(from, to, 27) % 9 || 9);
  const t1 = tara(g.nakshatra, b.nakshatra), t2 = tara(b.nakshatra, g.nakshatra);
  kootas.push({ name: "Tara", max: 3, score: t1 && t2 ? 3 : t1 || t2 ? 1.5 : 0, boy: NAKSHATRAS[b.nakshatra], girl: NAKSHATRAS[g.nakshatra], text: "Destiny and well-being — counted between the birth stars in both directions." });

  const ob = YONI_OF[b.nakshatra], og = YONI_OF[g.nakshatra];
  const yoni = YONI_TABLE[ob][og];
  kootas.push({ name: "Yoni", max: 4, score: yoni, boy: YONIS[ob], girl: YONIS[og], text: "Physical and instinctive compatibility.", dosha: yoni === 0 ? "Yoni dosha — sworn-enemy animals" : undefined });

  kootas.push({ name: "Graha Maitri", max: 5, score: maitriScore(lordB, lordG), boy: lordB, girl: lordG, text: "Mental wavelength and friendship — the friendship of the Moon-sign lords." });

  const gb = GANAS.indexOf(ganaOf(b.nakshatra)), gg = GANAS.indexOf(ganaOf(g.nakshatra));
  const gana = GANA_TABLE[gb][gg];
  kootas.push({ name: "Gana", max: 6, score: gana, boy: GANAS[gb], girl: GANAS[gg], text: "Temperament — Deva (gentle), Manushya (balanced) or Rakshasa (intense).", dosha: gana === 0 ? "Gana dosha" : undefined });

  const d1 = count(g.rashi, b.rashi, 12), d2 = count(b.rashi, g.rashi, 12);
  const pair = [d1, d2].sort((x, y) => x - y).join("/");
  const badBhakoot = ["2/12", "5/9", "6/8"].includes(pair);
  const bhakootCancel = badBhakoot ? [lordB === lordG ? "Both Moon signs have the same lord" : "", lordsFriendly && lordB !== lordG ? "The Moon-sign lords are mutual friends" : ""].filter(Boolean) : [];
  kootas.push({ name: "Bhakoot", max: 7, score: badBhakoot ? 0 : 7, boy: RASHIS[b.rashi], girl: RASHIS[g.rashi], text: `Love, family welfare and prosperity — the Moon signs are ${pair} from each other.`, dosha: badBhakoot ? `Bhakoot dosha (${pair})` : undefined, cancelled: bhakootCancel.length ? bhakootCancel : undefined });

  const nb = nadiOf(b.nakshatra), ng = nadiOf(g.nakshatra);
  const sameNadi = nb === ng;
  const nadiCancel = sameNadi
    ? [
        b.rashi === g.rashi && b.nakshatra !== g.nakshatra ? "Same Moon sign but different nakshatras" : "",
        b.nakshatra === g.nakshatra && b.rashi !== g.rashi ? "Same nakshatra but different Moon signs" : "",
        b.nakshatra === g.nakshatra && b.rashi === g.rashi && b.pada !== g.pada ? "Same nakshatra but different padas (accepted by some traditions)" : "",
        lordsFriendly ? "The Moon-sign lords are the same or mutual friends" : "",
      ].filter(Boolean)
    : [];
  kootas.push({ name: "Nadi", max: 8, score: sameNadi ? 0 : 8, boy: nb, girl: ng, text: "Health, genes and progeny — the most important koota.", dosha: sameNadi ? "Nadi dosha — same nadi" : undefined, cancelled: nadiCancel.length ? nadiCancel : undefined });

  const total = kootas.reduce((s, k) => s + k.score, 0);
  const verdict = total >= 33 ? "excellent" : total >= 25 ? "very good" : total >= 18 ? "acceptable" : "not recommended";

  const mb = mangalDosha(boyK), mg = mangalDosha(girlK);
  const boyM = mb.present && !mb.cancellations.length, girlM = mg.present && !mg.cancellations.length;
  const mangalText = boyM === girlM
    ? boyM ? "Both have Mangal dosha — it cancels out (a traditionally accepted match)." : "Neither has an active Mangal dosha."
    : `Only the ${boyM ? "boy" : "girl"} has an active Mangal dosha — traditionally remedied before marriage (for example Kumbh/Vishnu vivah and Mangal shanti).`;

  const open = kootas.filter((k) => k.dosha && !k.cancelled);
  const remedies: MilanResult["remedies"] = [];
  if (open.some((k) => k.name === "Nadi")) remedies.push({ text: "Nadi dosha: Mahamrityunjaya japa (1.25 lakh, or 11 malas daily with a sankalpa), and daan of grain, a cow or gold as the family can afford.", ritual: "mahamrityunjaya" });
  if (open.some((k) => k.name === "Bhakoot")) remedies.push({ text: "Bhakoot dosha: worship Shiva–Parvati together (Uma-Maheshwar puja) and chant the Gauri mantra before marriage.", ritual: "rudrabhishek" });
  if (open.some((k) => k.name === "Gana")) remedies.push({ text: "Gana dosha: Ganesha worship and a joint Satyanarayan katha after marriage bring harmony.", ritual: "satyanarayan" });
  if (open.some((k) => k.name === "Yoni")) remedies.push({ text: "Yoni dosha: patience and understanding; Navagraha shanti before marriage is traditional.", ritual: "navagraha-shanti" });
  if (boyM !== girlM) remedies.push({ text: "Mangal dosha in one partner: Mangal shanti puja and Hanuman worship on Tuesdays.", ritual: "mangal-dosh" });

  const doshaNote = open.length ? ` Uncancelled ${open.map((k) => k.name).join(" and ")} dosha${open.length > 1 ? "s" : ""} — tradition advises remedies, or caution, whatever the total.` : "";
  const summary = `${total} of 36 gunas match — ${verdict}.${doshaNote} ${mangalText} Guna milan is one part of matching; the full charts, the families' values and the couple's understanding matter as much.`;

  return { kootas, total, verdict, summary, mangal: { boy: boyM, girl: girlM, text: mangalText }, remedies };
}
