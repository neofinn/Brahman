// Place search over the offline gazetteer (lib/places-data.ts), with familiar aliases (Banaras, Bombay…).
import { PLACE_ROWS, REGIONS, TIME_ZONES } from "./places-data.ts";
import type { Place } from "./time.ts";

export interface PlaceResult extends Place {
  region: string;
  population: number; // thousands
}

interface Row extends PlaceResult {
  key: string; // folded name for matching
  alts: string[];
}

export const fold = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const display = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "");

let rows: Row[] | null = null;
function allRows(): Row[] {
  if (rows) return rows;
  rows = PLACE_ROWS.split("\n").map((line) => {
    const [name, region, lat, lon, tz, pop, alt] = line.split("|");
    return {
      name: display(name),
      region: REGIONS[Number(region)],
      latitude: Number(lat),
      longitude: Number(lon),
      timeZone: TIME_ZONES[Number(tz)],
      population: Number(pop),
      key: fold(name),
      alts: alt ? alt.split(";").map(fold) : [],
    };
  });
  return rows;
}

// Familiar names → the gazetteer's spelling.
const ALIASES: Record<string, string> = {

  banaras: "varanasi", benares: "varanasi", kashi: "varanasi", bombay: "mumbai", calcutta: "kolkata", madras: "chennai",
  bangalore: "bengaluru", poona: "pune", baroda: "vadodara", gurgaon: "gurugram", allahabad: "prayagraj", trivandrum: "thiruvananthapuram",
  cochin: "kochi", mysore: "mysuru", mangalore: "mangaluru", vizag: "visakhapatnam", dehradun: "dehra dun", pondicherry: "puducherry",
  delhi: "new delhi", dilli: "new delhi", calicut: "kozhikode", trichy: "tiruchirappalli",
};

/** Places matching what the person typed, best first (exact, then prefix, then word prefix; larger places first). */
export function searchPlaces(query: string, limit = 8): PlaceResult[] {
  const q = fold(query);
  if (q.length < 2) return [];
  const target = ALIASES[q] ?? q;
  const scored: [number, Row][] = [];
  for (const r of allRows()) {
    const names = [r.key, ...r.alts];
    let s = 0;
    for (const n of names) {
      if (n === target) s = Math.max(s, 100);
      else if (n.startsWith(target)) s = Math.max(s, 60);
      else if (n.split(" ").some((w) => w.startsWith(target))) s = Math.max(s, 40);
      else if (target.length >= 4 && n.includes(target)) s = Math.max(s, 20);
    }
    if (s) scored.push([s + Math.min(19, Math.log10(r.population + 1) * 5) + (r.timeZone === "Asia/Kolkata" ? 2 : 0), r]);
  }
  return scored
    .sort((a, b) => b[0] - a[0])
    .slice(0, limit)
    .map(([, r]) => ({ name: r.name, region: r.region, latitude: r.latitude, longitude: r.longitude, timeZone: r.timeZone, population: r.population }));
}

/** A place named in free text ("born in Haridwar"), preferring the curated list, then larger towns. */
export function findPlaceInText(text: string): PlaceResult | undefined {
  const hay = ` ${fold(text)} `;
  let best: Row | undefined;
  for (const r of allRows()) {
    if (r.key.length < 4 || (r.population < 20 && r.timeZone !== "Asia/Kolkata")) continue;
    if (hay.includes(` ${r.key} `) && (!best || r.key.length > best.key.length || (r.key.length === best.key.length && r.population > best.population))) best = r;
  }
  return best && { name: best.name, region: best.region, latitude: best.latitude, longitude: best.longitude, timeZone: best.timeZone, population: best.population };
}

export function placeLabel(p: Place & { region?: string }): string {
  return p.region ? `${p.name}, ${p.region}` : p.name;
}

export { TIME_ZONES };

/** Online lookup (Open-Meteo geocoding, free, no key) for places not in the offline list. */
export async function searchPlacesOnline(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: { name: string; latitude: number; longitude: number; timezone?: string; admin1?: string; country?: string; population?: number }[];
  };
  return (data.results ?? [])
    .filter((r) => r.timezone)
    .map((r) => ({
      name: r.name,
      region: [r.admin1, r.country].filter(Boolean).join(", "),
      latitude: Number(r.latitude.toFixed(4)),
      longitude: Number(r.longitude.toFixed(4)),
      timeZone: r.timezone!,
      population: Math.round((r.population ?? 0) / 1000),
    }));
}
