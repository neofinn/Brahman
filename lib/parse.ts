// Pulls birth details (date, time, place) out of free text in English or Hinglish.
import { transliterate } from "./devanagari.ts";
import { findPlaceInText } from "./places.ts";
import { GAZETTEER, type Place } from "./time.ts";

export interface BirthDetails {
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM (24h)
  place?: Place;
  name?: string;
}

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, janvari: 1, janavari: 1,
  feb: 2, february: 2, farvari: 2, faravari: 2, febuary: 2,
  mar: 3, march: 3,
  apr: 4, april: 4, aprail: 4,
  may: 5, mai: 5,
  jun: 6, june: 6, joon: 6,
  jul: 7, july: 7, julai: 7,
  aug: 8, august: 8, agast: 8,
  sep: 9, sept: 9, september: 9, sitambar: 9, sitanbar: 9,
  oct: 10, october: 10, aktubar: 10,
  nov: 11, november: 11, navambar: 11, navanbar: 11,
  dec: 12, december: 12, disambar: 12, disanbar: 12,
};
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");

const pad = (n: number) => String(n).padStart(2, "0");

function validDate(y: number, m: number, d: number): string | undefined {
  if (y < 1800 || y > 2200 || m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return undefined;
  return `${y}-${pad(m)}-${pad(d)}`;
}

function expandYear(y: string): number {
  const n = Number(y);
  if (y.length === 4) return n;
  // Two-digit years: assume a past birth year.
  const now = new Date().getFullYear() % 100;
  return n <= now ? 2000 + n : 1900 + n;
}

/** Returns the date and the text with the date removed (so its digits are not read as a time). */
function extractDate(text: string): { date?: string; rest: string } {
  const patterns: [RegExp, (m: RegExpMatchArray) => string | undefined][] = [
    [/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/, (m) => validDate(+m[1], +m[2], +m[3])],
    [/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/, (m) => validDate(expandYear(m[3]), +m[2], +m[1])],
    [new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?[\\s\\-,]+(${MONTH_RE})[a-z]*[\\s\\-,]+(\\d{4}|\\d{2})\\b`, "i"), (m) => validDate(expandYear(m[3]), MONTHS[m[2].toLowerCase()], +m[1])],
    [new RegExp(`\\b(${MONTH_RE})[a-z]*[\\s\\-]+(\\d{1,2})(?:st|nd|rd|th)?,?[\\s\\-]+(\\d{4})\\b`, "i"), (m) => validDate(+m[3], MONTHS[m[1].toLowerCase()], +m[2])],
  ];
  for (const [re, toDate] of patterns) {
    const m = text.match(re);
    if (m) {
      const date = toDate(m);
      if (date) return { date, rest: text.replace(m[0], " ") };
    }
  }
  return { rest: text };
}

function extractTime(text: string): string | undefined {
  const t = text.toLowerCase();
  const morning = /\b(subah|subha|savere|sawere|morning|prabhat)\b/.test(t);
  const evening = /\b(shaam|sham|evening|sandhya)\b/.test(t);
  const afternoon = /\b(dopahar|dopehar|afternoon|noon)\b/.test(t);
  const night = /\b(raat|rat|night)\b/.test(t);

  const toHHMM = (h: number, min: number, meridiem?: string) => {
    if (min > 59 || h > 23) return undefined;
    if (meridiem) {
      const pm = meridiem.startsWith("p");
      if (h > 12) return undefined;
      if (pm && h < 12) h += 12;
      if (!pm && h === 12) h = 0;
    } else if (h <= 12) {
      if ((evening || afternoon) && h < 12) h += 12;
      else if (night && h >= 6 && h < 12) h += 12;
      else if (night && h === 12) h = 0;
    }
    return `${pad(h)}:${pad(min)}`;
  };

  const withMeridiem = t.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)(?![a-z])/);
  if (withMeridiem) return toHHMM(+withMeridiem[1], +(withMeridiem[2] ?? 0), withMeridiem[3].replace(/\./g, ""));
  const clock = t.match(/\b(\d{1,2})[:.](\d{2})\b/);
  if (clock) return toHHMM(+clock[1], +clock[2]);
  const baje = t.match(/\b(\d{1,2})\s*(?:baje|bje|o'?clock|hrs|hours)\b/);
  if (baje) return toHHMM(+baje[1], 0);
  const aroundHour = t.match(/\b(?:at|time|samay|time of birth|birth time)\s*(?:is|:)?\s*(\d{1,2})\b/);
  if (aroundHour && (morning || evening || afternoon || night)) return toHHMM(+aroundHour[1], 0);
  return undefined;
}

function normalise(s: string) {
  return ` ${s.toLowerCase().replace(/[^a-zऀ-ॿ]+/g, " ")} `;
}

export function findPlace(text: string): Place | undefined {
  const hay = normalise(text);
  let best: { place: Place; len: number } | undefined;
  for (const p of GAZETTEER) {
    for (const name of [p.name, ...(p.aliases ?? [])]) {
      const needle = normalise(name);
      if (hay.includes(needle) && (!best || needle.length > best.len)) {
        const { aliases: _aliases, ...place } = p;
        best = { place, len: needle.length };
      }
    }
  }
  if (best) return best.place;
  // Otherwise any town in the offline gazetteer ("born in Haridwar", "Ratlam").
  const found = findPlaceInText(text);
  return found && { name: found.name, latitude: found.latitude, longitude: found.longitude, timeZone: found.timeZone, region: found.region };
}

function extractName(text: string): string | undefined {
  const m = text.match(/\b(?:my name is|name is|name:|naam|mera naam)\s+([A-Za-z][A-Za-z ]{1,30}?)(?=\s*(?:,|\.|and|aur|hai|born|dob|$))/i);
  return m?.[1]?.trim();
}

export function parseBirthDetails(input: string): BirthDetails {
  const text = transliterate(input);
  const { date, rest } = extractDate(text);
  const time = extractTime(rest);
  const place = findPlace(text);
  const name = extractName(text);
  return { date, time, place, name };
}
