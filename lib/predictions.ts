// Rule-based predictions in the Parashari tradition: rajyogas and doshas, life areas, timing of events from dashas and
// transits, a year-by-year forecast, and a prioritised remedy plan. Tendencies are described, never fear-based fate.
import * as Astronomy from "astronomy-engine";
import { getGraha } from "./grahas.ts";
import { RASHIS, rahuLongitude, rashiOf, siderealLongitude, type GrahaPosition, type Kundli } from "./jyotish.ts";
import { antardashas, aspects, dignity, EXALTED, kaalSarp, mangalDosha, sadeSati, SIGN_LORDS } from "./reading.ts";

// ---------------------------------------------------------------------------
// Foundations

const YEAR_MS = 365.2425 * 86400000;
const norm = (x: number) => ((x % 360) + 360) % 360;
const ord = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
const fmt = (d: Date) => new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(d);
const list = (items: string[]) => items.join(", ").replace(/, ([^,]*)$/, " and $1");

const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];
const UPACHAYA = [3, 6, 10, 11];

const HOUSE_THEMES = [
  "self and health", "wealth and family", "courage and efforts", "home and mother", "children and intelligence", "health, debts and rivals",
  "marriage and partnerships", "sudden changes and longevity", "fortune, father and dharma", "career and status", "gains and ambitions", "expenses, foreign lands and liberation",
];

// Natural friendships (Brihat Parashara Hora Shastra).
const FRIENDS: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
  Moon: { friends: ["Sun", "Mercury"], enemies: [] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] },
  Rahu: { friends: ["Mercury", "Venus", "Saturn"], enemies: ["Sun", "Moon", "Mars"] },
  Ketu: { friends: ["Mars", "Venus", "Saturn"], enemies: ["Sun", "Moon"] },
};
export function relationship(a: string, b: string): "friend" | "neutral" | "enemy" {
  const f = FRIENDS[a];
  return f.friends.includes(b) ? "friend" : f.enemies.includes(b) ? "enemy" : "neutral";
}

// Combustion distances from the Sun (degrees).
const COMBUST: Record<string, number> = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };

export const RUDRAKSHA: Record<string, string> = {
  Sun: "1-mukhi or 12-mukhi", Moon: "2-mukhi", Mars: "3-mukhi", Mercury: "4-mukhi", Jupiter: "5-mukhi", Venus: "6-mukhi", Saturn: "7-mukhi", Rahu: "8-mukhi", Ketu: "9-mukhi",
};

interface Ctx {
  k: Kundli;
  by: (n: string) => GrahaPosition;
  lagna: number;
  lordOf: (house: number) => string;
  ruled: (planet: string) => number[];
  houseFromMoon: (g: GrahaPosition) => number;
  waxingMoon: boolean;
}

function context(k: Kundli): Ctx {
  const by = (n: string) => k.grahas.find((g) => g.name === n)!;
  const lagna = k.lagna.rashi.index;
  const lordOf = (h: number) => SIGN_LORDS[(lagna + h - 1) % 12];
  const ruled = (p: string) => Array.from({ length: 12 }, (_, i) => i + 1).filter((h) => lordOf(h) === p);
  const moon = by("Moon");
  return {
    k, by, lagna, lordOf, ruled,
    houseFromMoon: (g) => ((g.rashi.index - moon.rashi.index + 12) % 12) + 1,
    waxingMoon: norm(moon.longitude - by("Sun").longitude) < 180,
  };
}

const isBenefic = (c: Ctx, n: string) => ["Jupiter", "Venus", "Mercury"].includes(n) || (n === "Moon" && c.waxingMoon);
const isMalefic = (c: Ctx, n: string) => ["Saturn", "Mars", "Rahu", "Ketu", "Sun"].includes(n) || (n === "Moon" && !c.waxingMoon);

export function combust(k: Kundli, g: GrahaPosition): boolean {
  if (!COMBUST[g.name]) return false;
  const sun = k.grahas.find((x) => x.name === "Sun")!;
  const d = Math.abs(((g.longitude - sun.longitude + 540) % 360) - 180);
  const limit = g.retrograde && (g.name === "Mercury" || g.name === "Venus") ? COMBUST[g.name] - 2 : COMBUST[g.name];
  return d < limit;
}

/** Functional nature for this lagna: trikona lords help, 6/8/12 lords hurt, a kendra+trikona lord is yogakaraka. */
function functionalScore(c: Ctx, p: string): number {
  if (p === "Rahu" || p === "Ketu") {
    // The nodes give the results of their sign lord and placement.
    const g = c.by(p);
    return (KENDRA.includes(g.house) || TRIKONA.includes(g.house) ? 0.5 : 0) + (UPACHAYA.includes(g.house) ? 1 : 0) - (DUSTHANA.includes(g.house) && g.house !== 6 ? 1 : 0);
  }
  const houses = c.ruled(p);
  let s = 0;
  for (const h of houses) {
    if (h === 1) s += 2;
    else if (h === 5 || h === 9) s += 2;
    else if (h === 6 || h === 12) s -= 1.5;
    else if (h === 8) s -= houses.includes(1) ? 0 : 2;
    else if (h === 3 || h === 11) s -= 1;
    else if (KENDRA.includes(h)) s += isBenefic(c, p) ? -0.5 : 0.5; // kendradhipati dosha for natural benefics
  }
  if (houses.some((h) => KENDRA.includes(h) && h !== 1) && houses.some((h) => h === 5 || h === 9)) s += 2; // yogakaraka
  return s;
}

export function isYogakaraka(k: Kundli, p: string): boolean {
  const c = context(k);
  const h = c.ruled(p);
  return h.some((x) => [4, 7, 10].includes(x)) && h.some((x) => x === 5 || x === 9);
}

/** Overall strength of a planet in this chart: dignity, house, combustion and Jupiter's aspect. */
function strength(c: Ctx, g: GrahaPosition): number {
  const d = dignity(g);
  let s = d === "exalted" ? 2 : d === "own sign" ? 1.5 : d === "debilitated" ? -2 : 0;
  const rel = !["Rahu", "Ketu"].includes(g.name) && relationship(g.name, SIGN_LORDS[g.rashi.index]);
  if (!d && rel === "friend") s += 0.5;
  if (!d && rel === "enemy") s -= 0.5;
  if (KENDRA.includes(g.house) || TRIKONA.includes(g.house)) s += 1;
  if (DUSTHANA.includes(g.house)) s -= 1;
  if (combust(c.k, g)) s -= 1;
  if (g.name !== "Jupiter" && aspects(c.by("Jupiter")).includes(g.house)) s += 0.5;
  return s;
}

// ---------------------------------------------------------------------------
// Yogas

export interface Yoga {
  name: string;
  kind: "raja" | "dhana" | "mahapurusha" | "other";
  text: string;
  planets: string[];
}

export function findYogas(k: Kundli): Yoga[] {
  const c = context(k);
  const { by, lordOf } = c;
  const out: Yoga[] = [];
  const moon = by("Moon");
  const inKendraFrom = (g: GrahaPosition, ref: number) => KENDRA.includes(((g.rashi.index - ref + 12) % 12) + 1);

  if (inKendraFrom(by("Jupiter"), moon.rashi.index)) out.push({ name: "Gajakesari Yoga", kind: "raja", planets: ["Jupiter", "Moon"], text: "Jupiter in a kendra from the Moon gives wisdom, reputation, lasting prosperity and the ability to overcome enemies." });
  if (by("Sun").rashi.index === by("Mercury").rashi.index && !combust(k, by("Mercury"))) out.push({ name: "Budhaditya Yoga", kind: "other", planets: ["Sun", "Mercury"], text: "The Sun with an uncombust Mercury sharpens the intellect and brings success through learning and speech." });
  if (moon.rashi.index === by("Mars").rashi.index) out.push({ name: "Chandra-Mangala Yoga", kind: "dhana", planets: ["Moon", "Mars"], text: "Moon with Mars gives enterprise and the ability to earn through one's own initiative." });

  const MP: Record<string, [string, string]> = { Mars: ["Ruchaka", "courage, leadership and command"], Mercury: ["Bhadra", "intelligence, eloquence and business skill"], Jupiter: ["Hamsa", "righteousness, wisdom and respect"], Venus: ["Malavya", "charm, luxury, arts and a happy marriage"], Saturn: ["Shasha", "authority, discipline and influence over many"] };
  for (const [p, [name, gift]] of Object.entries(MP)) {
    const g = by(p);
    const d = dignity(g);
    if (KENDRA.includes(g.house) && (d === "own sign" || d === "exalted")) out.push({ name: `${name} Mahapurusha Yoga`, kind: "mahapurusha", planets: [p], text: `${p} ${d} in a kendra — one of the five great-person yogas, giving ${gift}.` });
  }

  // Raja yoga: a kendra lord joined with, or exchanging signs with, a trikona lord.
  const kendraLords = new Set([1, 4, 7, 10].map(lordOf));
  const trikonaLords = new Set([1, 5, 9].map(lordOf));
  const seen = new Set<string>();
  for (const a of kendraLords) for (const b of trikonaLords) {
    if (a === b) continue;
    const key = [a, b].sort().join("+");
    if (seen.has(key)) continue;
    const ga = by(a), gb = by(b);
    const together = ga.rashi.index === gb.rashi.index;
    const exchange = SIGN_LORDS[ga.rashi.index] === b && SIGN_LORDS[gb.rashi.index] === a;
    const mutual = aspects(ga).includes(gb.house) && aspects(gb).includes(ga.house);
    if (together || exchange || mutual) {
      seen.add(key);
      out.push({ name: "Raja Yoga", kind: "raja", planets: [a, b], text: `${a} and ${b}, lords of a kendra and a trikona, are ${together ? "together" : exchange ? "in exchange" : "in mutual aspect"} — rise in status, authority and success, especially in their dashas.` });
    }
  }
  for (const p of ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]) {
    if (isYogakaraka(k, p) && strength(c, by(p)) > 0) out.push({ name: `${p} as Yogakaraka`, kind: "raja", planets: [p], text: `${p} rules both a kendra and a trikona for your lagna and is well placed — its dasha brings rise and success.` });
  }

  // Dhana yogas: lords of 2 and 11 with lords of 5 and 9.
  for (const a of new Set([2, 11].map(lordOf))) for (const b of new Set([5, 9].map(lordOf))) {
    if (a !== b && by(a).rashi.index === by(b).rashi.index) out.push({ name: "Dhana Yoga", kind: "dhana", planets: [a, b], text: `${a} and ${b}, lords of wealth and fortune, are together — good potential for accumulating wealth.` });
  }

  // Lakshmi Yoga: a dignified 9th lord in a kendra or trikona, with a strong lagna lord.
  const ninth = by(lordOf(9));
  const lagnaLord = by(lordOf(1));
  if ((dignity(ninth) === "own sign" || dignity(ninth) === "exalted") && (KENDRA.includes(ninth.house) || TRIKONA.includes(ninth.house)) && !DUSTHANA.includes(lagnaLord.house) && dignity(lagnaLord) !== "debilitated") {
    out.push({ name: "Lakshmi Yoga", kind: "dhana", planets: [ninth.name], text: "A dignified 9th lord in a kendra or trikona with a strong lagna lord — the grace of Lakshmi: fortune, prosperity and a noble life." });
  }

  // Saraswati Yoga: Jupiter, Venus and Mercury in kendras, trikonas or the 2nd.
  const good = [1, 2, 4, 5, 7, 9, 10];
  if (["Jupiter", "Venus", "Mercury"].every((p) => good.includes(by(p).house)) && dignity(by("Jupiter")) !== "debilitated") {
    out.push({ name: "Saraswati Yoga", kind: "other", planets: ["Jupiter", "Venus", "Mercury"], text: "Jupiter, Venus and Mercury in kendras, trikonas or the 2nd — the blessing of Saraswati: learning, eloquence, arts and fame." });
  }

  // Adhi Yoga: benefics in the 6th, 7th and 8th from the Moon.
  const adhi = ["Jupiter", "Venus", "Mercury"].filter((p) => [6, 7, 8].includes(c.houseFromMoon(by(p))));
  if (adhi.length >= 2) out.push({ name: "Adhi Yoga", kind: "raja", planets: adhi, text: `${list(adhi)} in the 6th–8th from the Moon — leadership, comfort and victory over opponents.` });

  // Amala Yoga: a benefic in the 10th from the lagna or Moon, with no malefic there.
  for (const [ref, label] of [[c.lagna, "lagna"], [moon.rashi.index, "Moon"]] as const) {
    const tenth = (ref + 9) % 12;
    const occupants = k.grahas.filter((g) => g.rashi.index === tenth).map((g) => g.name);
    const benefics = occupants.filter((n) => ["Jupiter", "Venus", "Mercury"].includes(n));
    if (benefics.length && !occupants.some((n) => ["Saturn", "Mars", "Rahu", "Ketu"].includes(n))) {
      out.push({ name: "Amala Yoga", kind: "other", planets: benefics, text: `${list(benefics)} in the 10th from the ${label} — a spotless reputation and success through good deeds.` });
      break;
    }
  }

  // Vasumati Yoga: benefics in the upachayas (3, 6, 10, 11) from the lagna or Moon.
  const vasu = ["Jupiter", "Venus", "Mercury"].filter((p) => UPACHAYA.includes(by(p).house) || UPACHAYA.includes(c.houseFromMoon(by(p))));
  if (vasu.length >= 2) out.push({ name: "Vasumati Yoga", kind: "dhana", planets: vasu, text: `${list(vasu)} in growth houses (3, 6, 10, 11) — wealth that keeps increasing through effort.` });

  // Viparita Raja Yoga: lords of 6, 8, 12 placed in 6, 8, 12.
  for (const [h, name] of [[6, "Harsha"], [8, "Sarala"], [12, "Vimala"]] as const) {
    const lord = by(lordOf(h));
    if (DUSTHANA.includes(lord.house) && !c.ruled(lord.name).includes(1)) out.push({ name: `${name} (Viparita Raja) Yoga`, kind: "raja", planets: [lord.name], text: `The ${ord(h)} lord ${lord.name} sits in the ${ord(lord.house)} house — success that rises out of difficulty; obstacles turn into gains.` });
  }

  // Neecha Bhanga Raja Yoga: a debilitated planet whose fall is cancelled.
  for (const g of k.grahas) {
    if (dignity(g) !== "debilitated" || ["Rahu", "Ketu"].includes(g.name)) continue;
    const dispositor = by(SIGN_LORDS[g.rashi.index]);
    const exaltLord = by(SIGN_LORDS[EXALTED[g.name]]);
    const cancellers = [dispositor, exaltLord].filter((x) => inKendraFrom(x, c.lagna) || inKendraFrom(x, moon.rashi.index));
    if (cancellers.length) out.push({ name: "Neecha Bhanga Raja Yoga", kind: "raja", planets: [g.name, ...cancellers.map((x) => x.name)], text: `${g.name} is debilitated in ${RASHIS[g.rashi.index]}, but ${list([...new Set(cancellers.map((x) => x.name))])} in a kendra cancels the fall — a rise after early struggle, often to great heights.` });
  }

  // Parivartana: two planets in each other's signs.
  const sevenNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const done = new Set<string>();
  for (const a of sevenNames) for (const b of sevenNames) {
    if (a >= b) continue;
    const ga = by(a), gb = by(b);
    if (SIGN_LORDS[ga.rashi.index] === b && SIGN_LORDS[gb.rashi.index] === a && !done.has(a + b)) {
      done.add(a + b);
      const houses = [...c.ruled(a), ...c.ruled(b)];
      const kind = houses.some((h) => DUSTHANA.includes(h)) ? "Dainya" : houses.includes(3) ? "Khala" : "Maha";
      out.push({ name: `${kind} Parivartana Yoga`, kind: kind === "Maha" ? "raja" : "other", planets: [a, b], text: kind === "Maha" ? `${a} and ${b} exchange signs between good houses — they strengthen each other and bring prosperity and status.` : kind === "Khala" ? `${a} and ${b} exchange signs involving the 3rd house — ups and downs, success through bold effort.` : `${a} and ${b} exchange signs involving a difficult house — some struggle, which turns favourable with patience.` });
    }
  }

  // Kemadruma is a dosha, handled in findDoshas.
  return out;
}

// ---------------------------------------------------------------------------
// Doshas

export interface Dosha {
  name: string;
  severity: "high" | "medium" | "low" | "cancelled";
  text: string;
  cancellations: string[];
  grahas: string[]; // to pacify
  rituals: string[]; // ritual guide ids
  practices: string[];
}

const GANDMOOL = [0, 8, 9, 17, 18, 26];

export function findDoshas(k: Kundli, now = new Date()): Dosha[] {
  const c = context(k);
  const { by } = c;
  const out: Dosha[] = [];
  const same = (a: string, b: string) => by(a).rashi.index === by(b).rashi.index;
  const jupiterHelps = (names: string[]) => names.some((n) => same("Jupiter", n) || aspects(by("Jupiter")).includes(by(n).house));

  const m = mangalDosha(k);
  if (m.present) {
    out.push({
      name: "Mangal (Kuja) Dosha", severity: m.cancellations.length ? "cancelled" : m.from.length === 2 ? "high" : "medium",
      text: `Mars sits in a sensitive house from the ${m.from.join(" and ")} (1st, 2nd, 4th, 7th, 8th or 12th). Tradition links this to friction or delay in marriage; it is matched when the partner also has it.`,
      cancellations: m.cancellations, grahas: ["Mars"], rituals: ["mangal-dosh", "hanuman-sundarkand"],
      practices: ["Recite the Hanuman Chalisa every Tuesday", "Keep the Mangalvar vrat if health allows", "Donate red lentils (masoor) and jaggery on Tuesdays"],
    });
  }
  const ks = kaalSarp(k);
  if (ks) {
    out.push({
      name: `${ks} Kaal Sarp Yoga`, severity: jupiterHelps(["Rahu", "Ketu"]) ? "low" : "medium",
      text: "All seven planets lie on one side of the Rahu–Ketu axis. Believed to bring periods of struggle and sudden reversals; it is not in the classical Parashari texts, and many astrologers give it less weight.",
      cancellations: jupiterHelps(["Rahu", "Ketu"]) ? ["Jupiter influences the nodal axis"] : [], grahas: ["Rahu", "Ketu"], rituals: ["kaal-sarp", "rudrabhishek"],
      practices: ["Worship Shiva on Mondays and on Nag Panchami", "Chant 'ॐ नमः शिवाय' 108 times daily"],
    });
  }
  const ss = sadeSati(by("Moon").rashi.index, now);
  if (ss && ss.start <= now) {
    out.push({
      name: "Shani Sade Sati (running now)", severity: ss.phase === 2 ? "high" : "medium",
      text: `Saturn is transiting around your Moon (${fmt(ss.start)} – ${fmt(ss.end)}). It brings responsibility, pressure and maturity; honest, patient effort is rewarded.`,
      cancellations: [], grahas: ["Saturn"], rituals: ["shani-shanti", "hanuman-sundarkand"],
      practices: ["Light a mustard-oil lamp under a peepal tree on Saturday evenings", "Serve and donate to the poor, workers and the elderly", "Recite the Hanuman Chalisa on Saturdays"],
    });
  }
  const sunNode = ["Rahu", "Ketu"].filter((n) => same("Sun", n));
  if (sunNode.length || [by("Rahu").house, by("Ketu").house].includes(9)) {
    const help = jupiterHelps(["Sun"]);
    out.push({
      name: "Pitru Dosha", severity: help ? "low" : "medium",
      text: sunNode.length ? `The Sun is joined by ${sunNode[0]} — tradition reads this as unresolved debts to the ancestors, affecting the father, progeny or fortune.` : "A node occupies the 9th house of ancestors and fortune — tradition reads this as an ancestral debt to be honoured.",
      cancellations: help ? ["Jupiter's influence softens it"] : [], grahas: ["Sun"], rituals: ["tarpan", "gita-path"],
      practices: ["Offer tarpan with sesame water on every Amavasya", "Perform shraddha in Pitru Paksha", "Feed crows, cows and the needy in your ancestors' names"],
    });
  }
  if (same("Jupiter", "Rahu")) {
    out.push({
      name: "Guru Chandal Dosha", severity: dignity(by("Jupiter")) ? "low" : "medium",
      text: "Jupiter with Rahu can cloud judgement, create friction with teachers or elders, and tempt one to shortcuts in dharma. Used well, it gives unconventional wisdom.",
      cancellations: dignity(by("Jupiter")) ? [`Jupiter is ${dignity(by("Jupiter"))}`] : [], grahas: ["Jupiter", "Rahu"], rituals: ["navagraha-shanti"],
      practices: ["Respect teachers and elders; seek a guru's guidance", "Worship Vishnu on Thursdays and donate chana dal and turmeric"],
    });
  }
  for (const lum of ["Sun", "Moon"]) {
    const node = ["Rahu", "Ketu"].find((n) => same(lum, n));
    if (node && !(lum === "Sun" && sunNode.length)) {
      out.push({
        name: `Grahan Dosha (${lum}–${node})`, severity: "medium",
        text: `${lum === "Sun" ? "The Sun (soul, father, vitality)" : "The Moon (mind, mother, peace)"} is eclipsed by ${node} — periods of ${lum === "Sun" ? "low confidence or friction with authority" : "anxiety or emotional unrest"}.`,
        cancellations: jupiterHelps([lum]) ? ["Jupiter's influence softens it"] : [], grahas: [lum, node], rituals: ["mahamrityunjaya"],
        practices: [lum === "Sun" ? "Offer water (arghya) to the rising Sun daily with the Gayatri mantra" : "Worship Shiva on Mondays and keep a calm daily routine", "Donate and chant during eclipses"],
      });
    }
  }
  if (same("Saturn", "Rahu")) out.push({ name: "Shrapit Dosha", severity: "medium", text: "Saturn with Rahu is said to carry karmic burdens from the past — delays and obstacles that ease with patient effort and worship.", cancellations: jupiterHelps(["Saturn"]) ? ["Jupiter's influence softens it"] : [], grahas: ["Saturn", "Rahu"], rituals: ["shani-shanti", "mahamrityunjaya"], practices: ["Chant the Mahamrityunjaya mantra daily", "Serve the needy on Saturdays"] });
  if (same("Mars", "Rahu")) out.push({ name: "Angarak Dosha", severity: "medium", text: "Mars with Rahu brings impulsiveness, anger and accident-proneness; channel the energy into sport, discipline or service.", cancellations: [], grahas: ["Mars", "Rahu"], rituals: ["mangal-dosh", "hanuman-sundarkand"], practices: ["Recite the Hanuman Chalisa daily", "Drive carefully and avoid quarrels on Tuesdays"] });
  if (same("Moon", "Saturn")) out.push({ name: "Vish Dosha", severity: "medium", text: "The Moon with Saturn can bring heaviness of mind, worry or melancholy, and a demanding relationship with the mother; it also gives depth and endurance.", cancellations: jupiterHelps(["Moon"]) ? ["Jupiter's influence softens it"] : [], grahas: ["Moon", "Saturn"], rituals: ["rudrabhishek"], practices: ["Offer water and milk to Shiva on Mondays", "Spend time in nature and keep good company"] });
  const nak = by("Moon").nakshatra.index;
  if (GANDMOOL.includes(nak)) out.push({ name: "Gandmool Nakshatra", severity: "low", text: `The Moon is in ${by("Moon").nakshatra.name}, one of the six Gandmool nakshatras at the junctions of water and fire signs. Tradition advises a shanti puja, usually on the 27th day after birth or when the Moon returns to this nakshatra.`, cancellations: [], grahas: [nak % 9 === 0 ? "Ketu" : "Mercury"], rituals: ["navagraha-shanti"], practices: [`Chant the ${nak % 9 === 0 ? "Ketu" : "Budha"} beej mantra on the nakshatra day each month`] });

  const neighbours = k.grahas.filter((g) => ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(g.name) && [1, 2, 12].includes(c.houseFromMoon(g)));
  if (!neighbours.length) {
    const kendraPlanet = k.grahas.some((g) => !["Moon", "Rahu", "Ketu"].includes(g.name) && KENDRA.includes(g.house));
    out.push({ name: "Kemadruma Dosha", severity: kendraPlanet ? "cancelled" : "medium", text: "No planets beside the Moon — periods of loneliness or financial struggle are possible.", cancellations: kendraPlanet ? ["Planets in kendras from the lagna cancel it"] : [], grahas: ["Moon"], rituals: ["rudrabhishek"], practices: ["Worship Shiva and Parvati on Mondays", "Wear white on Mondays and donate rice and milk"] });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Life areas

export type AreaId = "career" | "wealth" | "marriage" | "children" | "health" | "education" | "foreign" | "spirituality";
export type Rating = "excellent" | "favourable" | "mixed" | "challenging";

interface AreaDef {
  id: AreaId;
  title: string;
  houses: number[]; // the first is the main house
  karakas: string[];
  good: string;
  hard: string;
}

const AREAS: AreaDef[] = [
  { id: "career", title: "Career and status", houses: [10, 6], karakas: ["Sun", "Saturn"], good: "Work brings recognition and steady growth; you can rise to positions of responsibility.", hard: "Career needs patience — progress comes through persistence, skill-building and avoiding conflicts with seniors." },
  { id: "wealth", title: "Wealth and finances", houses: [2, 11], karakas: ["Jupiter"], good: "Good capacity to earn and accumulate; income grows with age.", hard: "Money comes and goes — budgeting, saving regularly and avoiding speculation protect your wealth." },
  { id: "marriage", title: "Marriage and relationships", houses: [7, 2], karakas: ["Venus"], good: "Supportive partnership and harmony in married life.", hard: "Marriage may be delayed or need extra understanding; patience, communication and kundli matching help." },
  { id: "children", title: "Children and creativity", houses: [5], karakas: ["Jupiter"], good: "Blessings of children and creative intelligence.", hard: "Children or progeny may come after delay or need care; Santan Gopal and Jupiter worship are traditional remedies." },
  { id: "health", title: "Health and vitality", houses: [1, 6], karakas: ["Sun"], good: "Strong constitution and good recovery power.", hard: "Health needs attention — regular routine, exercise and timely check-ups matter for you." },
  { id: "education", title: "Education and learning", houses: [4, 5], karakas: ["Mercury", "Jupiter"], good: "Sharp mind and success in studies.", hard: "Studies need disciplined effort; concentration practices and Saraswati worship help." },
  { id: "foreign", title: "Foreign lands and travel", houses: [12, 9], karakas: ["Rahu"], good: "Strong chances of travel, settlement or success abroad.", hard: "Foreign plans may meet obstacles or delays; they succeed with persistence." },
  { id: "spirituality", title: "Dharma and spirituality", houses: [9, 12], karakas: ["Jupiter", "Ketu"], good: "Natural inclination to dharma, the blessings of elders and the guru, and inner growth.", hard: "Faith may be tested; regular sadhana and service steady the mind." },
];

const CAREER_FIELDS: Record<string, string> = {
  Sun: "government, administration, politics, medicine and leadership roles",
  Moon: "hospitality, nursing, food, dairy, travel and public-facing work",
  Mars: "defence, police, engineering, surgery, real estate and sports",
  Mercury: "business, trade, accounting, IT, writing and communication",
  Jupiter: "teaching, law, finance, counselling, advisory and priestly work",
  Venus: "arts, design, fashion, media, entertainment and luxury goods",
  Saturn: "industry, manufacturing, mining, oil, justice, labour and service",
  Rahu: "technology, foreign companies, aviation, research and unconventional fields",
  Ketu: "research, healing, programming, spirituality and occult sciences",
};

export interface AreaReading {
  id: AreaId;
  title: string;
  rating: Rating;
  score: number;
  summary: string;
  factors: string[];
  fields?: string[];
  windows: EventWindow[];
}

function rate(score: number, hi = 3, mid = 1, lo = -1): Rating {
  return score >= hi ? "excellent" : score >= mid ? "favourable" : score >= lo ? "mixed" : "challenging";
}

function scoreArea(c: Ctx, def: AreaDef, gender?: string): { score: number; factors: string[] } {
  const { k, by, lordOf } = c;
  let score = 0;
  const factors: string[] = [];
  def.houses.forEach((h, i) => {
    const weight = i === 0 ? 1 : 0.5;
    const lord = by(lordOf(h));
    const st = strength(c, lord);
    score += st * weight;
    const d = dignity(lord);
    factors.push(`${ord(h)} lord ${lord.name} in the ${ord(lord.house)} house (${HOUSE_THEMES[lord.house - 1]})${d ? `, ${d}` : ""}${combust(k, lord) ? ", combust" : ""}`);
    for (const g of k.grahas.filter((x) => x.house === h && x.name !== lord.name)) {
      if (isBenefic(c, g.name)) {
        score += weight;
        factors.push(`${g.name} in the ${ord(h)} supports it`);
      } else if (isMalefic(c, g.name)) {
        const upa = UPACHAYA.includes(h);
        score += upa ? 0.5 * weight : -weight;
        factors.push(`${g.name} in the ${ord(h)} ${upa ? "gives drive here" : "creates pressure"}`);
      }
    }
    if (i === 0) {
      if (by("Jupiter").house !== h && aspects(by("Jupiter")).includes(h)) {
        score += 1;
        factors.push(`Jupiter aspects the ${ord(h)} — protection and grace`);
      }
      if (by("Saturn").house !== h && aspects(by("Saturn")).includes(h)) {
        score -= 0.5;
        factors.push(`Saturn aspects the ${ord(h)} — delays, then durable results`);
      }
    }
  });
  const karakas = def.id === "marriage" && gender === "female" ? ["Jupiter", "Venus"] : def.karakas;
  for (const n of karakas) {
    const g = by(n);
    score += strength(c, g) * 0.5;
    const d = dignity(g);
    if (d || DUSTHANA.includes(g.house)) factors.push(`Significator ${n} ${d ? `is ${d}` : `sits in the ${ord(g.house)}`}`);
  }
  return { score: Math.round(score * 10) / 10, factors };
}

function careerFields(c: Ctx): string[] {
  const names = [c.lordOf(10), ...c.k.grahas.filter((g) => g.house === 10).map((g) => g.name)];
  const tenthFromMoon = c.k.grahas.filter((g) => c.houseFromMoon(g) === 10).map((g) => g.name);
  return [...new Set([...names, ...tenthFromMoon])].slice(0, 3).map((n) => `${n}: ${CAREER_FIELDS[n]}`);
}

// ---------------------------------------------------------------------------
// Timing: dashas and the double transit of Jupiter and Saturn

export interface EventWindow {
  start: Date;
  end: Date;
  strength: "strong" | "moderate";
  why: string;
}

interface Step {
  t: number;
  maha: string;
  antar: string;
  jupiter: number;
  saturn: number;
}

const STEP_MS = 15 * 86400000;

function antarAt(k: Kundli, t: number): { maha: string; antar: string } | null {
  const maha = k.dashas.find((d) => d.start.getTime() <= t && d.end.getTime() > t);
  if (!maha) return null;
  const antar = antardashas(maha).find((a) => a.start.getTime() <= t && a.end.getTime() > t)!;
  return { maha: maha.lord, antar: antar.lord };
}

function steps(k: Kundli, now: Date, years: number): Step[] {
  const out: Step[] = [];
  for (let t = now.getTime(); t < now.getTime() + years * YEAR_MS; t += STEP_MS) {
    const d = antarAt(k, t);
    if (!d) continue;
    const date = new Date(t);
    out.push({ t, ...d, jupiter: rashiOf(siderealLongitude(Astronomy.Body.Jupiter, date)).index, saturn: rashiOf(siderealLongitude(Astronomy.Body.Saturn, date)).index });
  }
  return out;
}

const jupiterTouches = (from: number, target: number) => [0, 4, 6, 8].includes((target - from + 12) % 12);
const saturnTouches = (from: number, target: number) => [0, 2, 6, 9].includes((target - from + 12) % 12);

function windowsFor(c: Ctx, def: AreaDef, all: Step[]): EventWindow[] {
  const h = def.houses[0];
  const relevant = new Set([...def.houses.map(c.lordOf), ...c.k.grahas.filter((g) => def.houses.includes(g.house)).map((g) => g.name), ...def.karakas]);
  const targets = [(c.lagna + h - 1) % 12, (c.by("Moon").rashi.index + h - 1) % 12];
  const windows: EventWindow[] = [];
  let cur: (EventWindow & { last: number }) | null = null;
  for (const s of all) {
    const r = Number(relevant.has(s.maha)) + Number(relevant.has(s.antar));
    const dt = targets.some((x) => jupiterTouches(s.jupiter, x) && saturnTouches(s.saturn, x));
    // Classical timing: the dasha must promise the event and the double transit must trigger it.
    const level = dt && r >= 1 ? (r === 2 ? "strong" : "moderate") : null;
    const why = `${s.maha} dasha, ${s.antar} antardasha${dt ? `; Jupiter and Saturn together activate your ${ord(h)} house` : ""}`;
    if (level && cur && cur.why === why && s.t - cur.last <= STEP_MS) {
      cur.end = new Date(s.t + STEP_MS);
      cur.last = s.t;
      continue;
    }
    if (cur) windows.push(cur);
    cur = level ? { start: new Date(s.t), end: new Date(s.t + STEP_MS), strength: level, why, last: s.t } : null;
  }
  if (cur) windows.push(cur);
  return windows
    .filter((w) => w.end.getTime() - w.start.getTime() >= 60 * 86400000)
    .map(({ start, end, strength, why }) => ({ start, end, strength, why }))
    .slice(0, 4);
}

// ---------------------------------------------------------------------------
// Transits (gochar) of the slow planets

export interface Ingress {
  planet: "Jupiter" | "Saturn" | "Rahu";
  date: Date;
  sign: string;
  retrograde: boolean;
  fromMoon: number;
  fromLagna: number;
  effect: "good" | "mixed" | "hard";
  text: string;
}

function slowSign(planet: Ingress["planet"], t: number): number {
  const d = new Date(t);
  if (planet === "Rahu") return rashiOf(rahuLongitude(d)).index;
  return rashiOf(siderealLongitude(planet === "Jupiter" ? Astronomy.Body.Jupiter : Astronomy.Body.Saturn, d)).index;
}

function transitEffect(planet: Ingress["planet"], fromMoon: number): { effect: Ingress["effect"]; text: string } {
  const theme = HOUSE_THEMES[fromMoon - 1];
  if (planet === "Saturn") {
    if (fromMoon === 12) return { effect: "hard", text: "Sade Sati begins (first phase) — expenses, travel and restless sleep; plan finances carefully." };
    if (fromMoon === 1) return { effect: "hard", text: "Peak of Sade Sati — pressure on health and mind; patience, discipline and Hanuman worship carry you through." };
    if (fromMoon === 2) return { effect: "hard", text: "Last phase of Sade Sati — family and money matters need care; results of hard work begin to show." };
    if (fromMoon === 4) return { effect: "hard", text: "Kantaka Shani (Dhaiya) — domestic worries, property matters and the mother's health need attention." };
    if (fromMoon === 8) return { effect: "hard", text: "Ashtama Shani (Dhaiya) — obstacles and sudden changes; avoid risks and look after health." };
    if ([3, 6, 11].includes(fromMoon)) return { effect: "good", text: `Saturn in the ${ord(fromMoon)} from the Moon is one of its best transits — success over rivals, steady gains and results of past effort.` };
    return { effect: "mixed", text: `Saturn tests matters of ${theme}; steady, honest effort is rewarded.` };
  }
  if (planet === "Jupiter") {
    if ([2, 5, 7, 9, 11].includes(fromMoon)) return { effect: "good", text: `Jupiter's blessing on ${theme} — growth, good news and auspicious events.` };
    if ([8, 12].includes(fromMoon)) return { effect: "hard", text: `Jupiter in the ${ord(fromMoon)} from the Moon — expenses or setbacks around ${theme}; keep faith and spend wisely.` };
    return { effect: "mixed", text: `Jupiter is neutral in the ${ord(fromMoon)} from the Moon — learning and gradual progress in ${theme}.` };
  }
  if ([3, 6, 10, 11].includes(fromMoon)) return { effect: "good", text: `Rahu in the ${ord(fromMoon)} from the Moon gives ambition and unexpected gains through ${theme}.` };
  if ([1, 5, 8, 12].includes(fromMoon)) return { effect: "hard", text: `Rahu in the ${ord(fromMoon)} from the Moon can bring confusion or anxiety around ${theme}; avoid shortcuts.` };
  return { effect: "mixed", text: `Rahu stirs up matters of ${theme} — new desires and changes.` };
}

export function transitIngresses(k: Kundli, now = new Date(), years = 5): Ingress[] {
  const moon = k.grahas.find((g) => g.name === "Moon")!.rashi.index;
  const out: Ingress[] = [];
  const step = 5 * 86400000;
  for (const planet of ["Jupiter", "Saturn", "Rahu"] as const) {
    let prev = slowSign(planet, now.getTime());
    for (let t = now.getTime() + step; t <= now.getTime() + years * YEAR_MS; t += step) {
      const sign = slowSign(planet, t);
      if (sign === prev) continue;
      // Bisect to the day of the change.
      let lo = t - step, hi = t;
      while (hi - lo > 86400000) {
        const mid = (lo + hi) / 2;
        if (slowSign(planet, mid) === prev) lo = mid;
        else hi = mid;
      }
      const forward = (sign - prev + 12) % 12 === 1;
      const retrograde = planet === "Rahu" ? false : !forward;
      const fromMoon = ((sign - moon + 12) % 12) + 1;
      out.push({ planet, date: new Date(hi), sign: RASHIS[sign], retrograde, fromMoon, fromLagna: ((sign - k.lagna.rashi.index + 12) % 12) + 1, ...transitEffect(planet, fromMoon) });
      prev = sign;
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Where the slow planets are right now, from the Moon. */
export function currentTransits(k: Kundli, now = new Date()): Ingress[] {
  const moon = k.grahas.find((g) => g.name === "Moon")!.rashi.index;
  return (["Jupiter", "Saturn", "Rahu"] as const).map((planet) => {
    const sign = slowSign(planet, now.getTime());
    const fromMoon = ((sign - moon + 12) % 12) + 1;
    return { planet, date: now, sign: RASHIS[sign], retrograde: false, fromMoon, fromLagna: ((sign - k.lagna.rashi.index + 12) % 12) + 1, ...transitEffect(planet, fromMoon) };
  });
}

// ---------------------------------------------------------------------------
// Dasha forecast

const HOUSE_ACTIONS = [
  "health, self-improvement and fresh starts", "saving money and family matters", "bold initiatives, skills, writing and short trips",
  "property, vehicles and domestic peace", "studies, children, creativity and mantra sadhana", "competitive exams, clearing debts and beating rivals",
  "marriage, partnerships and contracts", "research and insurance — avoid speculation", "pilgrimage, higher studies and blessings of elders",
  "career moves and promotions", "networking, gains and fulfilling ambitions", "foreign travel, spiritual practice and controlling expenses",
];

export interface Period {
  maha: string;
  antar: string;
  start: Date;
  end: Date;
  rating: Rating;
  themes: string;
  advice: string;
  transits: Ingress[];
}

function ratePeriod(c: Ctx, maha: string, antar: string, at: Date): number {
  let s = functionalScore(c, antar) + 0.5 * functionalScore(c, maha) + 0.5 * strength(c, c.by(antar));
  if (antar !== maha && !["Rahu", "Ketu"].includes(maha)) {
    const rel = relationship(maha, antar);
    s += rel === "friend" ? 0.5 : rel === "enemy" ? -1 : 0;
  }
  const h = c.by(antar).house;
  if (h === 8 || h === 12) s -= 0.5;
  const moon = c.by("Moon").rashi.index;
  const sat = ((slowSign("Saturn", at.getTime()) - moon + 12) % 12) + 1;
  const jup = ((slowSign("Jupiter", at.getTime()) - moon + 12) % 12) + 1;
  if ([12, 1, 2, 4, 8].includes(sat)) s -= 0.5;
  if ([2, 5, 7, 9, 11].includes(jup)) s += 0.5;
  return s;
}

function periodThemes(c: Ctx, antar: string): { themes: string; houses: number[] } {
  const g = c.by(antar);
  const ruled = ["Rahu", "Ketu"].includes(antar) ? [] : c.ruled(antar);
  const houses = [...new Set([...ruled, g.house])];
  const rules = ruled.length ? `${antar} rules your ${list(ruled.map(ord))} and ` : `${antar} `;
  return { themes: `${rules}sits in your ${ord(g.house)} house — ${list(houses.map((h) => HOUSE_THEMES[h - 1]))} come forward.`, houses };
}

function adviceFor(rating: Rating, antar: string, houses: number[]): string {
  const focus = list(houses.slice(0, 2).map((h) => HOUSE_ACTIONS[h - 1]));
  if (rating === "excellent" || rating === "favourable") return `A good time for ${focus}. Act on opportunities and give thanks through ${antar === "Rahu" || antar === "Ketu" ? "charity" : `${antar}'s mantra`}.`;
  if (rating === "mixed") return `Progress with some effort; best used for ${focus}. Keep routines steady and avoid hasty decisions.`;
  return `Go slowly: avoid big risks, loans and quarrels. Daily ${antar} mantra japa and its daan soften this period; matters of ${focus} need care.`;
}

export function forecast(k: Kundli, now = new Date(), years = 5, ingresses = transitIngresses(k, now, years)): Period[] {
  const c = context(k);
  const end = now.getTime() + years * YEAR_MS;
  const out: Period[] = [];
  for (const maha of k.dashas) {
    if (maha.end.getTime() <= now.getTime() || maha.start.getTime() >= end) continue;
    for (const a of antardashas(maha)) {
      if (a.end.getTime() <= now.getTime() || a.start.getTime() >= end) continue;
      const start = new Date(Math.max(a.start.getTime(), now.getTime()));
      const mid = new Date((start.getTime() + Math.min(a.end.getTime(), end)) / 2);
      const rating = rate(ratePeriod(c, maha.lord, a.lord, mid), 3, 0.75, -0.75);
      const { themes, houses } = periodThemes(c, a.lord);
      out.push({ maha: maha.lord, antar: a.lord, start: a.start, end: a.end, rating, themes, advice: adviceFor(rating, a.lord, houses), transits: ingresses.filter((i) => i.date >= start && i.date < a.end) });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Remedies

export interface RemedyPlan {
  graha: string;
  devanagari: string;
  purpose: "pacify" | "strengthen";
  priority: 1 | 2 | 3;
  reasons: string[];
  mantra: { devanagari: string; iast: string };
  japa: number;
  day: string;
  daan: string;
  vrat: string;
  rudraksha: string;
  gem?: string;
  rituals: string[];
}

const GRAHA_RITUALS: Record<string, string[]> = {
  Sun: ["navagraha-shanti", "sandhya"], Moon: ["rudrabhishek"], Mars: ["mangal-dosh", "hanuman-sundarkand"], Mercury: ["navagraha-shanti", "ganesh-puja"],
  Jupiter: ["satyanarayan"], Venus: ["lakshmi-puja"], Saturn: ["shani-shanti", "hanuman-sundarkand"], Rahu: ["kaal-sarp", "navagraha-shanti"], Ketu: ["ganesh-puja", "navagraha-shanti"],
};

export function remedyPlan(k: Kundli, doshas: Dosha[], now = new Date()): RemedyPlan[] {
  const c = context(k);
  const plans = new Map<string, RemedyPlan>();
  const add = (graha: string, purpose: RemedyPlan["purpose"], priority: RemedyPlan["priority"], reason: string) => {
    const existing = plans.get(graha);
    if (existing) {
      existing.priority = Math.min(existing.priority, priority) as RemedyPlan["priority"];
      if (purpose === "pacify") existing.purpose = "pacify";
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
      return;
    }
    const g = getGraha(graha);
    const ruled = ["Rahu", "Ketu"].includes(graha) ? [] : c.ruled(graha);
    // Gems strengthen a planet, so they are only for functional benefics: lords of the lagna, 5th or 9th.
    const gemOk = purpose === "strengthen" && ruled.some((h) => [1, 5, 9].includes(h)) && !ruled.some((h) => (h === 6 || h === 12 || (h === 8 && !ruled.includes(1))));
    plans.set(graha, {
      graha, devanagari: g.devanagari, purpose, priority, reasons: [reason],
      mantra: { devanagari: g.beej.devanagari, iast: g.beej.iast }, japa: g.japaCount, day: g.day, daan: g.daan,
      vrat: `${g.day} vrat${graha === "Rahu" || graha === "Ketu" ? ` (for ${graha}, with ${graha === "Rahu" ? "Durga" : "Ganesha"} worship)` : ""}`,
      rudraksha: RUDRAKSHA[graha],
      gem: gemOk ? `${g.gem} — only after a trial period and an astrologer's confirmation; never for a planet ruling the 6th, 8th or 12th` : undefined,
      rituals: GRAHA_RITUALS[graha] ?? [],
    });
  };

  const current = antarAt(k, now.getTime());
  if (current) {
    for (const [lord, label] of [[current.maha, "mahadasha"], [current.antar, "antardasha"]] as const) {
      const f = functionalScore(c, lord);
      const s = strength(c, c.by(lord));
      if (f < 0 || s < -0.5) add(lord, "pacify", 1, `Running ${label} lord, difficult for your chart`);
      else if (s < 0.5) add(lord, "strengthen", 2, `Running ${label} lord is helpful but weak`);
    }
  }
  for (const d of doshas) {
    if (d.severity === "cancelled") continue;
    for (const g of d.grahas) add(g, "pacify", d.severity === "high" ? 1 : d.severity === "medium" ? 2 : 3, d.name);
  }
  const lagnaLord = c.lordOf(1);
  if (strength(c, c.by(lagnaLord)) < 0.5) add(lagnaLord, "strengthen", 2, "Lagna lord (your vitality and direction) needs strength");
  for (const h of [5, 9]) {
    const lord = c.lordOf(h);
    if (strength(c, c.by(lord)) < 0 && functionalScore(c, lord) > 0) add(lord, "strengthen", 3, `${ord(h)} lord (${HOUSE_THEMES[h - 1]}) is weak`);
  }
  return [...plans.values()].sort((a, b) => a.priority - b.priority);
}

// ---------------------------------------------------------------------------
// The full prediction

export interface Prediction {
  yogas: Yoga[];
  doshas: Dosha[];
  areas: AreaReading[];
  current: (Period & { transits: Ingress[] }) | null;
  periods: Period[];
  ingresses: Ingress[];
  transitsNow: Ingress[];
  remedies: RemedyPlan[];
  practices: string[];
  summary: string;
}

const AREA_SHORT: Record<AreaId, string> = { career: "career", wealth: "wealth", marriage: "marriage", children: "children", health: "health", education: "education", foreign: "foreign travel", spirituality: "spiritual life" };

export const AREA_IDS = AREAS.map((a) => a.id);
export const AREA_TITLES = Object.fromEntries(AREAS.map((a) => [a.id, a.title])) as Record<AreaId, string>;

export function predict(k: Kundli, opts: { gender?: string } = {}, now = new Date()): Prediction {
  const c = context(k);
  const all = steps(k, now, 10);
  const areas: AreaReading[] = AREAS.map((def) => {
    const { score, factors } = scoreArea(c, def, opts.gender);
    const rating = rate(score);
    return {
      id: def.id, title: def.title, rating, score, factors,
      summary: rating === "excellent" || rating === "favourable" ? def.good : def.hard,
      fields: def.id === "career" ? careerFields(c) : undefined,
      windows: windowsFor(c, def, all),
    };
  });
  const yogas = findYogas(k);
  const doshas = findDoshas(k, now);
  const ingresses = transitIngresses(k, now, 5);
  const periods = forecast(k, now, 5, ingresses);
  const transitsNow = currentTransits(k, now);
  const cur = periods.find((p) => p.start <= now && p.end > now) ?? null;
  const current = cur && { ...cur, transits: transitsNow };
  const practices = [...new Set(doshas.filter((d) => d.severity !== "cancelled").flatMap((d) => d.practices))];
  practices.push("Daily: light a diya at sunrise or sunset and chant the Gayatri mantra 11 times", "Respect parents and elders and serve cows, birds and the needy — the simplest remedy for every graha");

  const best = areas.filter((a) => a.rating === "excellent" || a.rating === "favourable").map((a) => AREA_SHORT[a.id]);
  const care = areas.filter((a) => a.rating === "challenging").map((a) => AREA_SHORT[a.id]);
  const majorYogas = yogas.filter((y) => y.kind !== "other").map((y) => y.name);
  const activeDoshas = doshas.filter((d) => d.severity !== "cancelled").map((d) => d.name);
  const summary = [
    best.length ? `Your strongest areas are ${list(best)}.` : "",
    care.length ? `${list(care).replace(/^./, (s) => s.toUpperCase())} need${care.length === 1 ? "s" : ""} the most care.` : "",
    majorYogas.length ? `Notable yogas: ${list([...new Set(majorYogas)].slice(0, 4))}.` : "",
    activeDoshas.length ? `Doshas to address: ${list(activeDoshas)}.` : "No major dosha is active.",
    current ? `You are now in ${current.maha} mahadasha and ${current.antar} antardasha (until ${fmt(current.end)}) — a ${current.rating} period.` : "",
  ].filter(Boolean).join(" ");

  return { yogas, doshas, areas, current, periods, ingresses, transitsNow, remedies: remedyPlan(k, doshas, now), practices, summary };
}

export { fmt as formatMonth };
