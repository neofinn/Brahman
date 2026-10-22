// A rule-based Parashari reading of a computed kundli — works entirely offline.
import * as Astronomy from "astronomy-engine";
import { RASHIS, formatDegrees, rashiOf, siderealLongitude, type GrahaPosition, type Kundli } from "./jyotish.ts";
import { getGraha } from "./grahas.ts";

export interface Section {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface Remedy {
  graha: string;
  reason: string;
}

export interface Reading {
  summary: string;
  sections: Section[];
  remedies: Remedy[];
  /** Ids of ritual guides (lib/kriyas.ts) that suit this chart. */
  rituals: string[];
}

// ---------------------------------------------------------------------------
// Reference tables

const SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const ELEMENTS = ["Fire", "Earth", "Air", "Water"];
const QUALITIES = ["movable (chara)", "fixed (sthira)", "dual (dvisvabhava)"];

const SIGN_NATURE = [
  "energetic, pioneering and direct; a natural initiator who acts quickly, loves challenges and must learn patience",
  "steady, patient and sensual; values security, beauty, good food and lasting relationships, and can be stubborn",
  "curious, witty and communicative; quick-minded and versatile, loves learning and conversation, and can scatter energy",
  "caring, intuitive and protective; deeply attached to home, mother and family, emotionally sensitive and nurturing",
  "dignified, generous and confident; a natural leader with a big heart who seeks recognition and loyalty",
  "analytical, practical and service-minded; attentive to detail, health and order, and can be self-critical",
  "balanced, charming and diplomatic; values harmony, fairness, partnership and the arts",
  "intense, determined and private; probing and resilient, with strong emotions and a capacity for transformation",
  "optimistic, principled and freedom-loving; drawn to dharma, philosophy, teaching, travel and higher learning",
  "disciplined, ambitious and responsible; patient and hard-working, builds slowly and achieves through perseverance",
  "independent, humanitarian and inventive; thinks for the collective, values friendship, reform and new ideas",
  "compassionate, imaginative and spiritual; gentle and selfless, drawn to devotion, art and solitude",
];

const HOUSES = [
  "self, body, personality and overall direction of life",
  "wealth, family, speech, food and early education",
  "courage, siblings, communication, short journeys and skills",
  "mother, home, property, vehicles, comforts and inner peace",
  "children, intelligence, creativity, mantras and past-life merit (purva punya)",
  "enemies, debts, disease, competition and service",
  "marriage, spouse, partnerships and business",
  "longevity, sudden events, inheritance, secrets and occult knowledge",
  "dharma, father, guru, fortune (bhagya), pilgrimage and higher learning",
  "career, status, karma and public life",
  "gains, income, ambitions, elder siblings and friends",
  "expenses, losses, foreign lands, sleep, renunciation and moksha",
];

const EXALTED: Record<string, number> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
const OWN: Record<string, number[]> = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
const NATURAL_BENEFICS = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);

interface NakshatraInfo {
  deity: string;
  symbol: string;
  gana: "Deva" | "Manushya" | "Rakshasa";
  syllables: string[];
  nature: string;
}

const NAKSHATRA_INFO: NakshatraInfo[] = [
  { deity: "the Ashvini Kumaras", symbol: "horse's head", gana: "Deva", syllables: ["चू", "चे", "चो", "ला"], nature: "swift, healing and helpful; quick to start things" },
  { deity: "Yama", symbol: "yoni", gana: "Manushya", syllables: ["ली", "लू", "ले", "लो"], nature: "strong-willed, responsible and capable of bearing great burdens" },
  { deity: "Agni", symbol: "razor / flame", gana: "Rakshasa", syllables: ["अ", "ई", "उ", "ए"], nature: "sharp, purifying and courageous; outspoken and determined" },
  { deity: "Brahma (Prajapati)", symbol: "chariot", gana: "Manushya", syllables: ["ओ", "वा", "वी", "वू"], nature: "creative, attractive and fond of comfort and beauty" },
  { deity: "Soma", symbol: "deer's head", gana: "Deva", syllables: ["वे", "वो", "का", "की"], nature: "gentle, curious and searching; a seeker" },
  { deity: "Rudra", symbol: "teardrop", gana: "Manushya", syllables: ["कू", "घ", "ङ", "छ"], nature: "intense, analytical and transformative through struggle" },
  { deity: "Aditi", symbol: "quiver of arrows", gana: "Deva", syllables: ["के", "को", "हा", "ही"], nature: "generous, forgiving and resilient — always able to begin again" },
  { deity: "Brihaspati", symbol: "cow's udder / flower", gana: "Deva", syllables: ["हू", "हे", "हो", "डा"], nature: "nourishing, dutiful and devoted; among the most auspicious nakshatras" },
  { deity: "the Nagas", symbol: "coiled serpent", gana: "Rakshasa", syllables: ["डी", "डू", "डे", "डो"], nature: "perceptive, mystical and strategic" },
  { deity: "the Pitrs (ancestors)", symbol: "royal throne", gana: "Rakshasa", syllables: ["मा", "मी", "मू", "मे"], nature: "dignified and proud of lineage; honours tradition and ancestors" },
  { deity: "Bhaga", symbol: "front legs of a cot", gana: "Manushya", syllables: ["मो", "टा", "टी", "टू"], nature: "pleasure-loving, warm, artistic and sociable" },
  { deity: "Aryaman", symbol: "back legs of a cot", gana: "Manushya", syllables: ["टे", "टो", "पा", "पी"], nature: "reliable, kind and committed to friendship and contracts" },
  { deity: "Savitr", symbol: "hand", gana: "Deva", syllables: ["पू", "ष", "ण", "ठ"], nature: "skilful, resourceful and clever with the hands" },
  { deity: "Tvashtr (Vishvakarma)", symbol: "bright jewel", gana: "Rakshasa", syllables: ["पे", "पो", "रा", "री"], nature: "creative, elegant and a builder of beautiful things" },
  { deity: "Vayu", symbol: "young sprout in the wind", gana: "Deva", syllables: ["रू", "रे", "रो", "ता"], nature: "independent, flexible and good in trade" },
  { deity: "Indra and Agni", symbol: "triumphal arch", gana: "Rakshasa", syllables: ["ती", "तू", "ते", "तो"], nature: "goal-oriented, ambitious and persistent" },
  { deity: "Mitra", symbol: "lotus", gana: "Deva", syllables: ["ना", "नी", "नू", "ने"], nature: "devoted, friendly and successful away from home" },
  { deity: "Indra", symbol: "earring / umbrella", gana: "Rakshasa", syllables: ["नो", "या", "यी", "यू"], nature: "protective, responsible and a natural elder" },
  { deity: "Nirriti", symbol: "bunch of roots", gana: "Rakshasa", syllables: ["ये", "यो", "भा", "भी"], nature: "probing, philosophical and drawn to the root of things" },
  { deity: "Apas (the waters)", symbol: "winnowing basket / fan", gana: "Manushya", syllables: ["भू", "धा", "फा", "ढा"], nature: "invincible in spirit, persuasive and proud" },
  { deity: "the Vishvedevas", symbol: "elephant's tusk", gana: "Manushya", syllables: ["भे", "भो", "जा", "जी"], nature: "righteous, principled and achieves lasting victory" },
  { deity: "Vishnu", symbol: "ear / three footprints", gana: "Deva", syllables: ["खी", "खू", "खे", "खो"], nature: "a good listener and learner; devoted and wise" },
  { deity: "the eight Vasus", symbol: "drum (damaru)", gana: "Rakshasa", syllables: ["गा", "गी", "गू", "गे"], nature: "musical, prosperous and generous" },
  { deity: "Varuna", symbol: "empty circle", gana: "Rakshasa", syllables: ["गो", "सा", "सी", "सू"], nature: "independent, secretive and a healer" },
  { deity: "Aja Ekapada", symbol: "front of a funeral cot / sword", gana: "Manushya", syllables: ["से", "सो", "दा", "दी"], nature: "intense, idealistic and capable of great sacrifice" },
  { deity: "Ahir Budhnya", symbol: "back of a funeral cot / twins", gana: "Manushya", syllables: ["दू", "थ", "झ", "ञ"], nature: "wise, calm, self-controlled and charitable" },
  { deity: "Pushan", symbol: "fish / drum", gana: "Deva", syllables: ["दे", "दो", "चा", "ची"], nature: "nurturing, gentle and a protector of travellers" },
];

// Nadi cycles Adi–Madhya–Antya–Antya–Madhya–Adi through the nakshatras.
const NADI_PATTERN = [0, 1, 2, 2, 1, 0];
const NADIS = ["Adi", "Madhya", "Antya"];
export function nadiOf(nakshatraIndex: number): string {
  return NADIS[NADI_PATTERN[nakshatraIndex % 6]];
}
export function ganaOf(nakshatraIndex: number): string {
  return NAKSHATRA_INFO[nakshatraIndex].gana;
}
export function namingSyllable(nakshatraIndex: number, pada: number): string {
  return NAKSHATRA_INFO[nakshatraIndex].syllables[pada - 1];
}

const DASHA_YEARS: Record<string, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

const DASHA_THEMES: Record<string, string> = {
  Sun: "a period of authority, recognition and self-assertion; dealings with government, father and leadership come to the fore",
  Moon: "a period centred on home, mother, emotions and public relations; the mind is sensitive, so peace of mind is the key",
  Mars: "a period of energy, courage and action — property, land, sports, technical work and siblings; guard against anger and accidents",
  Mercury: "a period of learning, communication, business and travel; good for study, writing, trade and friendships",
  Jupiter: "a period of growth, wisdom and good fortune — children, teachers, dharma, marriage and wealth tend to flourish",
  Venus: "a long period of comforts, relationships, arts, vehicles and prosperity; marriage and pleasures are highlighted",
  Saturn: "a long period of discipline and hard work; slow but lasting results, responsibilities and lessons in patience",
  Rahu: "a period of ambition and unconventional opportunities — foreign connections, technology and sudden rises; beware illusion and shortcuts",
  Ketu: "a period of detachment and inner growth; spirituality, research and letting go are favoured over worldly gains",
};

const KAAL_SARP_NAMES = ["Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma", "Takshak", "Karkotak", "Shankhachud", "Ghatak", "Vishdhar", "Sheshnag"];

// ---------------------------------------------------------------------------

const norm360 = (x: number) => ((x % 360) + 360) % 360;
const ordinal = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;
const YEAR_MS = 365.2425 * 86400000;
const fmt = (d: Date) => new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(d);

export function dignity(g: GrahaPosition): "exalted" | "debilitated" | "own sign" | null {
  if (EXALTED[g.name] === g.rashi.index) return "exalted";
  if (EXALTED[g.name] !== undefined && (EXALTED[g.name] + 6) % 12 === g.rashi.index) return "debilitated";
  if (OWN[g.name]?.includes(g.rashi.index)) return "own sign";
  return null;
}

/** Houses (1-based, whole-sign) aspected by a graha placed in `house`. */
function aspects(g: GrahaPosition): number[] {
  const offsets = [7];
  if (g.name === "Mars") offsets.push(4, 8);
  if (g.name === "Jupiter" || g.name === "Rahu" || g.name === "Ketu") offsets.push(5, 9);
  if (g.name === "Saturn") offsets.push(3, 10);
  return offsets.map((o) => ((g.house - 1 + o - 1) % 12) + 1);
}

export interface Antardasha {
  lord: string;
  start: Date;
  end: Date;
}

export function antardashas(maha: { lord: string; start: Date; end: Date }): Antardasha[] {
  const first = DASHA_ORDER.indexOf(maha.lord);
  const result: Antardasha[] = [];
  let cursor = maha.start.getTime();
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(first + i) % 9];
    const end = cursor + ((DASHA_YEARS[maha.lord] * DASHA_YEARS[lord]) / 120) * YEAR_MS;
    result.push({ lord, start: new Date(cursor), end: new Date(end) });
    cursor = end;
  }
  return result;
}

/** Sade Sati windows (Saturn in the 12th, 1st or 2nd sign from the Moon) around `now`. */
export function sadeSati(moonRashi: number, now: Date): { start: Date; end: Date; phase: number | null } | null {
  const step = 15 * 86400000;
  const from = now.getTime() - 9 * YEAR_MS;
  const to = now.getTime() + 32 * YEAR_MS;
  const spans: { start: number; end: number }[] = [];
  let open: number | null = null;
  for (let t = from; t <= to; t += step) {
    const sign = rashiOf(siderealLongitude(Astronomy.Body.Saturn, new Date(t))).index;
    const inside = [(moonRashi + 11) % 12, moonRashi, (moonRashi + 1) % 12].includes(sign);
    if (inside && open === null) open = t;
    if (!inside && open !== null) {
      spans.push({ start: open, end: t });
      open = null;
    }
  }
  if (open !== null) spans.push({ start: open, end: to });
  // Merge brief retrograde exits (under 18 months) into one window.
  const merged: typeof spans = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.start - last.end < 1.5 * YEAR_MS) last.end = s.end;
    else merged.push({ ...s });
  }
  const t = now.getTime();
  const span = merged.find((s) => s.end > t && s.start > from);
  if (!span) return null;
  let phase: number | null = null;
  if (span.start <= t) {
    const sign = rashiOf(siderealLongitude(Astronomy.Body.Saturn, now)).index;
    phase = sign === (moonRashi + 11) % 12 ? 1 : sign === moonRashi ? 2 : sign === (moonRashi + 1) % 12 ? 3 : null;
  }
  return { start: new Date(span.start), end: new Date(span.end), phase };
}

export function kaalSarp(k: Kundli): string | null {
  const rahu = k.grahas.find((g) => g.name === "Rahu")!;
  const seven = k.grahas.filter((g) => g.name !== "Rahu" && g.name !== "Ketu");
  const offsets = seven.map((g) => norm360(g.longitude - rahu.longitude));
  const oneSide = offsets.every((d) => d < 180) || offsets.every((d) => d > 180);
  return oneSide ? KAAL_SARP_NAMES[rahu.house - 1] : null;
}

export function mangalDosha(k: Kundli): { present: boolean; from: string[]; cancellations: string[] } {
  const mars = k.grahas.find((g) => g.name === "Mars")!;
  const moon = k.grahas.find((g) => g.name === "Moon")!;
  const jupiter = k.grahas.find((g) => g.name === "Jupiter")!;
  const DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];
  const fromLagna = DOSHA_HOUSES.includes(mars.house);
  const fromMoonHouse = ((mars.rashi.index - moon.rashi.index + 12) % 12) + 1;
  const fromMoon = DOSHA_HOUSES.includes(fromMoonHouse);
  const from = [fromLagna && "lagna", fromMoon && "Moon"].filter(Boolean) as string[];
  const cancellations: string[] = [];
  const d = dignity(mars);
  if (d === "own sign" || d === "exalted") cancellations.push(`Mars is ${d === "own sign" ? "in its own sign" : "exalted"} (${mars.rashi.name})`);
  if (jupiter.rashi.index === mars.rashi.index || aspects(jupiter).includes(mars.house)) cancellations.push("Jupiter conjoins or aspects Mars");
  if (moon.rashi.index === mars.rashi.index) cancellations.push("Moon is with Mars (Chandra-Mangala yoga)");
  return { present: from.length > 0, from, cancellations };
}

function yogas(k: Kundli): string[] {
  const by = (n: string) => k.grahas.find((g) => g.name === n)!;
  const moon = by("Moon");
  const found: string[] = [];
  const fromMoon = (g: GrahaPosition) => ((g.rashi.index - moon.rashi.index + 12) % 12) + 1;

  if ([1, 4, 7, 10].includes(fromMoon(by("Jupiter")))) {
    found.push("Gajakesari Yoga — Jupiter in a kendra from the Moon: wisdom, reputation and the ability to overcome difficulties.");
  }
  if (by("Sun").rashi.index === by("Mercury").rashi.index) {
    found.push("Budhaditya Yoga — Sun with Mercury: sharp intellect, good communication and success in learning.");
  }
  if (moon.rashi.index === by("Mars").rashi.index) {
    found.push("Chandra-Mangala Yoga — Moon with Mars: enterprise and earning ability, with a need to manage impulsiveness.");
  }
  const MAHAPURUSHA: Record<string, string> = { Mars: "Ruchaka (courage, leadership)", Mercury: "Bhadra (intelligence, eloquence)", Jupiter: "Hamsa (righteousness, wisdom)", Venus: "Malavya (charm, comforts, arts)", Saturn: "Shasha (authority, discipline)" };
  for (const [name, label] of Object.entries(MAHAPURUSHA)) {
    const g = by(name);
    const d = dignity(g);
    if ([1, 4, 7, 10].includes(g.house) && (d === "own sign" || d === "exalted")) {
      found.push(`${label.split(" ")[0]} Mahapurusha Yoga — ${name} ${d} in a kendra: ${label.slice(label.indexOf("(") + 1, -1)}.`);
    }
  }
  // Raja yoga: a kendra lord joined with a trikona lord.
  const lordOf = (house: number) => SIGN_LORDS[(k.lagna.rashi.index + house - 1) % 12];
  const kendraLords = new Set([1, 4, 7, 10].map(lordOf));
  const trikonaLords = new Set([1, 5, 9].map(lordOf));
  const rajPairs = new Set<string>();
  for (const a of kendraLords) {
    for (const b of trikonaLords) {
      if (a !== b && by(a).rashi.index === by(b).rashi.index) rajPairs.add([a, b].sort().join(" and "));
    }
  }
  for (const p of rajPairs) found.push(`Raja Yoga — ${p}, lords of a kendra and a trikona, are together: rise in status and success.`);
  // Dhana yoga: lords of 2 or 11 with lords of 5 or 9.
  const wealth = new Set([2, 11].map(lordOf));
  const fortune = new Set([5, 9].map(lordOf));
  for (const a of wealth) {
    for (const b of fortune) {
      if (a !== b && by(a).rashi.index === by(b).rashi.index) {
        found.push(`Dhana Yoga — ${a} and ${b} (wealth and fortune lords) are together: good potential for prosperity.`);
      }
    }
  }
  const neighbours = k.grahas.filter((g) => ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(g.name) && [1, 2, 12].includes(fromMoon(g)));
  if (neighbours.length === 0) {
    found.push("Kemadruma Yoga — no planets beside the Moon: periods of loneliness or struggle are possible; it is softened by a strong Moon or planets in kendras, and countered by worship of Shiva and Parvati.");
  }
  return found;
}

// ---------------------------------------------------------------------------

export function readKundli(k: Kundli, now = new Date()): Reading {
  const by = (n: string) => k.grahas.find((g) => g.name === n)!;
  const moon = by("Moon");
  const lagnaIdx = k.lagna.rashi.index;
  const lagnaLordName = SIGN_LORDS[lagnaIdx];
  const lagnaLord = by(lagnaLordName);
  const nak = NAKSHATRA_INFO[moon.nakshatra.index];
  const remedies: Remedy[] = [];
  const rituals = new Set<string>();
  const sections: Section[] = [];

  sections.push({
    title: `Lagna (Ascendant): ${RASHIS[lagnaIdx]}`,
    paragraphs: [
      `Your rising sign is ${RASHIS[lagnaIdx]} (${ELEMENTS[lagnaIdx % 4]}, ${QUALITIES[lagnaIdx % 3]}), ruled by ${lagnaLordName}. By temperament you are ${SIGN_NATURE[lagnaIdx]}.`,
      `The lagna lord ${lagnaLordName} sits in ${lagnaLord.rashi.name} in the ${ordinal(lagnaLord.house)} house, so life naturally gravitates towards ${HOUSES[lagnaLord.house - 1]}.${
        dignity(lagnaLord) ? ` It is ${dignity(lagnaLord)} there, which ${dignity(lagnaLord) === "debilitated" ? "calls for strengthening through its mantra and charity" : "strengthens health, confidence and success"}.` : ""
      }`,
    ],
  });

  sections.push({
    title: `Rashi (Moon sign) and Nakshatra`,
    paragraphs: [
      `Your Moon is in ${moon.rashi.name}, so emotionally you are ${SIGN_NATURE[moon.rashi.index]}. In Vedic astrology the Moon sign is your rashi — use it for daily horoscopes and transits.`,
      `Janma nakshatra: ${moon.nakshatra.name}, pada ${moon.nakshatra.pada}, ruled by ${moon.nakshatra.lord}. Its deity is ${nak.deity}; its symbol, the ${nak.symbol}. People of this nakshatra are ${nak.nature}.`,
    ],
    bullets: [
      `Naam akshar (auspicious first syllable for a name): ${namingSyllable(moon.nakshatra.index, moon.nakshatra.pada)}`,
      `Gana: ${nak.gana} · Nadi: ${nadiOf(moon.nakshatra.index)} · Nakshatra lord: ${moon.nakshatra.lord}`,
      `Ruler of your rashi: ${SIGN_LORDS[moon.rashi.index]}`,
    ],
  });

  sections.push({
    title: "Grahas in your houses",
    paragraphs: ["Each graha colours the area of life (bhava) it occupies:"],
    bullets: k.grahas.map((g) => {
      const info = getGraha(g.name);
      const d = dignity(g);
      const strength = d === "exalted" ? " — exalted, very strong" : d === "own sign" ? " — in its own sign, strong" : d === "debilitated" ? " — debilitated, needs support" : "";
      const retro = g.retrograde && g.name !== "Rahu" && g.name !== "Ketu" ? " (retrograde: its results come with reflection and delay)" : "";
      const label = g.sanskrit === g.name ? g.name : `${g.name} (${g.sanskrit})`;
      return `${label} in ${g.rashi.name}, ${ordinal(g.house)} house${strength}${retro}: brings ${info.signifies} into the sphere of ${HOUSES[g.house - 1]}.`;
    }),
  });

  const ys = yogas(k);
  sections.push({
    title: "Yogas",
    paragraphs: ys.length ? ["These planetary combinations stand out in your chart:"] : ["No major classical yogas from the common list were found; the chart works through its individual placements and dashas."],
    bullets: ys,
  });

  // Doshas
  const doshaBullets: string[] = [];
  const mangal = mangalDosha(k);
  if (mangal.present) {
    if (mangal.cancellations.length) {
      doshaBullets.push(`Mangal dosha is present from the ${mangal.from.join(" and ")}, but it is largely cancelled because ${mangal.cancellations.join("; ")}.`);
    } else {
      doshaBullets.push(`Mangal (Kuja) dosha: Mars is in the ${ordinal(by("Mars").house)} house from the lagna${mangal.from.includes("Moon") ? " and in a dosha house from the Moon" : ""}. In marriage matching this is balanced when the partner also has it. Remedies: Hanuman worship on Tuesdays and the Mangal mantra.`);
      remedies.push({ graha: "Mars", reason: "Mangal dosha" });
      rituals.add("mangal-dosh");
    }
  } else {
    doshaBullets.push("No Mangal dosha: Mars is not in the 1st, 2nd, 4th, 7th, 8th or 12th from the lagna or Moon.");
  }
  const ks = kaalSarp(k);
  if (ks) {
    doshaBullets.push(`${ks} Kaal Sarp yoga: all seven grahas lie on one side of the Rahu–Ketu axis. Its effects are debated (it is not in the classical Parashari texts); worship of Shiva and the Nagas brings peace.`);
    remedies.push({ graha: "Rahu", reason: "Kaal Sarp yoga" });
    rituals.add("kaal-sarp");
  } else {
    doshaBullets.push("No Kaal Sarp yoga.");
  }
  const ss = sadeSati(moon.rashi.index, now);
  if (ss) {
    if (ss.start <= now) {
      const phases = ["", "first (rising) phase — Saturn in the 12th from the Moon", "second (peak) phase — Saturn over the Moon", "third (setting) phase — Saturn in the 2nd from the Moon"];
      doshaBullets.push(`Shani Sade Sati is running now (${fmt(ss.start)} – ${fmt(ss.end)}), in its ${phases[ss.phase ?? 2]}. It brings responsibility, hard lessons and maturity; honest effort is rewarded.`);
      remedies.push({ graha: "Saturn", reason: "Sade Sati" });
      rituals.add("shani-shanti");
    } else {
      doshaBullets.push(`Next Shani Sade Sati: ${fmt(ss.start)} – ${fmt(ss.end)}.`);
    }
  }
  const saturnNow = rashiOf(siderealLongitude(Astronomy.Body.Saturn, now)).index;
  const fromMoonNow = ((saturnNow - moon.rashi.index + 12) % 12) + 1;
  if (fromMoonNow === 4 || fromMoonNow === 8) {
    doshaBullets.push(`Shani Dhaiya (Kantaka Shani) is running: Saturn is transiting the ${ordinal(fromMoonNow)} sign from your Moon.`);
    remedies.push({ graha: "Saturn", reason: "Shani Dhaiya" });
    rituals.add("shani-shanti");
  }
  sections.push({ title: "Doshas", paragraphs: [], bullets: doshaBullets });

  // Dashas
  const t = now.getTime();
  const maha = k.dashas.find((d) => d.start.getTime() <= t && t < d.end.getTime());
  if (maha) {
    const antar = antardashas(maha).find((a) => a.start.getTime() <= t && t < a.end.getTime());
    const next = k.dashas[k.dashas.indexOf(maha) + 1];
    const mahaGraha = by(maha.lord);
    sections.push({
      title: `Current dasha: ${maha.lord} mahadasha`,
      paragraphs: [
        `You are in the ${maha.lord} mahadasha (${fmt(maha.start)} – ${fmt(maha.end)}): ${DASHA_THEMES[maha.lord]}. ${maha.lord} sits in your ${ordinal(mahaGraha.house)} house, so ${HOUSES[mahaGraha.house - 1]} are emphasised during this time.`,
        antar
          ? antar.lord === maha.lord
            ? `It begins with its own sub-period (${maha.lord}–${maha.lord} antardasha) until ${fmt(antar.end)}, when its results are most concentrated.`
            : `Within it, the ${antar.lord} antardasha runs until ${fmt(antar.end)}, adding a flavour of ${DASHA_THEMES[antar.lord].split(";")[0].replace(/^a (long )?period (centred on|of) /, "")}.`
          : "",
        next ? `Next mahadasha: ${next.lord} from ${fmt(next.start)}.` : "",
      ].filter(Boolean),
    });
    const d = dignity(mahaGraha);
    if (d === "debilitated" || [6, 8, 12].includes(mahaGraha.house) || ["Saturn", "Rahu", "Ketu"].includes(maha.lord)) {
      remedies.push({ graha: maha.lord, reason: `current mahadasha lord${d === "debilitated" ? " (debilitated)" : [6, 8, 12].includes(mahaGraha.house) ? ` (in the ${ordinal(mahaGraha.house)} house)` : ""}` });
    }
  }

  // Weak planets
  for (const g of k.grahas) {
    if (dignity(g) === "debilitated" && !remedies.some((r) => r.graha === g.name)) {
      remedies.push({ graha: g.name, reason: `debilitated in ${g.rashi.name}` });
    }
  }
  if ([6, 8, 12].includes(lagnaLord.house) && !remedies.some((r) => r.graha === lagnaLordName)) {
    remedies.push({ graha: lagnaLordName, reason: `lagna lord in the ${ordinal(lagnaLord.house)} house` });
  }
  if (remedies.length > 0) rituals.add("navagraha-shanti");

  // Lucky factors
  const lagnaGraha = getGraha(lagnaLordName);
  const fifthLord = SIGN_LORDS[(lagnaIdx + 4) % 12];
  const ninthLord = SIGN_LORDS[(lagnaIdx + 8) % 12];
  sections.push({
    title: "Favourable factors",
    paragraphs: [],
    bullets: [
      `Ishta devata to strengthen your lagna lord ${lagnaLordName}: ${lagnaGraha.deity}.`,
      `Favourable day: ${lagnaGraha.day}; colour: ${lagnaGraha.color}.`,
      `Traditional gemstones for your lagna: ${lagnaGraha.gem} (lagna lord ${lagnaLordName})${fifthLord !== lagnaLordName ? `, ${getGraha(fifthLord).gem} (5th lord ${fifthLord})` : ""}${ninthLord !== lagnaLordName && ninthLord !== fifthLord ? `, ${getGraha(ninthLord).gem} (9th lord ${ninthLord})` : ""}. Wear a gem only after consulting an experienced jyotishi.`,
    ],
  });

  const summary = `${RASHIS[lagnaIdx]} lagna, ${moon.rashi.name} rashi, ${moon.nakshatra.name} nakshatra (pada ${moon.nakshatra.pada}). Lagna at ${formatDegrees(k.lagna.rashi.degree)} ${RASHIS[lagnaIdx]}.${maha ? ` Running ${maha.lord} mahadasha.` : ""}`;
  return { summary, sections, remedies, rituals: [...rituals] };
}


