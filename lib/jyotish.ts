// Vedic astronomy core: sidereal positions, panchang elements and kundli.
// Pure functions over astronomy-engine so they run in the browser and in tests.
import * as Astronomy from "astronomy-engine";

export const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const;

export const RASHIS_DEVANAGARI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन",
] as const;

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

// Vimshottari lord of each nakshatra repeats every 9.
const NAKSHATRA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;
const DASHA_YEARS: Record<(typeof NAKSHATRA_LORDS)[number], number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

export const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
] as const;

export const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana",
  "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha",
  "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)"] as const;

export const LUNAR_MONTHS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
] as const;

export const VAARAS = [
  "Ravivara (Sunday)", "Somavara (Monday)", "Mangalavara (Tuesday)", "Budhavara (Wednesday)",
  "Guruvara (Thursday)", "Shukravara (Friday)", "Shanivara (Saturday)",
] as const;

const norm360 = (x: number) => ((x % 360) + 360) % 360;
const DEG = Math.PI / 180;

/** Lahiri (Chitrapaksha) ayanamsa, linear approximation good to well under an arcminute for 1900–2100. */
export function lahiriAyanamsa(date: Date): number {
  const years = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000);
  return 23.853 + (50.2788 / 3600) * years;
}

function tropicalLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Moon) return Astronomy.EclipticGeoMoon(date).lon;
  if (body === Astronomy.Body.Sun) return Astronomy.SunPosition(date).elon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;
}

export function siderealLongitude(body: Astronomy.Body, date: Date): number {
  return norm360(tropicalLongitude(body, date) - lahiriAyanamsa(date));
}

/** Mean lunar node (Rahu), sidereal. */
export function rahuLongitude(date: Date): number {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (36525 * 86400000);
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return norm360(omega - lahiriAyanamsa(date));
}

/** Sidereal ascendant (lagna) for a place and instant. */
export function ascendant(date: Date, latitude: number, longitude: number): number {
  const ramc = norm360(Astronomy.SiderealTime(date) * 15 + longitude) * DEG;
  const eps = 23.4392911 * DEG - (0.0130042 * DEG * (date.getTime() - Date.UTC(2000, 0, 1, 12))) / (36525 * 86400000);
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(latitude * DEG) * Math.sin(eps)));
  return norm360(asc / DEG - lahiriAyanamsa(date));
}

export function rashiOf(lon: number) {
  const index = Math.floor(norm360(lon) / 30);
  return { index, name: RASHIS[index], devanagari: RASHIS_DEVANAGARI[index], degree: norm360(lon) - index * 30 };
}

export function nakshatraOf(lon: number) {
  const span = 360 / 27;
  const index = Math.floor(norm360(lon) / span);
  const within = norm360(lon) - index * span;
  return { index, name: NAKSHATRAS[index], pada: Math.floor(within / (span / 4)) + 1, lord: NAKSHATRA_LORDS[index % 9], fraction: within / span };
}

export function formatDegrees(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
}

// ---------------------------------------------------------------------------
// Panchang

export interface Observer {
  latitude: number;
  longitude: number;
}

function elongation(date: Date): number {
  // Difference is independent of ayanamsa, so use tropical values.
  return norm360(tropicalLongitude(Astronomy.Body.Moon, date) - tropicalLongitude(Astronomy.Body.Sun, date));
}

function tithiAt(date: Date) {
  const e = elongation(date);
  const n = Math.floor(e / 12); // 0..29
  const paksha = n < 15 ? "Shukla" : "Krishna";
  let name: string;
  if (n === 14) name = "Purnima";
  else if (n === 29) name = "Amavasya";
  else name = TITHIS[n % 15];
  return { number: n + 1, name, paksha } as const;
}

function karanaAt(date: Date): string {
  const k = Math.floor(elongation(date) / 6); // 0..59
  if (k === 0) return "Kimstughna";
  if (k >= 57) return ["Shakuni", "Chatushpada", "Naga"][k - 57];
  return MOVABLE_KARANAS[(k - 1) % 7];
}

function yogaAt(date: Date) {
  const sum = norm360(siderealLongitude(Astronomy.Body.Sun, date) + siderealLongitude(Astronomy.Body.Moon, date));
  return YOGAS[Math.floor(sum / (360 / 27))];
}

/** Find the instant after `start` when f(t) (an index that increments over time) changes, by bisection. */
function nextChange(start: Date, f: (d: Date) => number, maxHours = 36): Date | null {
  const v0 = f(start);
  const stepMs = 30 * 60000;
  let lo = start.getTime();
  let hi = lo;
  for (let t = lo + stepMs; t <= lo + maxHours * 3600000; t += stepMs) {
    if (f(new Date(t)) !== v0) {
      hi = t;
      break;
    }
    lo = t;
  }
  if (hi === start.getTime()) return null;
  while (hi - lo > 30000) {
    const mid = (lo + hi) / 2;
    if (f(new Date(mid)) === v0) lo = mid;
    else hi = mid;
  }
  return new Date(hi);
}

function lunarMonthAt(date: Date) {
  // Amanta month: named after the sidereal sign the Sun occupies at the new moon that began it.
  const prevNew = Astronomy.SearchMoonPhase(0, new Date(date.getTime() - 31 * 86400000), 31);
  let start = prevNew?.date;
  // SearchMoonPhase finds the first new moon after the start date; walk forward to the latest one before `date`.
  while (start) {
    const next = Astronomy.SearchMoonPhase(0, new Date(start.getTime() + 86400000), 31)?.date;
    if (!next || next > date) break;
    start = next;
  }
  if (!start) return null;
  const end = Astronomy.SearchMoonPhase(0, new Date(start.getTime() + 86400000), 31)?.date;
  const rashiStart = rashiOf(siderealLongitude(Astronomy.Body.Sun, start)).index;
  const rashiEnd = end ? rashiOf(siderealLongitude(Astronomy.Body.Sun, end)).index : -1;
  const index = (rashiStart + 1) % 12;
  return { index, name: LUNAR_MONTHS[index], adhik: rashiStart === rashiEnd };
}

export interface Muhurta {
  name: string;
  start: Date;
  end: Date;
  auspicious: boolean;
}

// 1-based eighth of the daytime ruled by Rahu, Yamaganda and Gulika, indexed by weekday (0 = Sunday).
const RAHU_SEGMENT = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_SEGMENT = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEGMENT = [7, 6, 5, 4, 3, 2, 1];

export interface Panchang {
  vaara: string;
  weekday: number;
  tithi: { number: number; name: string; paksha: "Shukla" | "Krishna"; endsAt: Date | null };
  nakshatra: { name: string; pada: number; lord: string; endsAt: Date | null };
  yoga: { name: string; endsAt: Date | null };
  karana: { name: string; endsAt: Date | null };
  sunRashi: string;
  moonRashi: string;
  lunarMonth: { amanta: string; purnimanta: string; adhik: boolean } | null;
  vikramSamvat: number | null;
  shakaSamvat: number | null;
  sunrise: Date | null;
  sunset: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  muhurtas: Muhurta[];
  observances: string[];
}

/**
 * Panchang for the civil day that starts at `dayStart` (local midnight, as a UTC instant).
 * The five limbs are evaluated at sunrise, as is traditional; `weekday` is the local weekday.
 */
export function computePanchang(dayStart: Date, weekday: number, observer: Observer): Panchang {
  const obs = new Astronomy.Observer(observer.latitude, observer.longitude, 0);
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, dayStart, 1)?.date ?? null;
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, sunrise ?? dayStart, 1)?.date ?? null;
  const moonrise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, +1, dayStart, 1)?.date ?? null;
  const moonset = Astronomy.SearchRiseSet(Astronomy.Body.Moon, obs, -1, dayStart, 1)?.date ?? null;
  const at = sunrise ?? new Date(dayStart.getTime() + 6 * 3600000);

  const tithi = tithiAt(at);
  const moonSid = siderealLongitude(Astronomy.Body.Moon, at);
  const sunSid = siderealLongitude(Astronomy.Body.Sun, at);
  const nak = nakshatraOf(moonSid);

  const month = lunarMonthAt(at);
  let lunarMonth: Panchang["lunarMonth"] = null;
  let vikramSamvat: number | null = null;
  if (month) {
    const purnimantaIndex = tithi.paksha === "Krishna" ? (month.index + 1) % 12 : month.index;
    lunarMonth = { amanta: month.name, purnimanta: LUNAR_MONTHS[purnimantaIndex], adhik: month.adhik };
    // Vikram Samvat increments at Chaitra Shukla Pratipada.
    const civilYear = at.getUTCFullYear();
    const beforeNewYear = at.getUTCMonth() <= 4 && month.index >= 9;
    vikramSamvat = civilYear + (beforeNewYear ? 56 : 57);
  }

  const muhurtas: Muhurta[] = [];
  if (sunrise && sunset) {
    const day = sunset.getTime() - sunrise.getTime();
    const eighth = (n: number, name: string): Muhurta => ({
      name,
      start: new Date(sunrise.getTime() + ((n - 1) * day) / 8),
      end: new Date(sunrise.getTime() + (n * day) / 8),
      auspicious: false,
    });
    const muhurta = day / 15; // a daytime muhurta is 1/15 of the day
    muhurtas.push({
      name: "Brahma Muhurta",
      start: new Date(sunrise.getTime() - 96 * 60000),
      end: new Date(sunrise.getTime() - 48 * 60000),
      auspicious: true,
    });
    if (weekday !== 3) {
      // Abhijit (8th muhurta) is traditionally not used on Wednesdays.
      muhurtas.push({
        name: "Abhijit Muhurta",
        start: new Date(sunrise.getTime() + 7 * muhurta),
        end: new Date(sunrise.getTime() + 8 * muhurta),
        auspicious: true,
      });
    }
    muhurtas.push(eighth(RAHU_SEGMENT[weekday], "Rahu Kaal"));
    muhurtas.push(eighth(YAMAGANDA_SEGMENT[weekday], "Yamaganda"));
    muhurtas.push(eighth(GULIKA_SEGMENT[weekday], "Gulika Kaal"));
    muhurtas.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  const observances: string[] = [];
  const t = tithi.number;
  if (t === 11 || t === 26) observances.push("Ekadashi vrat");
  if (t === 15) observances.push("Purnima — Satyanarayan puja, Purnima vrat");
  if (t === 30) observances.push("Amavasya — pitru tarpan");
  if (t === 19) observances.push("Sankashti Chaturthi (Ganesha)");
  if (t === 4) observances.push("Vinayaka Chaturthi (Ganesha)");
  if (t === 13 || t === 28) observances.push("Pradosh vrat (Shiva) at dusk");
  if (t === 29) observances.push("Masik Shivaratri");
  if (t === 8 || t === 23) observances.push("Ashtami — Devi worship");

  return {
    vaara: VAARAS[weekday],
    weekday,
    tithi: { ...tithi, endsAt: nextChange(at, (d) => Math.floor(elongation(d) / 12)) },
    nakshatra: {
      name: nak.name,
      pada: nak.pada,
      lord: nak.lord,
      endsAt: nextChange(at, (d) => nakshatraOf(siderealLongitude(Astronomy.Body.Moon, d)).index),
    },
    yoga: { name: yogaAt(at), endsAt: nextChange(at, (d) => YOGAS.indexOf(yogaAt(d) as (typeof YOGAS)[number])) },
    karana: { name: karanaAt(at), endsAt: nextChange(at, (d) => Math.floor(elongation(d) / 6), 18) },
    sunRashi: rashiOf(sunSid).name,
    moonRashi: rashiOf(moonSid).name,
    lunarMonth,
    vikramSamvat,
    shakaSamvat: vikramSamvat === null ? null : vikramSamvat - 135,
    sunrise,
    sunset,
    moonrise,
    moonset,
    muhurtas,
    observances,
  };
}

// ---------------------------------------------------------------------------
// Kundli

export interface GrahaPosition {
  name: string;
  sanskrit: string;
  longitude: number;
  rashi: ReturnType<typeof rashiOf>;
  nakshatra: ReturnType<typeof nakshatraOf>;
  house: number;
  retrograde: boolean;
}

export interface Dasha {
  lord: string;
  start: Date;
  end: Date;
}

export interface Kundli {
  lagna: { longitude: number; rashi: ReturnType<typeof rashiOf>; nakshatra: ReturnType<typeof nakshatraOf> };
  grahas: GrahaPosition[];
  dashas: Dasha[];
  ayanamsa: number;
}

const GRAHAS: { name: string; sanskrit: string; body?: Astronomy.Body }[] = [
  { name: "Sun", sanskrit: "Surya", body: Astronomy.Body.Sun },
  { name: "Moon", sanskrit: "Chandra", body: Astronomy.Body.Moon },
  { name: "Mars", sanskrit: "Mangala", body: Astronomy.Body.Mars },
  { name: "Mercury", sanskrit: "Budha", body: Astronomy.Body.Mercury },
  { name: "Jupiter", sanskrit: "Guru", body: Astronomy.Body.Jupiter },
  { name: "Venus", sanskrit: "Shukra", body: Astronomy.Body.Venus },
  { name: "Saturn", sanskrit: "Shani", body: Astronomy.Body.Saturn },
  { name: "Rahu", sanskrit: "Rahu" },
  { name: "Ketu", sanskrit: "Ketu" },
];

const YEAR_MS = 365.2425 * 86400000;

export function vimshottariDashas(birth: Date, moonLongitude: number): Dasha[] {
  const nak = nakshatraOf(moonLongitude);
  const order = NAKSHATRA_LORDS;
  const first = order.indexOf(nak.lord);
  const dashas: Dasha[] = [];
  // The first dasha started before birth: the elapsed part of the nakshatra is already spent.
  let cursor = birth.getTime() - nak.fraction * DASHA_YEARS[nak.lord] * YEAR_MS;
  for (let i = 0; i < 9; i++) {
    const lord = order[(first + i) % 9];
    const end = cursor + DASHA_YEARS[lord] * YEAR_MS;
    dashas.push({ lord, start: new Date(cursor), end: new Date(end) });
    cursor = end;
  }
  return dashas;
}

export function computeKundli(birth: Date, observer: Observer): Kundli {
  const lagnaLon = ascendant(birth, observer.latitude, observer.longitude);
  const lagnaRashi = rashiOf(lagnaLon);
  const rahu = rahuLongitude(birth);
  const dayLater = new Date(birth.getTime() + 86400000);

  const grahas = GRAHAS.map(({ name, sanskrit, body }) => {
    let longitude: number;
    let retrograde: boolean;
    if (name === "Rahu" || name === "Ketu") {
      longitude = name === "Rahu" ? rahu : norm360(rahu + 180);
      retrograde = true; // the nodes always move backwards (mean motion)
    } else {
      longitude = siderealLongitude(body!, birth);
      const delta = norm360(siderealLongitude(body!, dayLater) - longitude);
      retrograde = name !== "Sun" && name !== "Moon" && delta > 180;
    }
    const rashi = rashiOf(longitude);
    return {
      name,
      sanskrit,
      longitude,
      rashi,
      nakshatra: nakshatraOf(longitude),
      house: ((rashi.index - lagnaRashi.index + 12) % 12) + 1, // whole-sign houses
      retrograde,
    };
  });

  const moon = grahas.find((g) => g.name === "Moon")!;
  return {
    lagna: { longitude: lagnaLon, rashi: lagnaRashi, nakshatra: nakshatraOf(lagnaLon) },
    grahas,
    dashas: vimshottariDashas(birth, moon.longitude),
    ayanamsa: lahiriAyanamsa(birth),
  };
}
