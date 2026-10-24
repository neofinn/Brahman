// The offline "finder": understands a question and answers from Brahman's built-in knowledge.
import { GRAHAS } from "./grahas.ts";
import { MANTRAS } from "./hawans.ts";
import { transliterate } from "./devanagari.ts";
import { KATHAS } from "./kathas/index.ts";
import { KRIYAS, registerLearnedKriyas } from "./kriyas.ts";
import { learnedToKriya, registerArticles, type LearnedEntry } from "./learned.ts";
import { LIBRARY } from "./library.ts";
import { parseBirthDetails, type BirthDetails } from "./parse.ts";
import { detectActivity, type Activity } from "./muhurta.ts";
import { SIDDHIS, type Guna } from "./siddhis.ts";
import type { AreaId } from "./predictions.ts";
import { detectCrisis, detectSituation, getSituation, type Relation } from "./support.ts";
import type { Mantra } from "./ritual-common.ts";
import type { Place } from "./time.ts";

export type Card =
  | { type: "text"; text: string }
  | { type: "ritual"; id: string }
  | { type: "ritualList"; title: string; ids: string[] }
  | { type: "graha"; name: string }
  | { type: "mantra"; title: string; mantra: Mantra }
  | { type: "kundli"; date: string; time: string; place: Place; name?: string }
  | { type: "prediction"; date: string; time: string; place: Place; name?: string; focus?: AreaId }
  | { type: "milan" }
  | { type: "abroad"; ritualId?: string }
  | { type: "siddhi"; id: string }
  | { type: "siddhiList"; guna?: Guna }
  | { type: "muhurta"; activity: Activity }
  | { type: "panchang" }
  | { type: "scripture"; category: string; name: string; description: string }
  | { type: "article"; id: string }
  | { type: "katha"; id: string; part?: number }
  | { type: "support"; id: string; relation?: Relation; when?: "today" | "tomorrow" | "tonight"; seed: string }
  | { type: "crisis"; kind: "crisis" | "emergency" }
  | { type: "sankalpa"; ritualId: string }
  | { type: "suggestions"; items: string[] };

export interface FinderState {
  /** Birth details gathered so far while Brahman asks for the rest. */
  pendingKundli?: BirthDetails;
  /** The prediction asked for while birth details are still being gathered ("general" for the whole future). */
  pendingFocus?: AreaId | "general";
  /** The last complete birth details, so "when will I marry?" can be answered without asking again. */
  lastBirth?: BirthDetails;
}

export interface FinderReply {
  cards: Card[];
  state: FinderState;
  /** True when nothing in the knowledge base matched well. */
  unmatched?: boolean;
}

// ---------------------------------------------------------------------------
// Text normalisation: spelling variants people actually type.

const VARIANTS: Record<string, string> = {
  pooja: "puja", poojan: "puja", pujan: "puja", pujaa: "puja", poojaa: "puja",
  hawan: "havan", hvan: "havan", havana: "havan", homam: "homa", hom: "homa",
  yagna: "yagya", yajna: "yagya", yagy: "yagya", yaj: "yagya",
  greh: "graha", grah: "graha", grih: "graha", griha: "graha", graha: "graha", gruha: "graha", gruh: "graha", grha: "graha",
  navgrah: "navagraha", navgraha: "navagraha", navagrah: "navagraha", navgrha: "navagraha", navagraha: "navagraha",
  shanthi: "shanti", santi: "shanti", shaanti: "shanti", shantii: "shanti",
  laxmi: "lakshmi", laksmi: "lakshmi", lakxmi: "lakshmi",
  ganpati: "ganesh", ganapati: "ganesh", ganesha: "ganesh", ganesa: "ganesh", ganeshji: "ganesh", vinayak: "ganesh", vinayaka: "ganesh",
  shiv: "shiva", shivji: "shiva", siva: "shiva", mahadev: "shiva", bholenath: "shiva", shankar: "shiva",
  shivratri: "shivaratri",
  hanumanji: "hanuman", bajrang: "hanuman", bajrangbali: "hanuman",
  satyanarayana: "satyanarayan", satyanarayn: "satyanarayan", satnarayan: "satyanarayan",
  ekadasi: "ekadashi", gyaras: "ekadashi", ekadshi: "ekadashi",
  kundali: "kundli", kundly: "kundli", kundale: "kundli", janampatri: "kundli", janmpatri: "kundli", patri: "kundli", horoscope: "kundli", janmakundli: "kundli",
  panchangam: "panchang", panchanga: "panchang", panjika: "panchang",
  mantr: "mantra", mantram: "mantra", mantar: "mantra", mantras: "mantra", matra: "mantra", matras: "mantra",
  vastu: "vastu", vaastu: "vastu", vasthu: "vastu",
  pravesh: "pravesh", pravesam: "pravesh", parvesh: "pravesh", pravesha: "pravesh",
  dosh: "dosha", dosham: "dosha", dos: "dosha", dosa: "dosha",
  manglik: "mangal", mangalik: "mangal", kuja: "mangal", chevvai: "mangal",
  kalsarp: "kaalsarp", kalsarpa: "kaalsarp",
  sadesati: "sadesati", saadesaati: "sadesati",
  shraddh: "shraddha", shradh: "shraddha", shraadh: "shraddha", sraddha: "shraddha",
  pitra: "pitru", pitr: "pitru", pitri: "pitru",
  navratri: "navratri", navaratri: "navratri", navratra: "navratri",
  sundarkand: "sundarkand", sunderkand: "sundarkand", sundarkanda: "sundarkand",
  rudrabhishekam: "rudrabhishek", rudrabhisek: "rudrabhishek", rudraabhishek: "rudrabhishek",
  mrityunjay: "mrityunjaya", mrutyunjaya: "mrityunjaya", mritunjay: "mrityunjaya", mahamrityunjay: "mahamrityunjaya",
  gaytri: "gayatri", gayathri: "gayatri", gayitri: "gayatri",
  aarthi: "aarti", arti: "aarti", arati: "aarti",
  vrath: "vrat", vratam: "vrat", upvas: "vrat", upwas: "vrat", fast: "vrat",
  sanskar: "samskara", samskar: "samskara", sanskara: "samskara",
  surya: "surya", suraj: "surya", sury: "surya",
  sankalp: "sankalpa", sankalap: "sankalpa", sankalpam: "sankalpa",
  sidhi: "siddhi", siddhis: "siddhi", sidhis: "siddhi", siddhiyan: "siddhi", siddhiyaan: "siddhi", siddhiya: "siddhi", sidhiyan: "siddhi",
  satvik: "sattvic", satvic: "sattvic", saatvik: "sattvic", sattvik: "sattvic",
  rajsik: "rajasic", rajasik: "rajasic", rajsic: "rajasic", rajas: "rajasic", rajk: "rajasic", rajik: "rajasic",
  tamsik: "tamasic", tamasik: "tamasic", tamsic: "tamasic", tamas: "tamasic",
  kahani: "katha", kahaani: "katha", kahanee: "katha", story: "katha", stories: "katha", kathaa: "katha",
};

const STOPWORDS = new Set([
  "i", "me", "my", "we", "our", "want", "wanna", "would", "like", "to", "do", "perform", "performing", "how", "what", "is", "are", "the", "a", "an",
  "of", "for", "please", "tell", "about", "can", "you", "give", "show", "need", "needed", "will", "should", "in", "on", "at", "and", "with",
  "procedure", "process", "steps", "method", "way", "know", "help", "required", "requirements", "things", "list", "it", "this", "that",
  "mujhe", "mai", "main", "mein", "hum", "karna", "karni", "karna", "hai", "hain", "kaise", "kare", "karein", "karen", "kya", "ki", "ka", "ke",
  "ko", "batao", "bataiye", "chahiye", "chahta", "chahti", "hoon", "hu", "se", "aur", "ye", "yeh", "wala", "wali", "bhi", "ji", "pandit",
  "brahman", "plz", "pls", "vidhi", "samagri", "shri", "sri", "shree",
]);

/** Generic words that say "a ritual" but not which one. */
const GENERIC = new Set(["puja", "havan", "homa", "yagya", "path", "vrat", "katha", "jaap", "japa", "anushthan", "shanti", "dosha", "mantra"]);

function canon(token: string): string {
  return VARIANTS[token] ?? token;
}

export function tokens(text: string): string[] {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9ऀ-ॿ\s]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(canon);
}

function normPhrase(text: string): string {
  return ` ${tokens(text).join(" ")} `;
}

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function fuzzyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false;
  return editDistance(a, b) <= (Math.min(a.length, b.length) >= 8 ? 2 : 1);
}

// ---------------------------------------------------------------------------
// Indexes

interface Entry<T> {
  value: T;
  phrases: string[]; // normalised, space-padded
  words: Set<string>;
  /** The first word of the title — naming it ("havan") points at this entry even when the word is generic. */
  primary?: string;
}

function entry<T>(value: T, texts: string[]): Entry<T> {
  const phrases = texts.map(normPhrase);
  const words = new Set(phrases.flatMap((p) => p.trim().split(" ")).filter((w) => w && !STOPWORDS.has(w)));
  const primary = phrases[0]?.trim().split(" ").find((w) => w && !STOPWORDS.has(w));
  return { value, phrases, words, primary };
}

const BASE_RITUAL_INDEX = KRIYAS.map((k) => entry(k.id, [k.title, ...k.keywords]));
let RITUAL_INDEX = BASE_RITUAL_INDEX;
let ARTICLE_INDEX: Entry<string>[] = [];

/** Makes knowledge learned through AI searches answerable offline, alongside the built-in granth. */
export function setLearnedKnowledge(entries: LearnedEntry[]): void {
  const rituals = entries.filter((e) => e.kind === "ritual").map(learnedToKriya);
  registerLearnedKriyas(rituals);
  registerArticles(entries);
  RITUAL_INDEX = [...BASE_RITUAL_INDEX, ...rituals.map((k) => entry(k.id, [k.title, ...k.keywords]))];
  ARTICLE_INDEX = entries.filter((e) => e.kind === "article").map((e) => entry(e.id, [e.title, e.question, ...e.keywords]));
}

const GRAHA_ALIASES: Record<string, string[]> = {
  Sun: ["surya", "sun", "ravi", "aditya", "suryadev"],
  Moon: ["chandra", "moon", "som", "soma", "chandrama"],
  Mars: ["mangal", "mars", "bhaum", "angarak", "kuja"],
  Mercury: ["budh", "budha", "mercury"],
  Jupiter: ["guru", "brihaspati", "jupiter", "brihaspat"],
  Venus: ["shukra", "venus", "sukra"],
  Saturn: ["shani", "saturn", "shanidev", "shanaishchara"],
  Rahu: ["rahu"],
  Ketu: ["ketu"],
};
const GRAHA_INDEX = GRAHAS.map((g) => entry(g.name, GRAHA_ALIASES[g.name]));

const MANTRA_KEYWORDS: Record<keyof typeof MANTRAS, [string, string[]]> = {
  gayatri: ["Gayatri Mantra", ["gayatri", "savitri mantra", "om bhur bhuva swaha"]],
  mahamrityunjaya: ["Mahamrityunjaya Mantra", ["mahamrityunjaya", "maha mrityunjaya", "mrityunjaya", "tryambakam", "om tryambakam"]],
  kalash: ["Kalash Mantra", ["kalash mantra", "kalash sthapana mantra"]],
  agni: ["Agni Mantra (Rigveda 1.1.1)", ["agni mantra", "agnimile", "agni suktam"]],
  purnahuti: ["Purnahuti / Purnamadah Mantra", ["purnahuti", "purnamadah", "poornamadah", "purnam"]],
  shantiPath: ["Shanti Path", ["shanti path", "shanti mantra", "dyau shanti", "peace mantra"]],
  vishnu: ["Shri Vishnu Dhyana (Shantakaram)", ["shantakaram", "vishnu mantra", "vishnu dhyan", "narayan mantra"]],
  rudraGayatri: ["Rudra Gayatri", ["rudra gayatri", "shiva gayatri"]],
  ganeshGayatri: ["Ganesha Gayatri", ["ganesh gayatri", "ekadantaya"]],
  lakshmi: ["Mahalakshmi Mantra", ["lakshmi mantra", "mahalakshmi mantra", "money mantra", "dhan mantra", "wealth mantra"]],
  lakshmiGayatri: ["Lakshmi Gayatri", ["lakshmi gayatri"]],
  durga: ["Ya Devi Sarvabhuteshu", ["ya devi", "durga mantra", "devi mantra", "mata mantra"]],
  navarna: ["Navarna Mantra", ["navarna", "chamundaye", "aim hreem kleem"]],
  hanuman: ["Hanuman Dhyana (Manojavam)", ["manojavam", "hanuman mantra", "bajrang mantra"]],
  vastu: ["Vastoshpati Mantra", ["vastu mantra", "vastoshpati"]],
  shivaPanchakshari: ["Om Namah Shivaya", ["om namah shivaya", "namah shivaya", "panchakshari", "shiva mantra", "shiv mantra"]],
  krishna: ["Om Namo Bhagavate Vasudevaya", ["vasudevaya", "krishna mantra", "dwadashakshari", "om namo bhagavate"]],
};
const MANTRA_INDEX = (Object.keys(MANTRA_KEYWORDS) as (keyof typeof MANTRAS)[]).map((k) =>
  entry({ title: MANTRA_KEYWORDS[k][0], mantra: MANTRAS[k] }, MANTRA_KEYWORDS[k][1]),
);

const SIDDHI_INDEX = SIDDHIS.map((x) => entry(x.id, [x.name.split(/[(—]/)[0], ...x.keywords]));

const KATHA_INDEX = KATHAS.map((k) => entry(k.id, [k.title.split(/[—(]/)[0], ...k.keywords]));

/** "gita adhyay 2", "chapter 18", "skandh 10", "gita 2.47" → the part number. */
function partNumber(text: string): number | undefined {
  const t = transliterate(text).toLowerCase();
  const m =
    t.match(/\b(?:adhyay|adhyaya|adhyaay|adhyaya|chapter|ch|skandh|skandha|skand|kand|kanda|parva|samhita)\s*(?:no\.?\s*)?(\d{1,2})\b/) ??
    t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:adhyay|adhyaya|chapter|skandh|skandha)\b/) ??
    t.match(/\b(?:gita|geeta)\s*(\d{1,2})(?:[.:]\d{1,3})?\b/);
  return m ? Number(m[1]) : undefined;
}

const SCRIPTURE_INDEX = LIBRARY.flatMap((cat) =>
  cat.texts.map((t) => entry({ category: cat.title, name: t.name, description: t.description }, [t.name.split(/[—(]/)[0]])),
);

function score<T>(e: Entry<T>, query: string, qTokens: string[]): number {
  let s = 0;
  for (const p of e.phrases) {
    if (p.trim() && query.includes(p)) {
      // A phrase made of generic words ("vrat", "puja") says little about which rite is meant.
      for (const w of p.trim().split(" ")) s += STOPWORDS.has(w) ? 0 : GENERIC.has(w) ? 0.5 : 3;
    }
  }
  if (e.primary && qTokens.some((t) => fuzzyEqual(t, e.primary!))) s += 3;
  for (const t of qTokens) {
    if (STOPWORDS.has(t)) continue;
    for (const w of e.words) {
      if (fuzzyEqual(t, w)) {
        s += GENERIC.has(w) ? 0.5 : 2;
        break;
      }
    }
  }
  return s;
}

function rank<T>(index: Entry<T>[], query: string, qTokens: string[]) {
  return index
    .map((e) => ({ value: e.value, score: score(e, query, qTokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------

const KUNDLI_WORDS = ["kundli", "birth chart", "janam", "janm", "dob", "date of birth", "jyotish", "astrology", "rashi", "nakshatra", "lagna", "dasha", "mahadasha", "my chart", "janmapatrika", "birth details"];
const MILAN_WORDS = ["milan", "gun milan", "guna milan", "gunn milan", "ashtakoot", "ashtakoota", "kundli match", "kundli matching", "match kundli", "horoscope matching", "matchmaking", "36 gun", "36 guna", "gun milao", "kundli milao"];
const MUHURTA_WORDS = ["muhurat", "muhurta", "mahurat", "muhurtham", "shubh din", "shubh tithi", "shubh date", "auspicious date", "auspicious day", "auspicious time", "good date", "good day", "best date", "shubh samay"];
const PREDICT_WORDS = ["future", "bhavishya", "prediction", "predictions", "predict", "forecast", "bhavishyavani", "rajyog", "raj yog", "rajyoga", "raja yoga", "upcoming", "aane wala", "aanewala", "kaisa rahega", "kaisa rahegi", "kaise rahega", "next year", "agla saal", "this year", "is saal", "phaladesh", "my dosha", "mere dosh", "kundli dosh", "kundli dosha"];
const ABROAD_WORDS = ["abroad", "videsh", "foreign", "usa", "america", "canada", "uk", "london", "australia", "germany", "dubai", "overseas", "no pandit", "without pandit", "pandit nahi", "bina pandit", "no temple"];
const SUBSTITUTE_WORDS = ["substitute", "substitutes", "alternative", "replacement", "instead of", "not available", "can't find", "cant find", "cannot find", "nahi milta", "nahi milte", "nahi mil raha", "nahi mil rahe", "nahi mila", "nahi milti", "unavailable", "dont have", "don't have", "do not have", "budget", "cheap", "afford", "manasa puja", "mansik puja", "fire safety", "smoke alarm", "apartment"];
const PRAYER_WORDS = ["pray", "prayer", "prarthana", "dua", "bless", "blessing", "blessings", "aashirwad", "ashirwad", "motivate", "scared", "afraid", "darr", "dar lag", "nervous", "anxious", "worried", "tension", "sad", "upset"];
const WHEN_WORDS = ["kab", "when", "will i", "hoga", "hogi", "milegi", "milega", "chances", "possible", "yog", "yoga"];
const AREA_WORDS: [AreaId, string[]][] = [
  ["marriage", ["shaadi", "shadi", "marriage", "married", "vivah", "vivaah", "wedding", "spouse", "rishta", "life partner", "husband", "wife", "love marriage", "byah"]],
  ["career", ["career", "job", "naukri", "naukari", "promotion", "business", "vyapar", "government job", "sarkari", "work", "profession", "kaam"]],
  ["wealth", ["money", "paisa", "paise", "dhan", "wealth", "rich", "ameer", "finance", "financial", "income", "property"]],
  ["children", ["child", "children", "baby", "santan", "santaan", "bachcha", "bacche", "pregnancy", "putra", "kids"]],
  ["health", ["health", "sehat", "swasthya", "bimari", "disease", "illness"]],
  ["education", ["education", "study", "studies", "padhai", "exam result", "degree", "admission"]],
  ["foreign", ["foreign", "abroad", "videsh", "visa", "settle abroad", "pr ", "green card", "immigration", "usa", "canada", "uk "]],
  ["spirituality", ["spiritual", "moksha", "sadhana", "dharma path", "adhyatm"]],
];
const PANCHANG_WORDS = ["panchang", "tithi", "rahu kaal", "rahukaal", "muhurat", "muhurta", "shubh muhurat", "choghadiya", "sunrise", "nakshatra today", "aaj ka din"];

const HELLO = /^(hi|hello|hey|namaste|namaskar|pranam|pranaam|jai shri (ram|krishna)|radhe radhe|har har mahadev|hari om|om)\b/i;

export const STARTER_SUGGESTIONS = [
  "I have an exam tomorrow, please pray for me",
  "I want to perform Graha Shanti hawan",
  "Bhagwat katha",
  "My DOB is 15 Jan 1990, 6:30 am, Delhi",
  "Satyanarayan katha ki vidhi",
  "Shani Sade Sati remedies",
  "Gayatri mantra",
  "Aaj ka panchang",
  "Shaadi kab hogi?",
  "Griha pravesh muhurat",
  "Kundli milan",
];

function askForMissing(d: BirthDetails): string {
  const missing = [!d.date && "date of birth (e.g. 15 Jan 1990)", !d.time && "time of birth (e.g. 6:30 am)", !d.place && "place of birth (city)"].filter(Boolean);
  const have = [d.date && `date ${d.date}`, d.time && `time ${d.time}`, d.place && `place ${d.place.name}`].filter(Boolean);
  return `🙏 To prepare your janma kundli I need your ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.${have.length ? ` I have noted your ${have.join(", ")}.` : ""} If you don't know the exact time, give your best estimate — the lagna changes about every two hours.`;
}

function areaOf(has: (w: string) => boolean): AreaId | undefined {
  return AREA_WORDS.find(([, words]) => words.some((w) => has(w.trim())))?.[0];
}

function predictionCards(d: BirthDetails, focus: AreaId | "general"): Card[] {
  const f = focus === "general" ? undefined : focus;
  const intro = f
    ? `🙏 I have studied the kundli${d.name ? ` of ${d.name}` : ""} (${d.date}, ${d.time}, ${d.place!.name}) for ${f === "foreign" ? "foreign travel and settlement" : f}. The timing comes from the dashas and the transits of Jupiter and Saturn; remedies follow.`
    : `🙏 Here is the phaladesh${d.name ? ` for ${d.name}` : ""} (${d.date}, ${d.time}, ${d.place!.name}) — rajyogas, doshas, every area of life, the next five years and your remedies.`;
  return [{ type: "text", text: intro }, { type: "prediction", date: d.date!, time: d.time!, place: d.place!, name: d.name, focus: f }];
}

function mergeDetails(a: BirthDetails | undefined, b: BirthDetails): BirthDetails {
  return { date: b.date ?? a?.date, time: b.time ?? a?.time, place: b.place ?? a?.place, name: b.name ?? a?.name };
}

export function respond(text: string, state: FinderState = {}): FinderReply {
  const reply = answer(text, state);
  // Remember complete birth details across turns, whatever the answer was.
  const lastBirth = reply.state.lastBirth ?? state.lastBirth;
  if (lastBirth) reply.state = { ...reply.state, lastBirth };
  return reply;
}

function answer(text: string, state: FinderState): FinderReply {
  const query = normPhrase(text);
  const qTokens = tokens(text);
  const lower = text.toLowerCase();
  const birth = parseBirthDetails(text);

  // 0. Safety first: someone in crisis or a medical emergency gets real-world help before anything else.
  const crisis = detectCrisis(text);
  if (crisis) return { cards: [{ type: "crisis", kind: crisis }], state: {} };

  const spaced = ` ${transliterate(lower).replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ")} `;
  const hasWord = (w: string) => spaced.includes(` ${w} `);

  // 1a. Siddhis: "ashta siddhi", "tamasic siddhis", "vashikaran", "karna pishachini".
  const siddhiWord = qTokens.includes("siddhi");
  const siddhiHit = rank(SIDDHI_INDEX, query, qTokens)[0];
  const ritualTop = rank(RITUAL_INDEX, query, qTokens)[0];
  if (siddhiWord || (siddhiHit && siddhiHit.score >= 6 && siddhiHit.score > (ritualTop?.score ?? 0))) {
    const guna = (["sattvic", "rajasic", "tamasic"] as const).find((g) => qTokens.includes(g));
    const general = ["ashta", "asht", "aath", "eight", "8", "all", "sab", "every", "list", "types", "prakar"].some((w) => qTokens.includes(w));
    if (siddhiHit && siddhiHit.score >= 6 && !guna && !(general && siddhiWord)) {
      return { cards: [{ type: "siddhi", id: siddhiHit.value }], state };
    }
    if (siddhiWord || guna) {
      return {
        cards: [
          { type: "text", text: "🙏 Here are the siddhis of Sanatan Dharma, sorted by guna, with their scriptural sources. Shri Krishna and Patanjali both teach that siddhis are obstacles on the path to moksha — the true siddhi is devotion and liberation." },
          { type: "siddhiList", ...(guna ? { guna } : {}) },
        ],
        state,
      };
    }
  }

  // 1b. Kundli milan.
  if (MILAN_WORDS.some(hasWord) || (hasWord("match") && (hasWord("kundli") || hasWord("kundali") || hasWord("horoscope")))) {
    return { cards: [{ type: "text", text: "🙏 For Kundli Milan, enter the birth details of the boy and the girl. I will check all eight kootas (36 gunas), Nadi, Bhakoot and Mangal dosha, with remedies." }, { type: "milan" }], state: {} };
  }

  // 1c. A muhurta for an activity ("griha pravesh ka muhurat", "shubh date for marriage").
  const activity = detectActivity(spaced);
  if (MUHURTA_WORDS.some(hasWord) && (activity || hasWord("date") || hasWord("kab") || hasWord("when"))) {
    const a = activity ?? "puja";
    return { cards: [{ type: "text", text: "🙏 Here are the shubh muhurtas I find in the coming months for your city. Choose your city to adjust the timings." }, { type: "muhurta", activity: a }], state };
  }

  // 1c. Performing rites abroad or without the usual samagri.
  const ritualContext = qTokens.some((t) => ["puja", "havan", "homa", "yagya", "samagri", "pandit", "vrat", "katha"].includes(t)) || hasWord("samagri") || hasWord("pandit");
  if (SUBSTITUTE_WORDS.some(hasWord) || (ABROAD_WORDS.some(hasWord) && ritualContext)) {
    const top = rank(RITUAL_INDEX, query, qTokens)[0];
    const ritualId = top && top.score >= 4 ? top.value : undefined;
    const cards: Card[] = [
      { type: "text", text: "🙏 Wherever you are, the puja can be done. Bhava matters more than material — here is what to use when an item is missing, how to sanctify any water, the manasa puja when nothing is available, and fire safety for a hawan at home." },
      { type: "abroad", ...(ritualId ? { ritualId } : {}) },
    ];
    if (ritualId) cards.push({ type: "ritual", id: ritualId });
    return { cards, state };
  }

  // 1d. Predictions: "my future", "shaadi kab hogi", "career kaisa rahega".
  const area = areaOf(hasWord);
  // A worry with a prayer request ("interview tomorrow, will I get the job? pray for me") is for comfort, not a forecast.
  const asksPrayer = PRAYER_WORDS.some(hasWord);
  const wantsPrediction = PREDICT_WORDS.some(hasWord) || (area !== undefined && WHEN_WORDS.some(hasWord) && !asksPrayer);
  if (wantsPrediction && !state.pendingKundli) {
    const focus = area ?? "general";
    const details = mergeDetails(birth.date ? undefined : state.lastBirth, birth);
    if (details.date && details.time && details.place) return { cards: predictionCards(details, focus), state: { lastBirth: details } };
    return {
      cards: [{ type: "text", text: askForMissing(details).replace("To prepare your janma kundli", focus === "general" ? "To see your future" : `To read your kundli for ${focus === "foreign" ? "foreign travel" : focus}`) }],
      state: { pendingKundli: details, pendingFocus: focus },
    };
  }

  // 1e. Kundli: explicit request, a birth date, or continuing a pending request.
  const wantsKundli = KUNDLI_WORDS.some(hasWord) || qTokens.includes("kundli");
  if (state.pendingKundli || wantsKundli || birth.date) {
    const ritualsHit = rank(RITUAL_INDEX, query, qTokens)[0];
    // A strong ritual match without birth details means the person moved on.
    const movedOn = state.pendingKundli && !birth.date && !birth.time && !birth.place && ritualsHit && ritualsHit.score >= 4;
    if (!movedOn && (wantsKundli || birth.date || birth.time || birth.place || state.pendingKundli)) {
      const details = mergeDetails(state.pendingKundli, birth);
      if (details.date && details.time && details.place) {
        if (state.pendingFocus) return { cards: predictionCards(details, state.pendingFocus), state: { lastBirth: details } };
        return {
          cards: [
            { type: "text", text: `🙏 Here is the janma kundli${details.name ? ` of ${details.name}` : ""} for ${details.date}, ${details.time}, ${details.place.name}, with my reading.` },
            { type: "kundli", date: details.date, time: details.time, place: details.place, name: details.name },
            { type: "suggestions", items: ["My future predictions", "Shaadi kab hogi?", "Career kaisa rahega?"] },
          ],
          state: { lastBirth: details },
        };
      }
      if (wantsKundli || birth.date || state.pendingKundli) {
        return { cards: [{ type: "text", text: askForMissing(details) }], state: { pendingKundli: details, ...(state.pendingFocus ? { pendingFocus: state.pendingFocus } : {}) } };
      }
    }
  }

  // 2. Panchang.
  if (PANCHANG_WORDS.some(hasWord) && !rank(RITUAL_INDEX, query, qTokens).some((r) => r.score >= 5)) {
    return { cards: [{ type: "text", text: "🙏 Here is the panchang. Choose the date and your city to see the timings." }, { type: "panchang" }], state };
  }

  const rituals = rank(RITUAL_INDEX, query, qTokens);
  const grahas = rank(GRAHA_INDEX, query, qTokens);
  const mantras = rank(MANTRA_INDEX, query, qTokens);
  const scriptures = rank(SCRIPTURE_INDEX, query, qTokens);
  const kathas = rank(KATHA_INDEX, query, qTokens);
  const articles = rank(ARTICLE_INDEX, query, qTokens);
  const mentionsMantra = qTokens.includes("mantra");
  const mentionsJapa = mentionsMantra || qTokens.includes("jaap") || qTokens.includes("japa");

  // 3. The person's own sankalpa ("mera sankalp", "satyanarayan sankalpa", "my gotra…").
  if (qTokens.includes("sankalpa") || hasWord("gotra") || hasWord("my details")) {
    const forRite = rituals[0] && rituals[0].score >= 4 ? rituals[0].value : "daily-puja";
    return { cards: [{ type: "sankalpa", ritualId: forRite }], state };
  }

  // 4. A feeling or life moment ("I'm scared", "exam tomorrow, pray for me") — unless a named rite or katha is clearly asked for.
  const situation = detectSituation(text);
  const strongest = Math.max(rituals[0]?.score ?? 0, kathas[0]?.score ?? 0, mantras[0]?.score ?? 0);
  // The rite the comfort card itself recommends only wins when the person names it ("mahamrityunjaya jaap…").
  const linked = situation && rituals[0] && rituals[0].value === getSituation(situation.id)?.ritualId;
  const named = (id: string) => {
    const primary = RITUAL_INDEX.find((e) => e.value === id)?.primary;
    return !!primary && qTokens.some((t) => fuzzyEqual(t, primary));
  };
  if (situation && situation.score >= 4 && (situation.score * 2 >= strongest || (linked && !named(rituals[0].value)))) {
    return {
      cards: [{ type: "support", id: situation.id, seed: text, ...(situation.relation ? { relation: situation.relation } : {}), ...(situation.when ? { when: situation.when } : {}) }],
      state: {},
    };
  }

  // 5. A specific mantra ("… jaap" usually means the practice, so the rite's guide wins unless "mantra" is said).
  if (mantras[0] && mantras[0].score >= 5 && (mentionsMantra || mantras[0].score > (rituals[0]?.score ?? 0))) {
    return { cards: [{ type: "mantra", ...mantras[0].value }], state };
  }

  // 6. A graha (mantra, remedy, dosha) — unless a ritual for it matches better.
  if (grahas[0] && (!rituals[0] || mentionsJapa || rituals[0].score < 6)) {
    const cards: Card[] = [{ type: "graha", name: grahas[0].value }];
    const related = rituals.filter((r) => r.score >= 4).slice(0, 2).map((r) => r.value);
    if (related.length) cards.push({ type: "ritualList", title: "Related rites", ids: related });
    return { cards, state };
  }

  // 7. A katha or granth — it carries its own path vidhi, so it wins ties with the ritual guide.
  const wantsKatha = qTokens.some((t) => ["katha", "charitra", "leela", "lila", "path", "paath", "chalisa"].includes(t));
  const kathaWins = kathas[0] && kathas[0].score >= 4 && (wantsKatha || kathas[0].score >= (rituals[0]?.score ?? 0));
  if (kathaWins && kathas[0].score >= (articles[0]?.score ?? 0)) {
    const katha = KATHAS.find((k) => k.id === kathas[0].value)!;
    const part = partNumber(text);
    const cards: Card[] = [{ type: "katha", id: katha.id, ...(part && katha.parts && part <= katha.parts.length ? { part } : {}) }];
    const others = kathas.slice(1, 4).filter((r) => r.score >= Math.max(4, kathas[0].score * 0.6)).map((r) => r.value);
    if (others.length) cards.push({ type: "suggestions", items: others.map((id) => KATHAS.find((k) => k.id === id)!.title.split(/[—(]/)[0].trim()) });
    return { cards, state };
  }

  // 8. A learned article that fits better than any ritual.
  if (articles[0] && articles[0].score >= 4 && articles[0].score > (rituals[0]?.score ?? 0)) {
    return { cards: [{ type: "article", id: articles[0].value }], state };
  }

  // 9. Rituals.
  if (rituals[0] && rituals[0].score >= 2) {
    const top = rituals[0];
    const cards: Card[] = [{ type: "ritual", id: top.value }];
    const others = rituals.slice(1, 4).filter((r) => r.score >= Math.max(2, top.score * 0.5)).map((r) => r.value);
    if (others.length) cards.push({ type: "ritualList", title: "You may also be looking for", ids: others });
    return { cards, state };
  }

  // 10. Scriptures.
  if (scriptures[0] && scriptures[0].score >= 2) {
    return { cards: scriptures.slice(0, 3).map((s) => ({ type: "scripture" as const, ...s.value })), state };
  }

  // 11. Greeting / nothing matched.
  if (HELLO.test(text.trim())) {
    return {
      cards: [
        { type: "text", text: "🙏 Namaste! I am Brahman, your purohit. Tell me which puja, hawan or vrat you wish to perform, give me your birth details for a kundli, or ask for a mantra or today's panchang." },
        { type: "suggestions", items: STARTER_SUGGESTIONS },
      ],
      state,
    };
  }
  return {
    cards: [
      { type: "text", text: "🙏 I could not find that in my granth yet. Try naming the puja, hawan, vrat, deity, graha or mantra — for example:" },
      { type: "suggestions", items: STARTER_SUGGESTIONS },
    ],
    state,
    unmatched: true,
  };
}
