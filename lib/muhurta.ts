// Muhurta finder: good days and time windows for common activities, following the panchang rules of Muhurta Chintamani
// as most pandits apply them — favourable nakshatras and weekdays for each activity, avoiding Rikta tithis, Amavasya,
// Bhadra (Vishti karana), inauspicious yogas, and the day's Rahu Kaal and Yamaganda.
import * as Astronomy from "astronomy-engine";
import { computePanchang, NAKSHATRAS, siderealLongitude, type Observer, type Panchang } from "./jyotish.ts";
import { weekdayOf, zonedToUtc } from "./time.ts";

export type Activity = "griha-pravesh" | "vivah" | "business" | "vehicle" | "property" | "mundan" | "namkaran" | "travel" | "puja";

const N = (...names: string[]) => names.map((n) => NAKSHATRAS.indexOf(n as (typeof NAKSHATRAS)[number]));

export const ACTIVITIES: Record<Activity, { title: string; nakshatras: number[]; weekdays: number[]; ritual?: string; keywords: string[] }> = {
  "griha-pravesh": { title: "Griha Pravesh (house warming)", nakshatras: N("Rohini", "Mrigashira", "Uttara Phalguni", "Chitra", "Anuradha", "Uttara Ashadha", "Dhanishta", "Shatabhisha", "Uttara Bhadrapada", "Revati"), weekdays: [1, 3, 4, 5], ritual: "griha-pravesh", keywords: ["griha", "grih", "pravesh", "housewarming", "house warming", "new house", "naya ghar", "gruhapravesam"] },
  vivah: { title: "Vivah (marriage)", nakshatras: N("Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"), weekdays: [1, 3, 4, 5], ritual: "samskaras", keywords: ["vivah", "vivaah", "marriage", "wedding", "shaadi", "shadi", "byah", "lagan"] },
  business: { title: "Starting a business or shop", nakshatras: N("Ashwini", "Rohini", "Mrigashira", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Anuradha", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"), weekdays: [1, 3, 4, 5], ritual: "lakshmi-puja", keywords: ["business", "shop", "dukaan", "dukan", "office", "vyapar", "opening", "inauguration", "udghatan", "startup", "company"] },
  vehicle: { title: "Buying a vehicle", nakshatras: N("Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Shatabhisha", "Revati"), weekdays: [1, 3, 4, 5], keywords: ["vehicle", "car", "bike", "gaadi", "gadi", "scooter", "vahan"] },
  property: { title: "Buying property or land", nakshatras: N("Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Anuradha", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"), weekdays: [4, 5], ritual: "vastu-shanti", keywords: ["property", "land", "plot", "flat", "zameen", "jameen", "registry", "bhoomi", "bhumi"] },
  mundan: { title: "Mundan (first haircut)", nakshatras: N("Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Chitra", "Swati", "Jyeshtha", "Shravana", "Dhanishta", "Shatabhisha"), weekdays: [1, 3, 4, 5], ritual: "samskaras", keywords: ["mundan", "chudakarana", "first haircut", "tonsure"] },
  namkaran: { title: "Namkaran (naming ceremony)", nakshatras: N("Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Uttara Bhadrapada", "Revati"), weekdays: [1, 3, 4, 5], ritual: "samskaras", keywords: ["namkaran", "naamkaran", "naming", "name ceremony", "naam"] },
  travel: { title: "Starting a journey", nakshatras: N("Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Anuradha", "Shravana", "Dhanishta", "Revati"), weekdays: [1, 3, 4, 5], keywords: ["travel", "journey", "yatra", "trip", "safar"] },
  puja: { title: "Puja, hawan or a new beginning", nakshatras: N("Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Anuradha", "Uttara Ashadha", "Shravana", "Revati"), weekdays: [0, 1, 3, 4, 5], ritual: "havan", keywords: ["puja", "pooja", "hawan", "havan", "katha", "new beginning", "shubh kaam", "start"] },
};

const RIKTA = [4, 9, 14];
const BAD_YOGAS = ["Vyatipata", "Vaidhriti", "Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Parigha"];

export interface MuhurtaDay {
  date: string; // YYYY-MM-DD in the place's time zone
  weekday: string;
  tithi: string;
  nakshatra: string;
  windows: { start: Date; end: Date; label: string }[];
  notes: string[];
  quality: "best" | "good";
}

function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const sunDistance = (body: Astronomy.Body, at: Date) => {
  const d = Math.abs(siderealLongitude(body, at) - siderealLongitude(Astronomy.Body.Sun, at)) % 360;
  return d > 180 ? 360 - d : d;
};

/** Why a day is ruled out for this activity, or null if it passes. */
function reject(p: Panchang, activity: Activity, at: Date): string | null {
  const def = ACTIVITIES[activity];
  const t = p.tithi.number;
  if (t === 30) return "Amavasya";
  if (RIKTA.includes(((t - 1) % 15) + 1)) return "Rikta tithi";
  if (p.karana.name.startsWith("Vishti")) return "Bhadra (Vishti karana)";
  if (BAD_YOGAS.includes(p.yoga.name)) return `${p.yoga.name} yoga`;
  if (!def.nakshatras.includes(NAKSHATRAS.indexOf(p.nakshatra.name as (typeof NAKSHATRAS)[number]))) return "nakshatra not suited";
  if (!def.weekdays.includes(p.weekday)) return "weekday not suited";
  if (activity === "vivah" || activity === "griha-pravesh" || activity === "mundan") {
    if (["Dhanu", "Meena"].includes(p.sunRashi)) return "Kharmas (Sun in Dhanu or Meena)";
    if (sunDistance(Astronomy.Body.Jupiter, at) < 11) return "Jupiter combust (Guru asta)";
    if (sunDistance(Astronomy.Body.Venus, at) < 10) return "Venus combust (Shukra asta)";
    const m = p.lunarMonth?.amanta;
    const shukla11 = p.tithi.paksha === "Shukla" && t >= 11;
    const chaturmas = m === "Shravana" || m === "Bhadrapada" || m === "Ashvin" || (m === "Ashadha" && (shukla11 || p.tithi.paksha === "Krishna")) || (m === "Kartika" && p.tithi.paksha === "Shukla" && t < 11);
    if (chaturmas) return "Chaturmas (Vishnu's rest)";
  }
  return null;
}

/** Usable windows between sunrise and sunset, cut by Rahu Kaal, Yamaganda and the end of the nakshatra. */
function windowsOf(p: Panchang): MuhurtaDay["windows"] {
  if (!p.sunrise || !p.sunset) return [];
  let end = p.sunset.getTime();
  if (p.nakshatra.endsAt && p.nakshatra.endsAt.getTime() < end) end = p.nakshatra.endsAt.getTime();
  if (p.tithi.endsAt && p.tithi.endsAt.getTime() < end) end = Math.max(p.tithi.endsAt.getTime(), p.sunrise.getTime());
  const bad = p.muhurtas.filter((m) => m.name === "Rahu Kaal" || m.name === "Yamaganda").map((m) => [m.start.getTime(), m.end.getTime()] as const).sort((a, b) => a[0] - b[0]);
  const out: MuhurtaDay["windows"] = [];
  let cursor = p.sunrise.getTime();
  for (const [s, e] of bad) {
    if (s > cursor && cursor < end) out.push({ start: new Date(cursor), end: new Date(Math.min(s, end)), label: "Shubh" });
    cursor = Math.max(cursor, e);
  }
  if (cursor < end) out.push({ start: new Date(cursor), end: new Date(end), label: "Shubh" });
  const abhijit = p.muhurtas.find((m) => m.name === "Abhijit Muhurta");
  const result = out.filter((w) => w.end.getTime() - w.start.getTime() >= 30 * 60000);
  if (abhijit && result.some((w) => w.start <= abhijit.start && w.end >= abhijit.end)) result.push({ start: abhijit.start, end: abhijit.end, label: "Abhijit (most auspicious)" });
  return result.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function findMuhurtas(activity: Activity, from: string, place: Observer & { timeZone: string }, days = 60, limit = 8): MuhurtaDay[] {
  const out: MuhurtaDay[] = [];
  for (let i = 0; i < days && out.length < limit; i++) {
    const date = addDays(from, i);
    const p = computePanchang(zonedToUtc(date, "00:00", place.timeZone), weekdayOf(date), place);
    const at = p.sunrise ?? zonedToUtc(date, "06:00", place.timeZone);
    if (reject(p, activity, at)) continue;
    const windows = windowsOf(p);
    if (!windows.length) continue;
    const notes: string[] = [];
    if (p.tithi.paksha === "Shukla") notes.push("Shukla paksha (waxing Moon) — preferred");
    if (p.nakshatra.endsAt && p.sunset && p.nakshatra.endsAt < p.sunset) notes.push(`${p.nakshatra.name} ends during the day — begin before it changes`);
    out.push({
      date, weekday: p.vaara, tithi: `${p.tithi.paksha} ${p.tithi.name}`, nakshatra: p.nakshatra.name, windows, notes,
      quality: p.tithi.paksha === "Shukla" ? "best" : "good",
    });
  }
  return out;
}

export function detectActivity(text: string): Activity | null {
  const t = ` ${text.toLowerCase()} `;
  for (const [id, def] of Object.entries(ACTIVITIES) as [Activity, (typeof ACTIVITIES)[Activity]][]) {
    if (id !== "puja" && def.keywords.some((k) => t.includes(k))) return id;
  }
  return ACTIVITIES.puja.keywords.some((k) => t.includes(` ${k}`)) ? "puja" : null;
}
