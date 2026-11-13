// The report catalogue: every PDF report Brahman can prepare from a kundli (or two, for matching), its price, what it
// contains, and which sections of the full report make it up. Prices are in Indian rupees; change them here.

export type SectionId =
  | "guide-now" | "career" | "answers" | "devata" | "gems" | "gem-planets" | "charts" | "vargas" | "lagnas" | "planets"
  | "confluence" | "parashari" | "yogas-doshas" | "areas" | "forecast" | "remedies" | "jaimini" | "kp" | "lalkitab"
  | "bnn" | "numerology" | "life";

export interface ReportDef {
  id: string;
  title: string;
  hindi: string;
  price: number; // INR
  mrp?: number; // shown struck through
  tagline: string;
  includes: string[];
  /** Kundli reports list their sections; "milan" needs two birth charts. */
  kind: "kundli" | "milan";
  sections: SectionId[];
  /** Restrict life-guide answers, life areas, gem goals and deity goals to these ids (all when absent). */
  answers?: string[];
  areas?: string[];
  vargas?: string[];
  gemGoals?: string[];
  devataGoals?: string[];
  popular?: boolean;
}

const ALL: SectionId[] = ["guide-now", "career", "answers", "devata", "gems", "charts", "vargas", "lagnas", "planets", "confluence", "parashari", "yogas-doshas", "areas", "forecast", "remedies", "jaimini", "kp", "lalkitab", "bnn", "numerology", "life"];

export const REPORTS: ReportDef[] = [
  {
    id: "complete", title: "Complete Vedic Kundli Report", hindi: "सम्पूर्ण वैदिक कुण्डली", price: 999, mrp: 2499, kind: "kundli", popular: true,
    tagline: "Everything Brahman knows about your chart — 25+ pages in plain words and in depth.",
    includes: ["Your life guide with dates and ages", "All 20 divisional charts and every lagna", "Career, wealth, marriage, health, children timing", "Deities, gemstones and remedies", "Parashari, Jaimini, KP, Lal Kitab, Nadi, numerology", "Your life so far and final observations"],
    sections: ALL,
  },
  {
    id: "astrology", title: "Astrology Predictions Report", hindi: "ज्योतिष फलादेश", price: 699, mrp: 1499, kind: "kundli",
    tagline: "Predictions from every system, cross-checked — what each says and where they agree.",
    includes: ["Final observations from Parashari, Jaimini, KP and Lal Kitab", "Rajyogas and doshas", "Every area of life rated", "Next five years, period by period", "Jaimini chara dasha and KP significators"],
    sections: ["guide-now", "charts", "planets", "confluence", "yogas-doshas", "areas", "forecast", "jaimini", "kp", "remedies"],
  },
  {
    id: "career", title: "Career & Job Report", hindi: "करियर एवं नौकरी रिपोर्ट", price: 499, mrp: 999, kind: "kundli", popular: true,
    tagline: "Your best field, when the first job and promotions come, and how to rise.",
    includes: ["Best career fields from the 10th house, amatyakaraka and D10", "First job and career-rise windows with ages", "Reputation-care periods", "D10 Dashamsha chart", "Gemstone and deity for career"],
    sections: ["guide-now", "career", "answers", "areas", "charts", "vargas", "forecast", "gems", "devata", "jaimini"],
    answers: ["first-job", "career-rise", "status-care", "abroad"], areas: ["career", "education"], vargas: ["D10", "D24"], gemGoals: ["career", "business", "confidence"], devataGoals: ["Career, promotion and status", "Income, gains and business growth", "Removing obstacles and new beginnings"],
  },
  {
    id: "dhan", title: "Dhan (Wealth) Report", hindi: "धन रिपोर्ट", price: 499, mrp: 999, kind: "kundli", popular: true,
    tagline: "When money grows, when to invest, buy property or take a loan — and when to be careful.",
    includes: ["Investment, property and loan windows", "Money-caution periods", "Dhana yogas, Hora and Indu lagna", "D2 Hora, D4 and D11 charts", "Lakshmi–Kubera worship and wealth gemstones"],
    sections: ["guide-now", "answers", "areas", "charts", "vargas", "lagnas", "yogas-doshas", "gems", "devata", "forecast"],
    answers: ["investment", "wealth-care", "house", "loan", "career-rise"], areas: ["wealth", "career"], vargas: ["D2", "D4", "D11"], gemGoals: ["wealth", "business", "property"], devataGoals: ["Wealth and prosperity", "Income, gains and business growth", "Home, property and vehicles"],
  },
  {
    id: "marriage", title: "Marriage & Love Report", hindi: "विवाह एवं प्रेम रिपोर्ट", price: 499, mrp: 999, kind: "kundli",
    tagline: "When you will marry, your spouse's nature, relationship stress periods and remedies.",
    includes: ["Marriage timing with ages", "Heartbreak and relationship-stress periods, past and ahead", "Spouse from Darakaraka and Upapada", "Mangal dosha check", "D9 Navamsha", "Love and marriage gemstones and deities"],
    sections: ["guide-now", "answers", "areas", "charts", "vargas", "jaimini", "yogas-doshas", "gems", "devata"],
    answers: ["marriage", "heartbreak", "children"], areas: ["marriage", "children"], vargas: ["D7"], gemGoals: ["love", "marriage"], devataGoals: ["Marriage (for a girl)", "Marriage (for a boy) and a happy married life", "Love, romance and harmony with partner"],
  },
  {
    id: "gemstone", title: "Gemstone Report", hindi: "रत्न रिपोर्ट", price: 299, mrp: 699, kind: "kundli",
    tagline: "Which stones suit your chart — and which to never wear — for every life goal.",
    includes: ["Verdict for all nine gems for your lagna", "Best gem for wealth, career, studies, love, health and more", "Finger, metal, day, weight and mantra", "Affordable substitutes"],
    sections: ["charts", "gem-planets", "gems"],
  },
  {
    id: "health", title: "Health Report", hindi: "स्वास्थ्य रिपोर्ट", price: 399, mrp: 799, kind: "kundli",
    tagline: "Periods to take care of health, the doshas behind them and protective remedies.",
    includes: ["Health-care periods with ages", "Health rating and factors", "D6 Shashthamsha chart", "Doshas and remedies", "Mahamrityunjaya and Dhanvantari worship"],
    sections: ["guide-now", "answers", "areas", "charts", "vargas", "yogas-doshas", "remedies", "devata"],
    answers: ["health"], areas: ["health"], vargas: ["D6", "D8", "D30"], gemGoals: ["health"], devataGoals: ["Health and recovery", "Peace of mind and freedom from anxiety"],
  },
  {
    id: "children", title: "Santan (Children) Report", hindi: "सन्तान रिपोर्ट", price: 399, mrp: 799, kind: "kundli",
    tagline: "When children are indicated, the 5th house and D7, and Santan Gopal worship.",
    includes: ["Childbirth timing", "5th house and Jupiter analysis", "D7 Saptamsha chart", "Santan Gopal mantra and remedies"],
    sections: ["answers", "areas", "charts", "vargas", "devata", "gems"],
    answers: ["children", "marriage"], areas: ["children"], vargas: ["D7"], gemGoals: ["children"], devataGoals: ["Children"],
  },
  {
    id: "education", title: "Education Report", hindi: "शिक्षा रिपोर्ट", price: 299, mrp: 599, kind: "kundli",
    tagline: "Learning strengths, best subjects and the deity and gem for studies.",
    includes: ["Education rating and factors", "D24 Chaturvimshamsha chart", "Saraswati worship and gem for studies", "Career fields that suit you"],
    sections: ["career", "areas", "charts", "vargas", "gems", "devata"],
    areas: ["education", "career"], vargas: ["D24"], gemGoals: ["studies"], devataGoals: ["Studies, exams and intelligence"],
  },
  {
    id: "foreign", title: "Foreign Travel & Settlement Report", hindi: "विदेश यात्रा रिपोर्ट", price: 299, mrp: 599, kind: "kundli",
    tagline: "Chances and timing of going abroad, studying or settling overseas.",
    includes: ["Foreign travel and settlement windows", "12th and 9th house analysis", "D12 and D9 charts", "Deity for going abroad"],
    sections: ["answers", "areas", "charts", "vargas", "devata"],
    answers: ["abroad"], areas: ["foreign"], vargas: ["D12"], devataGoals: ["Going abroad"],
  },
  {
    id: "yearly", title: "5-Year Forecast Report", hindi: "पंचवर्षीय भविष्यफल", price: 499, mrp: 999, kind: "kundli",
    tagline: "Period-by-period forecast with transits, what to do in each, and the deity for each phase.",
    includes: ["This time of your life", "Every dasha period for five years", "Jupiter, Saturn and Rahu transits", "Numerology personal year", "Deities through the coming years"],
    sections: ["guide-now", "forecast", "devata", "remedies"],
  },
  {
    id: "dosha", title: "Dosha & Remedies Report", hindi: "दोष निवारण रिपोर्ट", price: 399, mrp: 799, kind: "kundli",
    tagline: "Mangal, Kaal Sarp, Sade Sati, Pitru and every dosha — with cancellations and a remedy plan.",
    includes: ["Every dosha with cancellations", "Prioritised remedy plan — mantra, daan, vrat, rudraksha", "Lal Kitab debts (rin) and upay", "Deities for your doshas"],
    sections: ["charts", "yogas-doshas", "remedies", "lalkitab", "devata"],
  },
  {
    id: "lalkitab", title: "Lal Kitab Report", hindi: "लाल किताब रिपोर्ट", price: 399, mrp: 799, kind: "kundli",
    tagline: "Your Lal Kitab chart, planet-by-planet effects, ancestral debts and simple upay.",
    includes: ["Lal Kitab kundli", "Effect of every planet by house", "Pakka ghar and sleeping houses", "Rin (ancestral debts) and remedies"],
    sections: ["lalkitab"],
  },
  {
    id: "numerology", title: "Numerology & Lo Shu Report", hindi: "अंक ज्योतिष रिपोर्ट", price: 199, mrp: 499, kind: "kundli",
    tagline: "Name, birth and destiny numbers, your Lo Shu grid and remedies for missing numbers.",
    includes: ["Chaldean name, birth and destiny numbers", "Lo Shu grid with planes", "Missing numbers and remedies", "Personal year"],
    sections: ["numerology"],
  },
  {
    id: "devata", title: "Ishta Devata & Worship Report", hindi: "इष्ट देवता रिपोर्ट", price: 299, mrp: 599, kind: "kundli",
    tagline: "Your ishta devata, nakshatra devata and the deity for every wish — with mantras.",
    includes: ["Ishta devata (Jaimini)", "Deity for your current dasha", "Deity for 16 wishes with mantra and day", "Daily worship routine"],
    sections: ["devata"],
  },
  {
    id: "life", title: "Life So Far & Birth-time Check", hindi: "जीवन पुनरावलोकन", price: 299, mrp: 599, kind: "kundli",
    tagline: "Every chapter of your life so far from the chart — check it against your past.",
    includes: ["Every dasha period since birth with your age", "Sade Sati and Jupiter/Saturn returns", "Past relationship-stress periods to verify"],
    sections: ["planets", "life", "answers"],
    answers: ["first-job", "heartbreak"],
  },
  {
    id: "milan", title: "Kundli Milan Report", hindi: "कुण्डली मिलान रिपोर्ट", price: 599, mrp: 1199, kind: "milan",
    tagline: "36-guna matching of two kundlis with doshas, cancellations and remedies.",
    includes: ["All eight kootas with explanation", "Nadi, Bhakoot and Mangal dosha checks", "Both charts and their marriage indications", "Remedies"],
    sections: [],
  },
];

/** A free basic report given away to every visitor. */
export const FREE_REPORT: ReportDef = {
  id: "basic", title: "Free Basic Kundli", hindi: "निःशुल्क कुण्डली", price: 0, kind: "kundli",
  tagline: "Your D1 and D9 charts, planets, lagnas and what this time of life holds.",
  includes: ["D1 and D9 charts", "Planet positions", "All lagnas", "This time of your life"],
  sections: ["guide-now", "charts", "planets", "lagnas"],
};

export function getReport(id: string): ReportDef | undefined {
  return id === FREE_REPORT.id ? FREE_REPORT : REPORTS.find((r) => r.id === id);
}

/** Paise for Razorpay. */
export const pricePaise = (r: ReportDef) => Math.round(r.price * 100);
