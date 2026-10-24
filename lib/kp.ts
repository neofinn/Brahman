// Krishnamurti Paddhati (KP): KP ayanamsa, Placidus house cusps, sign/star/sub/sub-sub lords, the four-step
// significators of each house, and ruling planets.
import * as Astronomy from "astronomy-engine";
import { obliquity, ramc, RASHIS, tropicalAscendant, tropicalLongitude, tropicalRahu } from "./jyotish.ts";

const norm = (x: number) => ((x % 360) + 360) % 360;
const DEG = Math.PI / 180;

export const SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS: Record<string, number> = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const NAK = 360 / 27;

/** Krishnamurti ayanamsa: 22°22′03.24″ at 1900.0 plus 50.2388475″ a year. */
export function kpAyanamsa(date: Date): number {
  const years = (date.getTime() - Date.UTC(1900, 0, 0, 12)) / (365.2425 * 86400000);
  return 22.367567 + (years * 50.2388475) / 3600;
}

export interface Lords {
  sign: string;
  star: string;
  sub: string;
  subSub: string;
}

/** Sign lord, star (nakshatra) lord, sub lord and sub-sub lord of a sidereal longitude. */
export function kpLords(longitude: number): Lords {
  const lon = norm(longitude);
  const nakIdx = Math.floor(lon / NAK);
  const star = DASHA_ORDER[nakIdx % 9];
  // Within the nakshatra, the 9 subs follow the Vimshottari order from the star lord, sized by dasha years.
  const pos = lon - nakIdx * NAK;
  const divide = (span: number, start: string, within: number): [string, number, number] => {
    let i = DASHA_ORDER.indexOf(start);
    for (let n = 0; n < 9; n++, i++) {
      const lord = DASHA_ORDER[i % 9];
      const size = (span * DASHA_YEARS[lord]) / 120;
      if (within < size || n === 8) return [lord, size, within];
      within -= size;
    }
    throw new Error("unreachable");
  };
  const [sub, subSize, inSub] = divide(NAK, star, pos);
  const [subSub] = divide(subSize, sub, inSub);
  return { sign: SIGN_LORDS[Math.floor(lon / 30)], star, sub, subSub };
}

/** Placidus house cusps (tropical, houses 1–12) from the RAMC, by trisecting the diurnal and nocturnal semi-arcs. */
export function placidusFromArmc(armc: number, latitude: number, obliquityDeg: number): number[] {
  const eps = obliquityDeg * DEG;
  const phi = latitude * DEG;
  const raToLon = (ra: number) => norm(Math.atan2(Math.sin(ra * DEG), Math.cos(ra * DEG) * Math.cos(eps)) / DEG);
  const mc = raToLon(armc);
  const r = armc * DEG;
  const asc = norm(Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / DEG);
  // Above the horizon (houses 11, 12): RA = RAMC + f·DSA. Below (houses 2, 3): RA = RAIC − f·NSA.
  const cusp = (f: number, below: boolean, guess: number) => {
    let lon = guess;
    for (let i = 0; i < 100; i++) {
      const dec = Math.asin(Math.sin(eps) * Math.sin(lon * DEG));
      const x = -Math.tan(phi) * Math.tan(dec);
      if (Math.abs(x) > 1) return NaN; // circumpolar: Placidus is undefined
      const dsa = Math.acos(x) / DEG;
      const next = raToLon(norm(below ? armc + 180 - f * (180 - dsa) : armc + f * dsa));
      if (Math.abs(((next - lon + 540) % 360) - 180) < 1e-9) return next;
      lon = next;
    }
    return lon;
  };
  const c11 = cusp(1 / 3, false, norm(mc + 30));
  const c12 = cusp(2 / 3, false, norm(mc + 60));
  const c2 = cusp(2 / 3, true, norm(asc + 30));
  const c3 = cusp(1 / 3, true, norm(asc + 60));
  const half = [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180)];
  return [...half, ...half.map((c) => norm(c + 180))];
}

export function placidusCusps(date: Date, latitude: number, longitude: number): number[] {
  return placidusFromArmc(ramc(date, longitude), latitude, obliquity(date));
}

export interface KpPlanet extends Lords {
  name: string;
  longitude: number; // sidereal (KP)
  sign: string;
  signName: string;
  house: number; // Placidus house it occupies
  retrograde: boolean;
}

export interface KpChart {
  ayanamsa: number;
  cusps: { house: number; longitude: number; signName: string; lords: Lords }[];
  planets: KpPlanet[];
  /** For each house 1–12: significators in the four KP levels, strongest first. */
  significators: { house: number; levels: [string[], string[], string[], string[]] }[];
  /** Houses each planet signifies (through all four levels). */
  planetHouses: Record<string, number[]>;
}

const BODIES: [string, Astronomy.Body | null][] = [
  ["Sun", Astronomy.Body.Sun], ["Moon", Astronomy.Body.Moon], ["Mars", Astronomy.Body.Mars], ["Mercury", Astronomy.Body.Mercury],
  ["Jupiter", Astronomy.Body.Jupiter], ["Venus", Astronomy.Body.Venus], ["Saturn", Astronomy.Body.Saturn], ["Rahu", null], ["Ketu", null],
];

function houseOf(lon: number, cusps: number[]): number {
  for (let h = 0; h < 12; h++) {
    const start = cusps[h], end = cusps[(h + 1) % 12];
    const span = norm(end - start);
    if (norm(lon - start) < span) return h + 1;
  }
  return 12;
}

export function kpChart(date: Date, latitude: number, longitude: number): KpChart {
  const ayan = kpAyanamsa(date);
  const tropical = placidusCusps(date, latitude, longitude);
  if (tropical.some(Number.isNaN)) throw new Error("Placidus houses cannot be drawn at this latitude (beyond the polar circles).");
  const cuspLons = tropical.map((c) => norm(c - ayan));
  const dayLater = new Date(date.getTime() + 86400000);
  const rahuT = tropicalRahu(date);

  const planets: KpPlanet[] = BODIES.map(([name, body]) => {
    const trop = body ? tropicalLongitude(body, date) : name === "Rahu" ? rahuT : norm(rahuT + 180);
    const lon = norm(trop - ayan);
    const retrograde = body ? name !== "Sun" && name !== "Moon" && norm(tropicalLongitude(body, dayLater) - trop) > 180 : true;
    const lords = kpLords(lon);
    return { name, longitude: lon, ...lords, signName: RASHIS[Math.floor(lon / 30)], house: houseOf(lon, cuspLons), retrograde };
  });

  const occupants = (h: number) => planets.filter((p) => p.house === h).map((p) => p.name);
  const inStarOf = (names: string[]) => planets.filter((p) => names.includes(p.star)).map((p) => p.name);
  const significators = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    const owner = SIGN_LORDS[Math.floor(cuspLons[i] / 30)];
    const occ = occupants(h);
    return { house: h, levels: [inStarOf(occ), occ, inStarOf([owner]), [owner]] as [string[], string[], string[], string[]] };
  });
  const planetHouses: Record<string, number[]> = {};
  for (const s of significators) for (const level of s.levels) for (const p of level) (planetHouses[p] ??= []).includes(s.house) || planetHouses[p].push(s.house);
  for (const k of Object.keys(planetHouses)) planetHouses[k].sort((a, b) => a - b);

  return {
    ayanamsa: ayan,
    cusps: cuspLons.map((c, i) => ({ house: i + 1, longitude: c, signName: RASHIS[Math.floor(c / 30)], lords: kpLords(c) })),
    planets,
    significators,
    planetHouses,
  };
}

const WEEKDAY_LORDS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

/** KP ruling planets for a moment and place: day lord, Moon's sign/star/sub lords, ascendant's sign/star/sub lords. */
export function rulingPlanets(date: Date, latitude: number, longitude: number, weekday: number) {
  const ayan = kpAyanamsa(date);
  const moon = kpLords(norm(tropicalLongitude(Astronomy.Body.Moon, date) - ayan));
  const lagna = kpLords(norm(tropicalAscendant(date, latitude, longitude) - ayan));
  return {
    dayLord: WEEKDAY_LORDS[weekday],
    moon: { sign: moon.sign, star: moon.star, sub: moon.sub },
    lagna: { sign: lagna.sign, star: lagna.star, sub: lagna.sub },
  };
}
