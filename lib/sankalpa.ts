// Personal sankalpa: the traditional Sanskrit statement of intent, filled with the person's name, gotra,
// father's name and place, and the exact time from the panchang. Also personal tarpan mantras for ancestors.
import { computePanchang, LUNAR_MONTHS, NAKSHATRAS, RASHIS, type Panchang } from "./jyotish.ts";
import type { Mantra } from "./ritual-common.ts";
import { toDevanagariDigits, toIast } from "./sanskrit.ts";
import { todayIn, weekdayOf, zonedToUtc, type Place } from "./time.ts";

export interface Ancestors {
  father?: string;
  grandfather?: string;
  greatGrandfather?: string;
  mother?: string;
  grandmother?: string;
  greatGrandmother?: string;
}

export interface Profile {
  name: string; // as typed
  nameDeva: string; // confirmed Devanagari
  gender: "m" | "f";
  gotra: string; // key from GOTRAS, or "other"
  gotraDeva: string; // Devanagari stem, e.g. काश्यप
  father: string;
  fatherDeva: string;
  place: Place;
  placeDeva: string;
  monthSystem: "purnimanta" | "amanta";
  /** Departed ancestors, for tarpan and shraddha (Devanagari). */
  ancestors: Ancestors;
}

export const GOTRAS: { key: string; name: string; deva: string }[] = [
  { key: "kashyap", name: "Kashyap (Kashyapa)", deva: "काश्यप" },
  { key: "bharadwaj", name: "Bharadwaj (Bharadvaja)", deva: "भारद्वाज" },
  { key: "vashishtha", name: "Vashishtha (Vasishtha)", deva: "वासिष्ठ" },
  { key: "vishwamitra", name: "Vishwamitra (Kaushika)", deva: "विश्वामित्र" },
  { key: "kaushik", name: "Kaushik", deva: "कौशिक" },
  { key: "gautam", name: "Gautam (Gautama)", deva: "गौतम" },
  { key: "atri", name: "Atri (Atreya)", deva: "आत्रेय" },
  { key: "jamadagni", name: "Jamadagni", deva: "जामदग्न्य" },
  { key: "agastya", name: "Agastya", deva: "आगस्त्य" },
  { key: "bhargava", name: "Bhargava (Bhrigu)", deva: "भार्गव" },
  { key: "angirasa", name: "Angirasa", deva: "आङ्गिरस" },
  { key: "garg", name: "Garg (Gargya)", deva: "गार्ग्य" },
  { key: "shandilya", name: "Shandilya", deva: "शाण्डिल्य" },
  { key: "vatsa", name: "Vatsa (Vats)", deva: "वत्स" },
  { key: "srivatsa", name: "Srivatsa", deva: "श्रीवत्स" },
  { key: "parashar", name: "Parashar (Parashara)", deva: "पाराशर" },
  { key: "kaundinya", name: "Kaundinya", deva: "कौण्डिन्य" },
  { key: "upamanyu", name: "Upamanyu", deva: "उपमन्यु" },
  { key: "mudgal", name: "Mudgal (Maudgalya)", deva: "मौद्गल्य" },
  { key: "harita", name: "Harit (Harita)", deva: "हारीत" },
  { key: "sankrit", name: "Sankriti (Sankrit)", deva: "साङ्कृत्य" },
  { key: "kapil", name: "Kapil", deva: "कापिल" },
  { key: "dhananjay", name: "Dhananjay", deva: "धनञ्जय" },
  { key: "mandavya", name: "Mandavya", deva: "माण्डव्य" },
  { key: "kutsa", name: "Kutsa (Kautsa)", deva: "कौत्स" },
  { key: "sandilya-other", name: "Other — type it", deva: "" },
];
export const UNKNOWN_GOTRA_NOTE =
  "If you do not know your gotra, tradition says to use Kashyapa gotra — all beings descend from Maharishi Kashyapa (गोत्राभावे काश्यपः).";

const MONTHS_DEVA = ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"];
const MONTHS_EN = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashvin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
// Ritu by (amanta) lunar month: two months each, starting with Vasanta in Chaitra.
const RITUS = [["वसन्तर्तौ", "Vasanta"], ["ग्रीष्मर्तौ", "Grishma"], ["वर्षर्तौ", "Varsha"], ["शरदृतौ", "Sharad"], ["हेमन्तर्तौ", "Hemanta"], ["शिशिरर्तौ", "Shishira"]];
const TITHI_STEMS = ["प्रतिपत्", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी"];
const VARAS = ["रवि", "सोम", "भौम", "बुध", "गुरु", "शुक्र", "शनि"];
const VARAS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const NAKSHATRAS_DEVA = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी",
  "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा",
  "पूर्वभाद्रपदा", "उत्तरभाद्रपदा", "रेवती",
];
const NAKSHATRAS_EN = [
  "Ashvini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

/** What the rite is (karma) and, where it differs from family welfare, what it is for (phala). */
interface Karma {
  deva: string;
  en: string;
  phalaDeva?: string;
  phalaEn?: string;
}

const FAMILY_WELFARE: [string, string] = [
  "मम सकुटुम्बस्य सपरिवारस्य क्षेमस्थैर्यायुरारोग्यैश्वर्याभिवृद्ध्यर्थं श्रीपरमेश्वरप्रीत्यर्थं",
  "for the well-being, stability, long life, health and prosperity of myself and my family, and to please the Supreme Lord",
];

export const KARMAS: Record<string, Karma> = {
  "daily-puja": { deva: "श्रीइष्टदेवतापूजनम्", en: "the worship of my chosen deity" },
  shodashopachara: { deva: "षोडशोपचारपूजनम्", en: "worship with the sixteen offerings" },
  "ganesh-puja": { deva: "श्रीमहागणपतिपूजनम्", en: "the worship of Shri Mahaganapati" },
  satyanarayan: { deva: "श्रीसत्यनारायणव्रतपूजनं कथाश्रवणं च", en: "the Shri Satyanarayan vrat puja and the hearing of its katha" },
  ekadashi: { deva: "एकादशीव्रतम्", en: "the Ekadashi vrat", phalaDeva: "मम सकलपापक्षयपूर्वकं श्रीविष्णुप्रीत्यर्थं", phalaEn: "for the removal of all my sins and to please Shri Vishnu" },
  sandhya: { deva: "सन्ध्योपासनम्", en: "sandhya upasana", phalaDeva: "ममोपात्तदुरितक्षयद्वारा श्रीपरमेश्वरप्रीत्यर्थं", phalaEn: "for the removal of the sins I have incurred, and to please the Supreme Lord" },
  "griha-pravesh": { deva: "गृहप्रवेशकर्म", en: "the griha pravesha (house-entry) rite" },
  tarpan: { deva: "तर्पणम्", en: "tarpana", phalaDeva: "मम पितॄणाम् अक्षय्यतृप्त्यर्थं", phalaEn: "for the lasting satisfaction of my ancestors" },
  havan: { deva: "हवनकर्म", en: "the havan (fire offering)" },
  "navagraha-shanti": { deva: "नवग्रहशान्तिहवनम्", en: "the Navagraha shanti havan", phalaDeva: "मम जन्मलग्नात् गोचराच्च सर्वारिष्टनिवृत्तिपूर्वकं नवग्रहप्रीत्यर्थं", phalaEn: "for the removal of all afflictions in my birth chart and transits, and to please the nine grahas" },
  "vastu-shanti": { deva: "वास्तुशान्तिकर्म", en: "the Vastu shanti rite", phalaDeva: "अस्मिन् गृहे सर्वदोषनिवृत्तिपूर्वकं सकुटुम्बस्य सुखशान्तिप्राप्त्यर्थं", phalaEn: "for the removal of all defects in this home and for the happiness and peace of my family" },
  mahamrityunjaya: { deva: "महामृत्युञ्जयजपहवनम्", en: "the Mahamrityunjaya japa and havan", phalaDeva: "सर्वारिष्टनिवृत्तिपूर्वकम् आयुरारोग्यप्राप्त्यर्थं", phalaEn: "for the removal of all troubles and for long life and good health" },
  rudrabhishek: { deva: "रुद्राभिषेकम्", en: "the Rudrabhishek" },
  "lakshmi-puja": { deva: "श्रीमहालक्ष्मीपूजनम्", en: "the worship of Shri Mahalakshmi", phalaDeva: "मम गृहे स्थिरलक्ष्मीप्राप्त्यर्थं", phalaEn: "for steady prosperity in my home" },
  navratri: { deva: "नवरात्रव्रतं घटस्थापनं श्रीदुर्गापूजनं च", en: "the Navaratri vrat, ghatasthapana and the worship of Shri Durga" },
  "hanuman-sundarkand": { deva: "श्रीहनुमत्पूजनं सुन्दरकाण्डपाठं च", en: "the worship of Shri Hanuman and the Sundarkand path", phalaDeva: "सर्वसङ्कटनिवृत्तिपूर्वकं श्रीहनुमत्प्रीत्यर्थं", phalaEn: "for the removal of all troubles and to please Shri Hanuman" },
  "mangal-dosh": { deva: "मङ्गलदोषशान्तिकर्म", en: "the Mangal dosha shanti rite", phalaDeva: "भौमग्रहजनितदोषनिवृत्त्यर्थं भौमप्रीत्यर्थं", phalaEn: "for the removal of the dosha arising from Mars, and to please Mangala" },
  "kaal-sarp": { deva: "कालसर्पदोषशान्तिकर्म", en: "the Kaal Sarp dosha shanti rite", phalaDeva: "राहुकेतुजनितदोषनिवृत्त्यर्थं", phalaEn: "for the removal of the dosha arising from Rahu and Ketu" },
  "shani-shanti": { deva: "शनिशान्तिकर्म", en: "the Shani shanti rite", phalaDeva: "शनैश्चरग्रहजनितपीडानिवृत्त्यर्थं शनैश्चरप्रीत्यर्थं", phalaEn: "for relief from the troubles caused by Saturn, and to please Shanaishchara" },
  janmashtami: { deva: "श्रीकृष्णजन्माष्टमीव्रतपूजनम्", en: "the Shri Krishna Janmashtami vrat and puja" },
  "karwa-chauth": { deva: "करकचतुर्थीव्रतम्", en: "the Karaka Chaturthi (Karwa Chauth) vrat", phalaDeva: "मम पत्युः दीर्घायुरारोग्यसौभाग्यप्राप्त्यर्थं", phalaEn: "for my husband's long life and health, and for marital good fortune" },
  "gita-path": { deva: "श्रीमद्भगवद्गीतापाठम्", en: "the recitation of the Shrimad Bhagavad Gita" },
  "bhagwat-saptah": { deva: "श्रीमद्भागवतसप्ताहकथाश्रवणम्", en: "hearing the Shrimad Bhagavat Saptah katha" },
  "akhand-ramayan": { deva: "श्रीरामचरितमानसस्य अखण्डपाठम्", en: "the unbroken recitation of the Shri Ramcharitmanas" },
  "garuda-puran-path": { deva: "गरुडपुराणपाठम्", en: "the recitation of the Garuda Purana", phalaDeva: "दिवंगतात्मनः सद्गतिप्राप्त्यर्थं", phalaEn: "for the departed soul to attain a good onward path" },
};
const DEFAULT_KARMA: Karma = { deva: "श्रीपरमेश्वरपूजनम्", en: "the worship of the Supreme Lord" };

export function hasSankalpa(ritualId: string): boolean {
  return ritualId in KARMAS;
}

export interface SankalpaTime {
  vikramSamvat: number | null;
  ayanaDeva: string;
  ayanaEn: string;
  rituDeva: string;
  rituEn: string;
  masaDeva: string;
  masaEn: string;
  pakshaDeva: string;
  pakshaEn: string;
  tithiDeva: string;
  tithiEn: string;
  varaDeva: string;
  varaEn: string;
  nakshatraDeva: string;
  nakshatraEn: string;
}

/** The elements of time a sankalpa names, taken (as is traditional) at local sunrise. */
export function sankalpaTime(p: Panchang, monthSystem: Profile["monthSystem"]): SankalpaTime {
  const sunIdx = (RASHIS as readonly string[]).indexOf(p.sunRashi);
  const uttarayana = [9, 10, 11, 0, 1, 2].includes(sunIdx); // Makara to Mithuna
  const months = LUNAR_MONTHS as readonly string[];
  const amantaIdx = p.lunarMonth ? months.indexOf(p.lunarMonth.amanta) : 0;
  const shownIdx = p.lunarMonth ? months.indexOf(monthSystem === "purnimanta" ? p.lunarMonth.purnimanta : p.lunarMonth.amanta) : 0;
  const adhik = p.lunarMonth?.adhik && shownIdx === amantaIdx;
  const t = p.tithi.number; // 1..30
  const stem = t === 15 ? "पूर्णिमा" : t === 30 ? "अमावास्या" : TITHI_STEMS[(t - 1) % 15];
  const nakIdx = (NAKSHATRAS as readonly string[]).indexOf(p.nakshatra.name);
  const ritu = RITUS[Math.floor(Math.max(0, amantaIdx) / 2)];
  return {
    vikramSamvat: p.vikramSamvat,
    ayanaDeva: uttarayana ? "उत्तरायणे" : "दक्षिणायने",
    ayanaEn: uttarayana ? "Uttarayana" : "Dakshinayana",
    rituDeva: ritu[0],
    rituEn: ritu[1],
    masaDeva: `${adhik ? "अधिक" : ""}${MONTHS_DEVA[Math.max(0, shownIdx)]}मासे`,
    masaEn: `${adhik ? "Adhika " : ""}${MONTHS_EN[Math.max(0, shownIdx)]}`,
    pakshaDeva: p.tithi.paksha === "Shukla" ? "शुक्लपक्षे" : "कृष्णपक्षे",
    pakshaEn: p.tithi.paksha,
    tithiDeva: `${stem}तिथौ`,
    tithiEn: p.tithi.name,
    varaDeva: `${VARAS[p.weekday]}वासरे`,
    varaEn: VARAS_EN[p.weekday],
    nakshatraDeva: `${NAKSHATRAS_DEVA[Math.max(0, nakIdx)]}नक्षत्रे`,
    nakshatraEn: NAKSHATRAS_EN[Math.max(0, nakIdx)],
  };
}

export function todaysPanchang(place: Place): Panchang {
  const date = todayIn(place.timeZone);
  return computePanchang(zonedToUtc(date, "00:00", place.timeZone), weekdayOf(date), place);
}

const join = (s: string) => s.replace(/\s+/g, "");

/** The full personal sankalpa for a rite, ready to recite. */
export function buildSankalpa(profile: Profile, ritualId: string, panchang: Panchang): Mantra {
  const k = KARMAS[ritualId] ?? DEFAULT_KARMA;
  const time = sankalpaTime(panchang, profile.monthSystem);
  const female = profile.gender === "f";
  const inIndia = profile.place.timeZone === "Asia/Kolkata";
  const [phalaDeva, phalaEn] = k.phalaDeva ? [k.phalaDeva, k.phalaEn!] : FAMILY_WELFARE;
  const gotra = profile.gotraDeva || "काश्यप";
  const samvat = time.vikramSamvat ? `विक्रमाब्दे ${toDevanagariDigits(time.vikramSamvat)} ` : "";

  const devanagari = [
    "ॐ विष्णुर्विष्णुर्विष्णुः।",
    "श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य श्रीब्रह्मणो द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे कलिप्रथमचरणे",
    inIndia ? `जम्बूद्वीपे भरतखण्डे भारतवर्षे ${join(profile.placeDeva)}नगरे` : `${join(profile.placeDeva)}नगरे`,
    `${samvat}${time.ayanaDeva} ${time.rituDeva} ${time.masaDeva} ${time.pakshaDeva} ${time.tithiDeva} ${time.varaDeva} ${time.nakshatraDeva}`,
    // "<name> नामाहं" / "<father> नाम्नः पुत्रः" keep any name grammatical without declining it, as pandits say it.
    `${gotra}गोत्रोत्पन्न${female ? "ा" : "ः"} ${profile.fatherDeva.trim()} नाम्नः ${female ? "पुत्री" : "पुत्रः"} ${profile.nameDeva.trim()} ${female ? "नाम्नी अहं" : "नामाहं"}`,
    `${phalaDeva} ${k.deva.replace(/म्$/, "ं")} करिष्ये॥`,
  ].join(" ");

  const meaning =
    `On this day — in the second half of Brahma's life, in the Shveta Varaha kalpa, the Vaivasvata manvantara, the first quarter of the Kali Yuga of the 28th cycle — ` +
    `${inIndia ? "in Jambudvipa, Bharatavarsha, " : ""}in ${profile.place.name}, ` +
    `${time.vikramSamvat ? `in Vikram Samvat ${time.vikramSamvat}, ` : ""}in ${time.ayanaEn}, ${time.rituEn} ritu, the month of ${time.masaEn}, ${time.pakshaEn} paksha, ${time.tithiEn} tithi, on ${time.varaEn}, under ${time.nakshatraEn} nakshatra — ` +
    `I, ${profile.name}, ${female ? "daughter" : "son"} of ${profile.father}, born in the ${GOTRAS.find((g) => g.deva === gotra)?.name.split(" (")[0] ?? "Kashyap"} gotra, ` +
    `${phalaEn}, shall perform ${k.en}.`;

  return {
    devanagari,
    iast: toIast(devanagari),
    meaning,
    source: `Traditional sankalpa; time from today's panchang for ${profile.place.name} (${profile.monthSystem === "purnimanta" ? "purnimanta" : "amanta"} months)`,
  };
}

/** Tarpan mantras naming each departed ancestor, three offerings of sesame water each. */
export function tarpanMantras(profile: Profile): (Mantra & { title: string })[] {
  const g = profile.gotraDeva || "काश्यप";
  const a = profile.ancestors;
  const male = (rel: string, en: string, name: string | undefined, rupa: string, rupaEn: string) =>
    name
      ? {
          title: `${en}: ${name}`,
          devanagari: `${g}गोत्रः ${rel} ${name.trim()} नामा ${rupa}स्तृप्यताम्। इदं सतिलं जलं तस्मै स्वधा नमः॥`,
          meaning: `May my ${en.toLowerCase()} ${name}, of ${g} gotra, in the form of the ${rupaEn}, be satisfied. This water with sesame is for him — svadha, salutations.`,
          count: "3 times",
        }
      : null;
  const female = (rel: string, en: string, name: string | undefined, rupa: string, rupaEn: string) =>
    name
      ? {
          title: `${en}: ${name}`,
          devanagari: `${g}गोत्रा ${rel} ${name.trim()} नाम्नी देवी ${rupa} तृप्यताम्। इदं सतिलं जलं तस्यै स्वधा नमः॥`,
          meaning: `May my ${en.toLowerCase()} ${name} Devi, of ${g} gotra, in the form of the ${rupaEn}, be satisfied. This water with sesame is for her — svadha, salutations.`,
          count: "3 times",
        }
      : null;
  return [
    male("अस्मत्पिता", "Father", a.father, "वसुरूप", "Vasus"),
    male("अस्मत्पितामहः", "Grandfather", a.grandfather, "रुद्ररूप", "Rudras"),
    male("अस्मत्प्रपितामहः", "Great-grandfather", a.greatGrandfather, "आदित्यरूप", "Adityas"),
    female("अस्मन्माता", "Mother", a.mother, "वसुरूपा", "Vasus"),
    female("अस्मत्पितामही", "Grandmother", a.grandmother, "रुद्ररूपा", "Rudras"),
    female("अस्मत्प्रपितामही", "Great-grandmother", a.greatGrandmother, "आदित्यरूपा", "Adityas"),
  ]
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .map((x) => ({ ...x, iast: toIast(x.devanagari) }));
}
