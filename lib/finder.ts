// The offline "finder": understands a question and answers from Brahman's built-in knowledge.
import { GRAHAS } from "./grahas.ts";
import { MANTRAS } from "./hawans.ts";
import { transliterate } from "./devanagari.ts";
import { KRIYAS, registerLearnedKriyas } from "./kriyas.ts";
import { learnedToKriya, registerArticles, type LearnedEntry } from "./learned.ts";
import { LIBRARY } from "./library.ts";
import { parseBirthDetails, type BirthDetails } from "./parse.ts";
import type { Mantra } from "./ritual-common.ts";
import type { Place } from "./time.ts";

export type Card =
  | { type: "text"; text: string }
  | { type: "ritual"; id: string }
  | { type: "ritualList"; title: string; ids: string[] }
  | { type: "graha"; name: string }
  | { type: "mantra"; title: string; mantra: Mantra }
  | { type: "kundli"; date: string; time: string; place: Place; name?: string }
  | { type: "panchang" }
  | { type: "scripture"; category: string; name: string; description: string }
  | { type: "article"; id: string }
  | { type: "suggestions"; items: string[] };

export interface FinderState {
  /** Birth details gathered so far while Brahman asks for the rest. */
  pendingKundli?: BirthDetails;
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
  if (e.primary && qTokens.includes(e.primary)) s += 3;
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

const KUNDLI_WORDS = ["kundli", "birth chart", "janam", "janm", "dob", "date of birth", "born", "jyotish", "astrology", "rashi", "nakshatra", "lagna", "dasha", "mahadasha", "my chart", "janmapatrika", "birth details", "prediction", "bhavishya"];
const PANCHANG_WORDS = ["panchang", "tithi", "aaj", "today", "rahu kaal", "rahukaal", "muhurat", "muhurta", "shubh muhurat", "choghadiya", "sunrise", "nakshatra today", "aaj ka din"];

const HELLO = /^(hi|hello|hey|namaste|namaskar|pranam|pranaam|jai shri (ram|krishna)|radhe radhe|har har mahadev|hari om|om)\b/i;

export const STARTER_SUGGESTIONS = [
  "I want to perform Graha Shanti hawan",
  "My DOB is 15 Jan 1990, 6:30 am, Delhi",
  "Satyanarayan katha ki vidhi",
  "Shani Sade Sati remedies",
  "Gayatri mantra",
  "Aaj ka panchang",
];

function askForMissing(d: BirthDetails): string {
  const missing = [!d.date && "date of birth (e.g. 15 Jan 1990)", !d.time && "time of birth (e.g. 6:30 am)", !d.place && "place of birth (city)"].filter(Boolean);
  const have = [d.date && `date ${d.date}`, d.time && `time ${d.time}`, d.place && `place ${d.place.name}`].filter(Boolean);
  return `🙏 To prepare your janma kundli I need your ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.${have.length ? ` I have noted your ${have.join(", ")}.` : ""} If you don't know the exact time, give your best estimate — the lagna changes about every two hours.`;
}

function mergeDetails(a: BirthDetails | undefined, b: BirthDetails): BirthDetails {
  return { date: b.date ?? a?.date, time: b.time ?? a?.time, place: b.place ?? a?.place, name: b.name ?? a?.name };
}

export function respond(text: string, state: FinderState = {}): FinderReply {
  const query = normPhrase(text);
  const qTokens = tokens(text);
  const lower = text.toLowerCase();
  const birth = parseBirthDetails(text);

  // 1. Kundli: explicit request, a birth date, or continuing a pending request.
  const spaced = ` ${transliterate(lower).replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ")} `;
  const hasWord = (w: string) => spaced.includes(` ${w} `);
  const wantsKundli = KUNDLI_WORDS.some(hasWord) || qTokens.includes("kundli");
  if (state.pendingKundli || wantsKundli || birth.date) {
    const ritualsHit = rank(RITUAL_INDEX, query, qTokens)[0];
    // A strong ritual match without birth details means the person moved on.
    const movedOn = state.pendingKundli && !birth.date && !birth.time && !birth.place && ritualsHit && ritualsHit.score >= 4;
    if (!movedOn && (wantsKundli || birth.date || birth.time || birth.place || state.pendingKundli)) {
      const details = mergeDetails(state.pendingKundli, birth);
      if (details.date && details.time && details.place) {
        return {
          cards: [
            { type: "text", text: `🙏 Here is the janma kundli${details.name ? ` of ${details.name}` : ""} for ${details.date}, ${details.time}, ${details.place.name}, with my reading.` },
            { type: "kundli", date: details.date, time: details.time, place: details.place, name: details.name },
          ],
          state: {},
        };
      }
      if (wantsKundli || birth.date || state.pendingKundli) {
        return { cards: [{ type: "text", text: askForMissing(details) }], state: { pendingKundli: details } };
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
  const articles = rank(ARTICLE_INDEX, query, qTokens);
  const mentionsMantra = qTokens.includes("mantra");
  const mentionsJapa = mentionsMantra || qTokens.includes("jaap") || qTokens.includes("japa");

  // 3. A specific mantra ("… jaap" usually means the practice, so the rite's guide wins unless "mantra" is said).
  if (mantras[0] && mantras[0].score >= 5 && (mentionsMantra || mantras[0].score > (rituals[0]?.score ?? 0))) {
    return { cards: [{ type: "mantra", ...mantras[0].value }], state };
  }

  // 4. A graha (mantra, remedy, dosha) — unless a ritual for it matches better.
  if (grahas[0] && (!rituals[0] || mentionsJapa || rituals[0].score < 6)) {
    const cards: Card[] = [{ type: "graha", name: grahas[0].value }];
    const related = rituals.filter((r) => r.score >= 4).slice(0, 2).map((r) => r.value);
    if (related.length) cards.push({ type: "ritualList", title: "Related rites", ids: related });
    return { cards, state };
  }

  // 5. A learned article that fits better than any ritual.
  if (articles[0] && articles[0].score >= 4 && articles[0].score > (rituals[0]?.score ?? 0)) {
    return { cards: [{ type: "article", id: articles[0].value }], state };
  }

  // 6. Rituals.
  if (rituals[0] && rituals[0].score >= 2) {
    const top = rituals[0];
    const cards: Card[] = [{ type: "ritual", id: top.value }];
    const others = rituals.slice(1, 4).filter((r) => r.score >= Math.max(2, top.score * 0.5)).map((r) => r.value);
    if (others.length) cards.push({ type: "ritualList", title: "You may also be looking for", ids: others });
    return { cards, state };
  }

  // 7. Scriptures.
  if (scriptures[0] && scriptures[0].score >= 2) {
    return { cards: scriptures.slice(0, 3).map((s) => ({ type: "scripture" as const, ...s.value })), state };
  }

  // 8. Greeting / nothing matched.
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
