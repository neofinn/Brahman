// Which deity to worship, from the kundli and the dasha: the ishta devata (Jaimini), the janma-nakshatra devata, the
// lagna lord's deity for protection, the deity of each running and coming dasha, a deity for each life goal from the
// lords and karakas of its houses, and the deities that pacify the chart's doshas.
import { type Kundli } from "./jyotish.ts";
import { NAKSHATRA_INFO, SIGN_LORDS } from "./reading.ts";
import { readJaimini } from "./jaimini.ts";
import { formatMonth, type Prediction } from "./predictions.ts";

export interface Deity {
  id: string;
  name: string;
  devanagari: string;
  mantra: string;
  iast: string;
  day: string;
  offering: string;
  stotra: string;
  gives: string;
  rituals: string[];
  kathas: string[];
}

export const DEITIES: Record<string, Deity> = {
  surya: { id: "surya", name: "Surya Narayana", devanagari: "सूर्य नारायण", mantra: "ॐ घृणिः सूर्याय नमः", iast: "oṁ ghṛṇiḥ sūryāya namaḥ", day: "Sunday, at sunrise", offering: "arghya of water with red flowers and a pinch of kumkum, facing the rising Sun", stotra: "Aditya Hridayam (Valmiki Ramayana, Yuddha Kanda)", gives: "health, confidence, government favour, fame and a good relationship with the father", rituals: ["sandhya"], kathas: [] },
  shiva: { id: "shiva", name: "Bhagwan Shiva", devanagari: "भगवान शिव", mantra: "ॐ नमः शिवाय", iast: "oṁ namaḥ śivāya", day: "Monday", offering: "water or milk on the Shivling, bel leaves and white flowers", stotra: "Shiva Panchakshara Stotra; Rudrashtakam", gives: "peace of mind, protection, removal of fear and karmic burdens, and moksha", rituals: ["rudrabhishek"], kathas: ["shiv-purana", "shivratri-katha"] },
  mahamrityunjaya: { id: "mahamrityunjaya", name: "Mahamrityunjaya Shiva", devanagari: "महामृत्युंजय शिव", mantra: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥", iast: "oṁ tryambakaṁ yajāmahe sugandhiṁ puṣṭi-vardhanam | urvārukam iva bandhanān mṛtyor mukṣīya mā'mṛtāt ||", day: "Monday, or daily", offering: "japa of 108 with a rudraksha mala, water on the Shivling", stotra: "Mahamrityunjaya mantra (Rigveda 7.59.12)", gives: "recovery from illness, protection from accidents and untimely death, long life", rituals: ["mahamrityunjaya"], kathas: ["markandeya"] },
  parvati: { id: "parvati", name: "Gauri (Parvati)", devanagari: "गौरी (पार्वती)", mantra: "ॐ ह्रीं गौर्यै नमः", iast: "oṁ hrīṁ gauryai namaḥ", day: "Monday and Friday", offering: "red flowers, sindoor, bangles and sweets", stotra: "Gauri Ashtakam; Uma Maheshwara worship", gives: "marital happiness, the husband's long life, and emotional strength", rituals: ["karwa-chauth"], kathas: ["hartalika-teej-katha", "savitri-satyavan"] },
  katyayani: { id: "katyayani", name: "Maa Katyayani", devanagari: "माँ कात्यायनी", mantra: "कात्यायनि महामाये महायोगिन्यधीश्वरि। नन्दगोपसुतं देवि पतिं मे कुरु ते नमः॥", iast: "kātyāyani mahāmāye mahāyoginy adhīśvari | nanda-gopa-sutaṁ devi patiṁ me kuru te namaḥ ||", day: "Friday, and through Navratri", offering: "yellow flowers, honey and sweets", stotra: "the Katyayani vrata prayer of the gopis (Bhagavata Purana 10.22.4)", gives: "a good spouse and the removal of delays in marriage", rituals: ["navratri"], kathas: [] },
  durga: { id: "durga", name: "Maa Durga", devanagari: "माँ दुर्गा", mantra: "ॐ दुं दुर्गायै नमः", iast: "oṁ duṁ durgāyai namaḥ", day: "Tuesday, Friday and Ashtami", offering: "red hibiscus, a red chunri and a ghee lamp", stotra: "Durga Saptashati; Argala Stotra", gives: "protection from enemies and negative forces, courage, and relief from Rahu's confusion", rituals: ["navratri"], kathas: ["durga-saptashati"] },
  lakshmi: { id: "lakshmi", name: "Maa Lakshmi", devanagari: "माँ लक्ष्मी", mantra: "ॐ श्रीं महालक्ष्म्यै नमः", iast: "oṁ śrīṁ mahālakṣmyai namaḥ", day: "Friday evening", offering: "lotus or red flowers, kheer, a ghee lamp and a clean, fragrant home", stotra: "Shri Sukta (Rigveda khila); Kanakadhara Stotra", gives: "wealth, prosperity, comforts and harmony at home", rituals: ["lakshmi-puja"], kathas: [] },
  kubera: { id: "kubera", name: "Kubera", devanagari: "कुबेर", mantra: "ॐ कुबेराय नमः", iast: "oṁ kuberāya namaḥ", day: "Thursday or Friday, with Lakshmi", offering: "yellow flowers and coins, worshipped together with Lakshmi", stotra: "Kubera mantra with Shri Sukta", gives: "accumulation and protection of wealth", rituals: ["lakshmi-puja"], kathas: [] },
  saraswati: { id: "saraswati", name: "Maa Saraswati", devanagari: "माँ सरस्वती", mantra: "ॐ ऐं सरस्वत्यै नमः", iast: "oṁ aiṁ sarasvatyai namaḥ", day: "Thursday and Basant Panchami", offering: "white flowers, books and pens placed before her", stotra: "Saraswati Vandana (Ya Kundendu Tushara Haara Dhavala)", gives: "learning, memory, speech, music and success in exams", rituals: [], kathas: [] },
  ganesha: { id: "ganesha", name: "Shri Ganesha", devanagari: "श्री गणेश", mantra: "ॐ गं गणपतये नमः", iast: "oṁ gaṁ gaṇapataye namaḥ", day: "Wednesday and Chaturthi", offering: "21 blades of durva, modak and red flowers", stotra: "Ganapati Atharvashirsha; Sankatnashan Ganesh Stotra", gives: "removal of obstacles, a good start to every work, intelligence and Ketu's blessings", rituals: ["ganesh-puja"], kathas: ["ganesh-chaturthi-katha"] },
  vishnu: { id: "vishnu", name: "Bhagwan Vishnu", devanagari: "भगवान विष्णु", mantra: "ॐ नमो भगवते वासुदेवाय", iast: "oṁ namo bhagavate vāsudevāya", day: "Thursday and Ekadashi", offering: "tulsi leaves, yellow flowers, panchamrit", stotra: "Vishnu Sahasranama (Mahabharata, Anushasana Parva)", gives: "dharma, stability, protection of the family and good fortune", rituals: ["satyanarayan", "ekadashi"], kathas: ["dhruva", "gajendra-moksha", "ekadashi-katha"] },
  krishna: { id: "krishna", name: "Shri Krishna", devanagari: "श्री कृष्ण", mantra: "ॐ क्लीं कृष्णाय नमः", iast: "oṁ klīṁ kṛṣṇāya namaḥ", day: "Wednesday, Ashtami and Janmashtami", offering: "makhan-mishri, tulsi and a flute or peacock feather", stotra: "Bhagavad Gita path; Madhurashtakam", gives: "love, joy, devotion, and harmony in relationships", rituals: ["janmashtami", "gita-path"], kathas: ["krishna-janma", "govardhan", "sudama", "bhagavad-gita"] },
  santanGopal: { id: "santanGopal", name: "Santan Gopal (Bal Krishna)", devanagari: "सन्तान गोपाल", mantra: "ॐ देवकीसुत गोविन्द वासुदेव जगत्पते। देहि मे तनयं कृष्ण त्वामहं शरणं गतः॥", iast: "oṁ devakī-suta govinda vāsudeva jagat-pate | dehi me tanayaṁ kṛṣṇa tvām ahaṁ śaraṇaṁ gataḥ ||", day: "Thursday and Ekadashi, couple together", offering: "makhan-mishri and tulsi to Bal Gopal", stotra: "Santan Gopal mantra", gives: "the blessing of children and their well-being", rituals: ["janmashtami"], kathas: ["krishna-janma"] },
  rama: { id: "rama", name: "Shri Rama", devanagari: "श्री राम", mantra: "श्री राम जय राम जय जय राम", iast: "śrī rāma jaya rāma jaya jaya rāma", day: "daily; Sunday and Ram Navami", offering: "tulsi, flowers and a ghee lamp", stotra: "Ramcharitmanas path; Ram Raksha Stotra", gives: "righteousness, respect, leadership and a stable family life", rituals: ["akhand-ramayan"], kathas: ["ramcharitmanas"] },
  hanuman: { id: "hanuman", name: "Hanuman Ji", devanagari: "हनुमान जी", mantra: "ॐ हं हनुमते नमः", iast: "oṁ haṁ hanumate namaḥ", day: "Tuesday and Saturday", offering: "sindoor with jasmine oil, red flowers, boondi or gur-chana", stotra: "Hanuman Chalisa; Sundarkand; Bajrang Baan", gives: "courage, strength, protection from Saturn, Mars and Rahu, success over enemies and in effort", rituals: ["hanuman-sundarkand"], kathas: ["hanuman-chalisa", "sundarkand"] },
  narasimha: { id: "narasimha", name: "Bhagwan Narasimha", devanagari: "भगवान नरसिंह", mantra: "ॐ नमो भगवते नरसिंहाय", iast: "oṁ namo bhagavate narasiṁhāya", day: "Tuesday and Narasimha Jayanti", offering: "panakam (jaggery water), red flowers", stotra: "Narasimha Kavacham; Lakshmi-Narasimha Karavalamba Stotra", gives: "protection from fear, enemies, black magic and sudden dangers", rituals: [], kathas: ["prahlad"] },
  kartikeya: { id: "kartikeya", name: "Kartikeya (Murugan)", devanagari: "कार्तिकेय", mantra: "ॐ शरवणभवाय नमः", iast: "oṁ śaravaṇabhavāya namaḥ", day: "Tuesday and Shashthi", offering: "red flowers and fruits", stotra: "Skanda Shashti Kavacham; Subrahmanya Bhujangam", gives: "victory, courage, land and property, and relief in Mars dosha", rituals: ["mangal-dosh"], kathas: [] },
  shani: { id: "shani", name: "Shani Dev", devanagari: "शनि देव", mantra: "ॐ शं शनैश्चराय नमः", iast: "oṁ śaṁ śanaiścarāya namaḥ", day: "Saturday evening", offering: "a mustard-oil lamp under a peepal tree, black sesame, service to the poor", stotra: "Shani Stotra of Dasharatha; Hanuman Chalisa", gives: "relief in Sade Sati and Dhaiya, justice, patience and steady rewards for hard work", rituals: ["shani-shanti"], kathas: [] },
  dakshinamurti: { id: "dakshinamurti", name: "Dakshinamurti (Shiva as Guru) and Brihaspati", devanagari: "दक्षिणामूर्ति / बृहस्पति", mantra: "ॐ बृं बृहस्पतये नमः", iast: "oṁ bṛṁ bṛhaspataye namaḥ", day: "Thursday", offering: "yellow flowers, chana dal, turmeric and respect to teachers", stotra: "Dakshinamurti Stotram (Adi Shankaracharya); Guru Stotra", gives: "wisdom, a good guru, children, marriage for women and good fortune", rituals: ["satyanarayan"], kathas: [] },
  dhanvantari: { id: "dhanvantari", name: "Bhagwan Dhanvantari", devanagari: "भगवान धन्वन्तरि", mantra: "ॐ धन्वन्तरये नमः", iast: "oṁ dhanvantaraye namaḥ", day: "Dhanteras, and any day of illness", offering: "tulsi, medicinal herbs and a ghee lamp", stotra: "Dhanvantari mantra", gives: "healing and good health", rituals: [], kathas: ["samudra-manthan"] },
  pitrs: { id: "pitrs", name: "Pitrs (ancestors)", devanagari: "पितृ", mantra: "ॐ पितृभ्यः स्वधा नमः", iast: "oṁ pitṛbhyaḥ svadhā namaḥ", day: "Amavasya and Pitru Paksha", offering: "tarpan with sesame water, food for crows, cows and the needy", stotra: "Garuda Purana path; Pitru Stotra", gives: "relief in Pitru dosha, family harmony, progeny and blessings on all work", rituals: ["tarpan", "garuda-puran-path"], kathas: ["garuda-purana"] },
};

// The deity worshipped for each graha.
const GRAHA_DEITY: Record<string, string[]> = {
  Sun: ["surya", "rama"],
  Moon: ["shiva", "parvati"],
  Mars: ["hanuman", "kartikeya"],
  Mercury: ["ganesha", "vishnu"],
  Jupiter: ["dakshinamurti", "vishnu"],
  Venus: ["lakshmi", "parvati"],
  Saturn: ["hanuman", "shani"],
  Rahu: ["durga"],
  Ketu: ["ganesha"],
};

// The ishta devata from the planet in the 12th from karakamsha, following the avataras of BPHS ch. 2 where they are
// commonly worshipped (Rama, Krishna, Narasimha) and the usual household deity otherwise.
const ISHTA_DEITY: Record<string, string> = {
  Sun: "rama", Moon: "krishna", Mars: "narasimha", Mercury: "vishnu", Jupiter: "vishnu", Venus: "lakshmi", Saturn: "hanuman", Rahu: "durga", Ketu: "ganesha",
};

// Vedic nakshatra devatas (Taittiriya Brahmana) mapped to a deity a household can worship.
const NAKSHATRA_WORSHIP: Record<number, string> = {
  0: "dhanvantari", // Ashvini Kumaras, divine physicians
  1: "mahamrityunjaya", // Yama
  2: "surya", // Agni
  3: "saraswati", // Prajapati (Brahma)
  4: "shiva", // Soma — Shiva wears the Moon
  5: "shiva", // Rudra
  6: "parvati", // Aditi, the divine mother
  7: "dakshinamurti", // Brihaspati
  8: "shiva", // the Nagas — Shiva bears the serpents
  9: "pitrs", // the Pitrs
  10: "parvati", // Bhaga, marital bliss
  11: "surya", // Aryaman, an Aditya
  12: "surya", // Savitr
  13: "vishnu", // Tvashtr, the divine craftsman
  14: "hanuman", // Vayu — Hanuman is his son
  15: "kartikeya", // Indra-Agni — Kartikeya, commander of the devas, born of Agni
  16: "surya", // Mitra, an Aditya
  17: "vishnu", // Indra — worshipped through Upendra (Vishnu)
  18: "durga", // Nirriti — Kali/Durga
  19: "lakshmi", // Apah, the waters — Lakshmi rose from the ocean
  20: "ganesha", // the Vishvedevas — Ganesha, lord of the ganas
  21: "vishnu", // Vishnu
  22: "shiva", // the Vasus
  23: "mahamrityunjaya", // Varuna; Shatabhisha, "a hundred healers"
  24: "shiva", // Aja Ekapada, a form of Rudra
  25: "shiva", // Ahir Budhnya, a form of Rudra
  26: "vishnu", // Pushan
};

// For each life goal: the deity that tradition associates with it, and the house whose lord's deity also helps.
const GOALS: { goal: string; deity: string; house: number; karaka?: string }[] = [
  { goal: "Wealth and prosperity", deity: "lakshmi", house: 2, karaka: "Jupiter" },
  { goal: "Income, gains and business growth", deity: "kubera", house: 11, karaka: "Mercury" },
  { goal: "Career, promotion and status", deity: "surya", house: 10, karaka: "Saturn" },
  { goal: "Studies, exams and intelligence", deity: "saraswati", house: 5, karaka: "Mercury" },
  { goal: "Marriage (for a girl)", deity: "katyayani", house: 7, karaka: "Jupiter" },
  { goal: "Marriage (for a boy) and a happy married life", deity: "parvati", house: 7, karaka: "Venus" },
  { goal: "Love, romance and harmony with partner", deity: "krishna", house: 5, karaka: "Venus" },
  { goal: "Children", deity: "santanGopal", house: 5, karaka: "Jupiter" },
  { goal: "Health and recovery", deity: "mahamrityunjaya", house: 1, karaka: "Sun" },
  { goal: "Home, property and vehicles", deity: "kartikeya", house: 4, karaka: "Mars" },
  { goal: "Removing obstacles and new beginnings", deity: "ganesha", house: 1 },
  { goal: "Courage, protection and defeating enemies", deity: "hanuman", house: 6, karaka: "Mars" },
  { goal: "Court cases and legal trouble", deity: "narasimha", house: 6, karaka: "Saturn" },
  { goal: "Going abroad", deity: "durga", house: 12, karaka: "Rahu" },
  { goal: "Peace of mind and freedom from anxiety", deity: "shiva", house: 4, karaka: "Moon" },
  { goal: "Spiritual growth and moksha", deity: "vishnu", house: 12, karaka: "Ketu" },
];

const DOSHA_DEITY: [RegExp, string][] = [
  [/Mangal/, "hanuman"], [/Kaal Sarp/, "shiva"], [/Sade Sati|Shani/, "hanuman"], [/Pitru/, "pitrs"], [/Guru Chandal/, "vishnu"],
  [/Grahan/, "mahamrityunjaya"], [/Shrapit/, "mahamrityunjaya"], [/Angarak/, "hanuman"], [/Vish/, "shiva"], [/Gandmool/, "ganesha"], [/Kemadruma/, "parvati"],
];

export interface DeityAdvice {
  deity: Deity;
  why: string;
  for: string;
}

export interface DevataPlan {
  core: DeityAdvice[];
  now: DeityAdvice[];
  periods: { when: string; maha: string; antar: string; deities: Deity[]; focus: string }[];
  goals: { goal: string; primary: Deity; chart?: Deity; why: string }[];
  doshas: DeityAdvice[];
  daily: string[];
}

const d = (id: string) => DEITIES[id];

export function devataPlan(k: Kundli, prediction: Prediction, birth: Date): DevataPlan {
  const lagna = k.lagna.rashi.index;
  const lordOf = (h: number) => SIGN_LORDS[(lagna + h - 1) % 12];
  const j = readJaimini(k, birth);
  const moon = k.grahas.find((g) => g.name === "Moon")!;

  const core: DeityAdvice[] = [];
  const ishtaId = ISHTA_DEITY[j.ishtaDevata.planet];
  core.push({ deity: d(ishtaId), why: `Your ishta devata (Jaimini): ${j.ishtaDevata.reason}. Its form of Vishnu is ${j.ishtaDevata.avatara}.`, for: "your lifelong spiritual path and moksha — the deity closest to your soul" });
  const nak = moon.nakshatra.index;
  core.push({ deity: d(NAKSHATRA_WORSHIP[nak]), why: `Your birth star is ${moon.nakshatra.name}, whose Vedic devata is ${NAKSHATRA_INFO[nak].deity}.`, for: "daily well-being — worship on your nakshatra day each month" });
  const ll = lordOf(1);
  core.push({ deity: d(GRAHA_DEITY[ll][0]), why: `Your lagna lord is ${ll}; its deity protects your body and direction in life.`, for: "health, protection and confidence" });
  const ninth = lordOf(9);
  if (GRAHA_DEITY[ninth][0] !== GRAHA_DEITY[ll][0]) core.push({ deity: d(GRAHA_DEITY[ninth][0]), why: `Your 9th lord (fortune and dharma) is ${ninth}.`, for: "luck, blessings of the father and guru, and dharma" });

  const now: DeityAdvice[] = [];
  if (prediction.current) {
    const { maha, antar } = prediction.current;
    now.push({ deity: d(GRAHA_DEITY[maha][0]), why: `You are in ${maha} mahadasha until ${formatMonth(prediction.current.end > new Date() ? (k.dashas.find((x) => x.lord === maha && x.end > new Date())?.end ?? prediction.current.end) : prediction.current.end)}.`, for: `getting the best of ${maha}'s period and softening its difficulties` });
    if (antar !== maha) now.push({ deity: d(GRAHA_DEITY[antar][0]), why: `The sub-period is ${antar} until ${formatMonth(prediction.current.end)}.`, for: prediction.current.themes });
    for (const t of prediction.transitsNow) {
      if (t.planet === "Saturn" && t.effect === "hard") now.push({ deity: d("hanuman"), why: `Saturn's transit: ${t.text}`, for: "relief from Saturn's pressure" });
      if (t.planet === "Rahu" && t.effect === "hard") now.push({ deity: d("durga"), why: `Rahu's transit: ${t.text}`, for: "clarity and protection from Rahu" });
    }
  }

  const periods = prediction.periods.map((p) => {
    const ids = [...new Set([GRAHA_DEITY[p.maha][0], GRAHA_DEITY[p.antar][0]])];
    return { when: `${formatMonth(p.start)} – ${formatMonth(p.end)}`, maha: p.maha, antar: p.antar, deities: ids.map(d), focus: p.themes };
  });

  const goals = GOALS.map((g) => {
    const lord = lordOf(g.house);
    const chartId = GRAHA_DEITY[lord][0];
    return {
      goal: g.goal,
      primary: d(g.deity),
      chart: chartId !== g.deity ? d(chartId) : undefined,
      why: `${d(g.deity).name} is traditionally worshipped for this; in your chart the ${g.house}${g.house === 1 ? "st" : g.house === 2 ? "nd" : "th"} house is ruled by ${lord}${chartId !== g.deity ? `, so ${d(chartId).name} also helps` : ""}.`,
    };
  });

  const doshas: DeityAdvice[] = [];
  for (const ds of prediction.doshas.filter((x) => x.severity !== "cancelled")) {
    const id = DOSHA_DEITY.find(([re]) => re.test(ds.name))?.[1];
    if (id) doshas.push({ deity: d(id), why: ds.name, for: `pacifying ${ds.name}` });
  }

  const daily = [
    `Morning: light a diya, offer water to the Sun, and chant your ishta devata's mantra (${d(ishtaId).mantra}) 108 times.`,
    `Every ${d(GRAHA_DEITY[ll][0]).day.split(/[,;]/)[0]}: worship ${d(GRAHA_DEITY[ll][0]).name} for protection.`,
    prediction.current ? `During this period: ${d(GRAHA_DEITY[prediction.current.antar][0]).name} on ${d(GRAHA_DEITY[prediction.current.antar][0]).day.split(/[,;]/)[0]}s.` : "",
    "Begin every worship with Shri Ganesha, and end with aarti and a prayer for forgiveness of mistakes.",
  ].filter(Boolean);

  return { core, now, periods, goals, doshas, daily };
}
