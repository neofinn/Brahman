// The special lagnas of Parashari and Jaimini astrology (BPHS ch. 4 and Phaladeepika): Chandra and Surya lagna,
// Bhava, Hora and Ghati lagna, Shree lagna, Indu lagna, Arudha lagna, Upapada and Karakamsha.
import * as Astronomy from "astronomy-engine";
import { RASHIS, siderealLongitude, type Kundli, type Observer } from "./jyotish.ts";
import { SIGN_LORDS } from "./reading.ts";
import { arudha } from "./jaimini.ts";
import { charaKarakas, vargaSign } from "./vargas.ts";

export interface SpecialLagna {
  name: string;
  devanagari: string;
  sign: number;
  signName: string;
  lord: string;
  occupants: string[];
  meaning: string;
  reading: string;
}

const norm = (x: number) => ((x % 360) + 360) % 360;
// Kala units for Indu lagna (Phaladeepika 6.38).
const KALA: Record<string, number> = { Sun: 30, Moon: 16, Mars: 6, Mercury: 8, Jupiter: 10, Venus: 12, Saturn: 1 };
const BENEFICS = ["Jupiter", "Venus", "Mercury", "Moon"];

/** The sunrise on the morning of the birth day (the previous sunrise if born before dawn). */
function sunriseBefore(birth: Date, observer: Observer): Date | null {
  const obs = new Astronomy.Observer(observer.latitude, observer.longitude, 0);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, new Date(birth.getTime() - 86400000), 1)?.date ?? null;
  if (!rise) return null;
  if (rise > birth) return null;
  const next = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, new Date(rise.getTime() + 60000), 1)?.date;
  return next && next <= birth ? next : rise;
}

export function specialLagnas(k: Kundli, birth: Date, observer: Observer): SpecialLagna[] {
  const occ = (s: number) => k.grahas.filter((g) => g.rashi.index === s).map((g) => g.name);
  const make = (name: string, devanagari: string, sign: number, meaning: string, extra?: (o: string[]) => string): SpecialLagna => {
    const o = occ(sign);
    const ben = o.filter((p) => BENEFICS.includes(p));
    const base = o.length ? `${o.join(", ")} ${o.length > 1 ? "are" : "is"} here${ben.length ? ` — ${ben.join(", ")} bless${ben.length > 1 ? "" : "es"} this area` : ""}.` : `No planet here; its lord ${SIGN_LORDS[sign]} decides the results.`;
    return { name, devanagari, sign, signName: RASHIS[sign], lord: SIGN_LORDS[sign], occupants: o, meaning, reading: extra ? `${base} ${extra(o)}` : base };
  };
  const by = (n: string) => k.grahas.find((g) => g.name === n)!;
  const lagna = k.lagna.rashi.index;
  const moon = by("Moon");
  const out: SpecialLagna[] = [
    make("Lagna (Ascendant)", "लग्न", lagna, "the body, personality and the whole life"),
    make("Chandra Lagna (Moon)", "चन्द्र लग्न", moon.rashi.index, "the mind, emotions and daily happiness — transits are read from here"),
    make("Surya Lagna (Sun)", "सूर्य लग्न", by("Sun").rashi.index, "the soul, father, vitality and authority"),
  ];

  const sunrise = sunriseBefore(birth, observer);
  if (sunrise) {
    const s0 = siderealLongitude(Astronomy.Body.Sun, sunrise);
    const hours = (birth.getTime() - sunrise.getTime()) / 3600000;
    const sign = (deg: number) => Math.floor(norm(deg) / 30);
    out.push(
      make("Bhava Lagna", "भाव लग्न", sign(s0 + 15 * hours), "overall well-being and stature in life (moves one sign every 5 ghatis)"),
      make("Hora Lagna", "होरा लग्न", sign(s0 + 30 * hours), "wealth and prosperity (moves one sign every 2½ ghatis)"),
      make("Ghati Lagna", "घटी लग्न", sign(s0 + 75 * hours), "power, position and authority (moves one sign every ghati)"),
    );
  }

  // Shree lagna: the lagna advanced by the fraction of its nakshatra the Moon has covered.
  const fraction = (moon.longitude % (360 / 27)) / (360 / 27);
  out.push(make("Shree Lagna", "श्री लग्न", Math.floor(norm(k.lagna.longitude + fraction * 360) / 30), "prosperity and the grace of Lakshmi"));

  // Indu lagna: kala units of the 9th lords from the lagna and the Moon, remainder by 12, counted from the Moon.
  const ninthFromLagna = SIGN_LORDS[(lagna + 8) % 12];
  const ninthFromMoon = SIGN_LORDS[(moon.rashi.index + 8) % 12];
  const r = (KALA[ninthFromLagna] + KALA[ninthFromMoon]) % 12 || 12;
  out.push(make("Indu Lagna", "इन्दु लग्न", (moon.rashi.index + r - 1) % 12, "wealth — the dasha of planets in it, and benefics there, bring money", (o) => (o.some((p) => BENEFICS.includes(p)) ? "A benefic in Indu lagna is a classical sign of wealth." : "")));

  out.push(make("Arudha Lagna", "आरूढ लग्न", arudha(k, lagna), "how the world sees you — image and reputation"));
  out.push(make("Upapada Lagna", "उपपद लग्न", arudha(k, (lagna + 11) % 12), "marriage and the spouse"));
  const ak = charaKarakas(k)[0].graha;
  out.push(make("Karakamsha Lagna", "कारकांश लग्न", vargaSign(by(ak).longitude, "D9"), `the soul's desire and calling (atmakaraka ${ak} in the navamsha)`));
  return out;
}
