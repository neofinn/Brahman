// Divisional charts (shodasha varga) by the rules of Brihat Parashara Hora Shastra, and Jaimini chara karakas.
import type { Kundli } from "./jyotish.ts";

export interface Varga {
  id: string; // "D9"
  name: string;
  sanskrit: string;
  signifies: string;
}

export const VARGAS: Varga[] = [
  { id: "D1", name: "Rashi", sanskrit: "राशि", signifies: "the body and life as a whole" },
  { id: "D2", name: "Hora", sanskrit: "होरा", signifies: "wealth" },
  { id: "D3", name: "Drekkana", sanskrit: "द्रेष्काण", signifies: "siblings and courage" },
  { id: "D4", name: "Chaturthamsha", sanskrit: "चतुर्थांश", signifies: "fortune, property and home" },
  { id: "D7", name: "Saptamsha", sanskrit: "सप्तांश", signifies: "children and progeny" },
  { id: "D9", name: "Navamsha", sanskrit: "नवांश", signifies: "spouse, dharma and the strength of planets" },
  { id: "D10", name: "Dashamsha", sanskrit: "दशांश", signifies: "career and status" },
  { id: "D12", name: "Dwadashamsha", sanskrit: "द्वादशांश", signifies: "parents" },
  { id: "D16", name: "Shodashamsha", sanskrit: "षोडशांश", signifies: "vehicles, comforts and happiness" },
  { id: "D20", name: "Vimshamsha", sanskrit: "विंशांश", signifies: "spiritual progress and worship" },
  { id: "D24", name: "Chaturvimshamsha", sanskrit: "चतुर्विंशांश", signifies: "learning and education" },
  { id: "D27", name: "Saptavimshamsha (Bhamsha)", sanskrit: "सप्तविंशांश", signifies: "strengths and weaknesses" },
  { id: "D30", name: "Trimshamsha", sanskrit: "त्रिंशांश", signifies: "misfortunes and challenges" },
  { id: "D40", name: "Khavedamsha", sanskrit: "खवेदांश", signifies: "maternal legacy and auspicious effects" },
  { id: "D45", name: "Akshavedamsha", sanskrit: "अक्षवेदांश", signifies: "paternal legacy and general well-being" },
  { id: "D60", name: "Shashtiamsha", sanskrit: "षष्ट्यंश", signifies: "past karma — the most subtle chart" },
];

const norm = (x: number) => ((x % 360) + 360) % 360;
const mod12 = (x: number) => ((x % 12) + 12) % 12;

/** The sign (0 = Mesha) a sidereal longitude falls in, in the given divisional chart. */
export function vargaSign(longitude: number, varga: string): number {
  const lon = norm(longitude);
  const sign = Math.floor(lon / 30);
  const deg = lon - sign * 30;
  const odd = sign % 2 === 0; // Mesha (0) is an odd sign
  const movable = sign % 3 === 0, fixed = sign % 3 === 1;
  const part = (n: number) => Math.floor(deg / (30 / n));
  switch (varga) {
    case "D1":
      return sign;
    case "D2": // Sun's hora (Simha) and Moon's hora (Karka)
      return (deg < 15) === odd ? 4 : 3;
    case "D3": // same, 5th, 9th
      return mod12(sign + 4 * part(3));
    case "D4": // same, 4th, 7th, 10th
      return mod12(sign + 3 * part(4));
    case "D7": // odd from the sign, even from the 7th
      return mod12((odd ? sign : sign + 6) + part(7));
    case "D9": // continuous from Mesha (fire from Mesha, earth from Makara, air from Tula, water from Karka)
      return mod12(Math.floor((lon * 9) / 30));
    case "D10": // odd from the sign, even from the 9th
      return mod12((odd ? sign : sign + 8) + part(10));
    case "D12":
      return mod12(sign + part(12));
    case "D16": // movable from Mesha, fixed from Simha, dual from Dhanu
      return mod12((movable ? 0 : fixed ? 4 : 8) + part(16));
    case "D20": // movable from Mesha, fixed from Dhanu, dual from Simha
      return mod12((movable ? 0 : fixed ? 8 : 4) + part(20));
    case "D24": // odd from Simha, even from Karka
      return mod12((odd ? 4 : 3) + part(24));
    case "D27": // continuous from Mesha (fire Mesha, earth Karka, air Tula, water Makara)
      return mod12(Math.floor((lon * 27) / 30));
    case "D30": {
      // Odd: Mars 5°, Saturn 5°, Jupiter 8°, Mercury 7°, Venus 5°; even signs the reverse.
      if (odd) return deg < 5 ? 0 : deg < 10 ? 10 : deg < 18 ? 8 : deg < 25 ? 2 : 6;
      return deg < 5 ? 1 : deg < 12 ? 5 : deg < 20 ? 11 : deg < 25 ? 9 : 7;
    }
    case "D40": // odd from Mesha, even from Tula
      return mod12((odd ? 0 : 6) + part(40));
    case "D45": // movable from Mesha, fixed from Simha, dual from Dhanu
      return mod12((movable ? 0 : fixed ? 4 : 8) + part(45));
    case "D60": // from the sign itself, one sign per half degree
      return mod12(sign + Math.floor(deg * 2));
    default:
      throw new Error(`Unknown varga ${varga}`);
  }
}

export interface VargaChart {
  varga: Varga;
  lagna: number;
  /** Graha name → sign index in this chart. */
  positions: { name: string; sign: number; retrograde: boolean }[];
}

export function vargaChart(k: Kundli, vargaId: string): VargaChart {
  const varga = VARGAS.find((v) => v.id === vargaId)!;
  return {
    varga,
    lagna: vargaSign(k.lagna.longitude, vargaId),
    positions: k.grahas.map((g) => ({ name: g.name, sign: vargaSign(g.longitude, vargaId), retrograde: g.retrograde })),
  };
}

/** Vargottama: the same sign in the rashi and navamsha charts — a mark of strength. */
export function vargottama(k: Kundli): string[] {
  return k.grahas.filter((g) => vargaSign(g.longitude, "D1") === vargaSign(g.longitude, "D9")).map((g) => g.name);
}

export const KARAKA_NAMES = [
  ["Atmakaraka", "the soul — the king of the chart"],
  ["Amatyakaraka", "career and counsel"],
  ["Bhratrikaraka", "siblings and courage"],
  ["Matrikaraka", "mother and happiness"],
  ["Putrakaraka", "children and intelligence"],
  ["Gnatikaraka", "rivals, obstacles and disease"],
  ["Darakaraka", "spouse and partnerships"],
] as const;

/** Jaimini chara karakas: the seven planets Sun–Saturn ranked by degrees travelled within their sign (BPHS, seven-karaka scheme). */
export function charaKarakas(k: Kundli): { karaka: string; meaning: string; graha: string; degree: number }[] {
  const seven = k.grahas.filter((g) => !["Rahu", "Ketu"].includes(g.name)).map((g) => ({ graha: g.name, degree: g.rashi.degree }));
  return seven
    .sort((a, b) => b.degree - a.degree)
    .map((g, i) => ({ karaka: KARAKA_NAMES[i][0], meaning: KARAKA_NAMES[i][1], graha: g.graha, degree: g.degree }));
}

/** Karakamsha: the navamsha sign of the Atmakaraka. */
export function karakamsha(k: Kundli): number {
  const ak = charaKarakas(k)[0].graha;
  return vargaSign(k.grahas.find((g) => g.name === ak)!.longitude, "D9");
}
