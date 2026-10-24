// Jaimini astrology (Jaimini Upadesha Sutras, as taught in BPHS and by K. N. Rao): chara karakas, rashi drishti,
// arudha padas and upapada, argala, karakamsha and ishta devata, Jaimini raja yogas, and the chara dasha.
import { RASHIS, type Kundli } from "./jyotish.ts";
import { EXALTED, SIGN_LORDS } from "./reading.ts";
import { charaKarakas, vargaChart } from "./vargas.ts";

const YEAR_MS = 365.2425 * 86400000;
const BENEFICS = ["Jupiter", "Venus", "Mercury", "Moon"];
const MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"];

const isMovable = (s: number) => s % 3 === 0;
const isFixed = (s: number) => s % 3 === 1;

/** Rashi drishti: movable signs aspect the fixed signs except the next one; fixed aspect movable except the previous; duals aspect each other. */
export function rashiAspects(sign: number): number[] {
  return Array.from({ length: 12 }, (_, s) => s).filter((s) => {
    if (s === sign) return false;
    if (isMovable(sign)) return isFixed(s) && s !== (sign + 1) % 12;
    if (isFixed(sign)) return isMovable(s) && s !== (sign + 11) % 12;
    return !isMovable(s) && !isFixed(s);
  });
}

const signOf = (k: Kundli, planet: string) => k.grahas.find((g) => g.name === planet)!.rashi.index;
const occupants = (k: Kundli, sign: number) => k.grahas.filter((g) => g.rashi.index === sign).map((g) => g.name);

/** The lord of a sign; Scorpio and Aquarius have two (Mars/Ketu, Saturn/Rahu) and the stronger is taken (K. N. Rao's rules). */
export function jaiminiLord(k: Kundli, sign: number): string {
  const pair = sign === 7 ? ["Mars", "Ketu"] : sign === 10 ? ["Saturn", "Rahu"] : null;
  if (!pair) return SIGN_LORDS[sign];
  const [a, b] = pair;
  const inA = signOf(k, a) === sign, inB = signOf(k, b) === sign;
  if (inA && !inB) return b; // one lord in the sign itself: take the other
  if (inB && !inA) return a;
  const company = (p: string) => occupants(k, signOf(k, p)).length;
  if (company(a) !== company(b)) return company(a) > company(b) ? a : b;
  const exalted = (p: string) => EXALTED[p] === signOf(k, p);
  if (exalted(a) !== exalted(b)) return exalted(a) ? a : b;
  const deg = (p: string) => k.grahas.find((g) => g.name === p)!.rashi.degree;
  return deg(a) >= deg(b) ? a : b;
}

const count = (from: number, to: number) => ((to - from + 12) % 12) + 1;

/** Arudha pada of the house in `sign` (BPHS): as far from the lord as the lord is from the house; not the 1st or 7th from it. */
export function arudha(k: Kundli, sign: number): number {
  const lordSign = signOf(k, jaiminiLord(k, sign));
  let pada = (lordSign + count(sign, lordSign) - 1) % 12;
  if (pada === sign || pada === (sign + 6) % 12) pada = (pada + 9) % 12;
  return pada;
}

export interface Argala {
  from: number; // house counted from the reference sign
  planets: string[];
  obstructedBy: string[];
}

const ARGALA: [number, number][] = [[2, 12], [4, 10], [11, 3], [5, 9]];

/** Argala (intervention) on a sign from the 2nd, 4th, 11th and 5th, and the obstruction from the 12th, 10th, 3rd and 9th. */
export function argala(k: Kundli, ref: number): Argala[] {
  return ARGALA.map(([h, v]) => ({
    from: h,
    planets: occupants(k, (ref + h - 1) % 12),
    obstructedBy: occupants(k, (ref + v - 1) % 12),
  })).filter((a) => a.planets.length);
}

// BPHS ch. 2: the avatara of Vishnu associated with each graha.
const AVATARA: Record<string, string> = {
  Sun: "Shri Rama", Moon: "Shri Krishna", Mars: "Narasimha", Mercury: "Buddha", Jupiter: "Vamana", Venus: "Parashurama", Saturn: "Kurma", Rahu: "Varaha", Ketu: "Matsya",
};
// The deity commonly worshipped for each graha.
const DEVATA: Record<string, string> = {
  Sun: "Surya and Shiva", Moon: "Gauri (Parvati)", Mars: "Hanuman and Kartikeya", Mercury: "Vishnu", Jupiter: "Dakshinamurti (Shiva as guru) and Vishnu", Venus: "Lakshmi", Saturn: "Hanuman and Shani", Rahu: "Durga", Ketu: "Ganesha",
};

const AK_LESSON: Record<string, string> = {
  Sun: "the soul's lesson is humility in authority — to lead without ego and serve the father, the state and dharma",
  Moon: "the soul's lesson is care and emotional maturity — to nourish others and keep the mind steady",
  Mars: "the soul's lesson is right use of strength — courage without aggression, protection of the weak",
  Mercury: "the soul's lesson is right speech and discrimination — learning, honest dealings and wit without deceit",
  Jupiter: "the soul's lesson is wisdom and dharma — respect for gurus and children, and teaching what one knows",
  Venus: "the soul's lesson is pure love and right enjoyment — relationships and art without excess",
  Saturn: "the soul's lesson is patience and service — accepting duty, delay and hard work without bitterness",
};

const CAREER: Record<string, string> = {
  Sun: "government, administration, politics, medicine", Moon: "public dealing, hospitality, nursing, food, travel", Mars: "defence, police, engineering, surgery, land",
  Mercury: "business, finance, IT, writing, communication", Jupiter: "teaching, law, advising, finance, religious work", Venus: "arts, design, media, luxury, hospitality",
  Saturn: "industry, labour, mining, oil, justice, service",
};

const SPOUSE: Record<string, string> = {
  Sun: "dignified, proud and authoritative", Moon: "caring, emotional and home-loving", Mars: "energetic, courageous and quick-tempered",
  Mercury: "youthful, witty and communicative", Jupiter: "wise, principled and religious", Venus: "attractive, artistic and refined", Saturn: "mature, hardworking and serious, often older",
};

export interface CharaDashaPeriod {
  sign: string;
  years: number;
  start: Date;
  end: Date;
}

/** Chara dasha (K. N. Rao's method): from the lagna, direct if the 9th is in an odd-footed sign, reverse otherwise. */
export function charaDasha(k: Kundli, birth: Date): CharaDashaPeriod[] {
  const lagna = k.lagna.rashi.index;
  const savya = (s: number) => [0, 1, 2, 6, 7, 8].includes(s); // odd-footed: Mesha–Mithuna, Tula–Dhanu
  const direct = savya((lagna + 8) % 12);
  const years = (sign: number) => {
    const lordSign = signOf(k, jaiminiLord(k, sign));
    if (lordSign === sign) return 12;
    let n = (savya(sign) ? count(sign, lordSign) : count(lordSign, sign)) - 1;
    const lord = jaiminiLord(k, sign);
    if (EXALTED[lord] === lordSign) n += 1;
    if ((EXALTED[lord] + 6) % 12 === lordSign) n -= 1;
    return Math.max(n, 1);
  };
  const order = Array.from({ length: 12 }, (_, i) => (direct ? lagna + i : lagna - i + 12) % 12);
  const first = order.map((s) => ({ s, y: years(s) }));
  // The second cycle gives each sign the balance of 12 years (zero-year periods are skipped).
  const cycles = [...first, ...first.map(({ s, y }) => ({ s, y: 12 - y }))].filter((p) => p.y > 0);
  const out: CharaDashaPeriod[] = [];
  let t = birth.getTime();
  for (const { s, y } of cycles) {
    const end = t + y * YEAR_MS;
    out.push({ sign: RASHIS[s], years: y, start: new Date(t), end: new Date(end) });
    t = end;
  }
  return out;
}

export interface JaiminiReading {
  karakas: ReturnType<typeof charaKarakas>;
  arudhaLagna: string;
  upapada: string;
  arudhas: { house: number; sign: string }[];
  karakamsha: string;
  ishtaDevata: { planet: string; avatara: string; devata: string; reason: string };
  argalaOnLagna: Argala[];
  points: string[];
  rajaYogas: string[];
  charaDasha: CharaDashaPeriod[];
  currentChara?: CharaDashaPeriod;
}

export function readJaimini(k: Kundli, birth: Date, now = new Date()): JaiminiReading {
  const karakas = charaKarakas(k);
  const ak = karakas[0].graha, amk = karakas[1].graha;
  const dk = karakas[karakas.length - 1].graha;
  const lagna = k.lagna.rashi.index;
  const al = arudha(k, lagna);
  const ul = arudha(k, (lagna + 11) % 12);
  const d9 = vargaChart(k, "D9");
  const kk = d9.positions.find((p) => p.name === ak)!.sign;

  // Ishta devata: the planet in the 12th from karakamsha in the navamsha, else the lord of that sign.
  const twelfth = (kk + 11) % 12;
  const inTwelfth = d9.positions.filter((p) => p.sign === twelfth).map((p) => p.name);
  const ishtaPlanet = inTwelfth[0] ?? SIGN_LORDS[twelfth];
  const ishta = {
    planet: ishtaPlanet, avatara: AVATARA[ishtaPlanet], devata: DEVATA[ishtaPlanet],
    reason: inTwelfth.length ? `${ishtaPlanet} occupies the 12th from the karakamsha (${RASHIS[twelfth]}) in the navamsha` : `the 12th from the karakamsha is ${RASHIS[twelfth]}, ruled by ${ishtaPlanet}`,
  };

  const points: string[] = [];
  points.push(`Atmakaraka ${ak}: ${AK_LESSON[ak]}.`);
  points.push(`Amatyakaraka ${amk} guides the career: ${CAREER[amk]}.`);
  points.push(`Darakaraka ${dk} describes the spouse as ${SPOUSE[dk]}.`);
  points.push(`Arudha lagna (how the world sees you) is ${RASHIS[al]}; karakamsha (the soul's sign in the navamsha) is ${RASHIS[kk]}.`);
  const eleventhAL = occupants(k, (al + 10) % 12), twelfthAL = occupants(k, (al + 11) % 12);
  if (eleventhAL.length) points.push(`${eleventhAL.join(", ")} in the 11th from the arudha lagna ${eleventhAL.length > 1 ? "bring" : "brings"} steady gains and income.`);
  if (twelfthAL.length) points.push(`${twelfthAL.join(", ")} in the 12th from the arudha lagna ${twelfthAL.length > 1 ? "point" : "points"} to expenses${twelfthAL.some((p) => BENEFICS.includes(p)) ? " — on good causes" : " that need control"}.`);
  const secondUL = occupants(k, (ul + 1) % 12);
  if (secondUL.length) {
    const mal = secondUL.filter((p) => MALEFICS.includes(p));
    points.push(`Upapada (marriage) is ${RASHIS[ul]}; ${secondUL.join(", ")} in its 2nd ${mal.length && mal.length === secondUL.length ? "can strain the marriage — patience and remedies help" : "support a lasting marriage"}.`);
  } else {
    points.push(`Upapada (marriage) is ${RASHIS[ul]}, with no planet in its 2nd; its lord ${jaiminiLord(k, (ul + 1) % 12)} decides the continuity of marriage.`);
  }

  const rajaYogas: string[] = [];
  const akSign = signOf(k, ak), amkSign = signOf(k, amk);
  if (akSign === amkSign) rajaYogas.push(`Atmakaraka ${ak} and amatyakaraka ${amk} are together — a Jaimini raja yoga for status and success.`);
  else if (rashiAspects(akSign).includes(amkSign)) rajaYogas.push(`Atmakaraka ${ak} and amatyakaraka ${amk} aspect each other by rashi drishti — a Jaimini raja yoga.`);
  const fifthLord = jaiminiLord(k, (lagna + 4) % 12);
  if (fifthLord !== ak && (signOf(k, fifthLord) === akSign || rashiAspects(akSign).includes(signOf(k, fifthLord)))) rajaYogas.push(`The 5th lord ${fifthLord} joins or aspects the atmakaraka — intelligence and authority (Jaimini raja yoga).`);
  if (BENEFICS.some((b) => d9.positions.find((p) => p.name === b)!.sign === kk)) rajaYogas.push("A benefic joins the karakamsha in the navamsha — a noble and fortunate life.");

  const cd = charaDasha(k, birth);
  return {
    karakas, arudhaLagna: RASHIS[al], upapada: RASHIS[ul],
    arudhas: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: RASHIS[arudha(k, (lagna + i) % 12)] })),
    karakamsha: RASHIS[kk], ishtaDevata: ishta, argalaOnLagna: argala(k, lagna), points, rajaYogas, charaDasha: cd,
    currentChara: cd.find((p) => p.start <= now && p.end > now),
  };
}
