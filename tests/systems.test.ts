import { test } from "node:test";
import assert from "node:assert/strict";
import { computeKundli } from "../lib/jyotish.ts";
import { charaKarakas, vargaSign, vargottama, VARGAS } from "../lib/vargas.ts";
import { kpAyanamsa, kpChart, kpLords, placidusFromArmc, rulingPlanets } from "../lib/kp.ts";
import { connections, readBnn } from "../lib/bnn.ts";
import { nameNumber, numerology, reduce } from "../lib/numerology.ts";
import { searchPlaces } from "../lib/places.ts";
import { parseBirthDetails } from "../lib/parse.ts";
import { lahiriAyanamsa } from "../lib/jyotish.ts";
import { zonedToUtc } from "../lib/time.ts";

const DELHI = { latitude: 28.6139, longitude: 77.209 };
const birth = zonedToUtc("1990-01-15", "06:30", "Asia/Kolkata");
const k = computeKundli(birth, DELHI);

test("divisional charts follow BPHS rules", () => {
  // Navamsha: 15° Mesha is the 5th navamsha from Mesha → Simha; 15° Vrishabha is the 5th from Makara → Vrishabha.
  assert.equal(vargaSign(15, "D9"), 4);
  assert.equal(vargaSign(45, "D9"), 1);
  // Hora: odd sign first half = Sun (Simha), even sign first half = Moon (Karka).
  assert.equal(vargaSign(10, "D2"), 4);
  assert.equal(vargaSign(40, "D2"), 3);
  // Drekkana: 25° Mesha → 9th from Mesha = Dhanu.
  assert.equal(vargaSign(25, "D3"), 8);
  // Dashamsha: 2° Vrishabha (even) starts from the 9th = Makara.
  assert.equal(vargaSign(32, "D10"), 9);
  // Saptamsha: 2° Vrishabha (even) starts from the 7th = Vrishchika.
  assert.equal(vargaSign(32, "D7"), 7);
  // Trimshamsha: 7° Mesha → Saturn's portion (Kumbha); 7° Vrishabha → Mercury's (Kanya).
  assert.equal(vargaSign(7, "D30"), 10);
  assert.equal(vargaSign(37, "D30"), 5);
  // Shashtiamsha: 10.2° Mesha → 20th sign counted from Mesha → Tula (index 20 mod 12 = 8 → Dhanu).
  assert.equal(vargaSign(10.2, "D60"), 8);
  for (const v of VARGAS) for (let lon = 0; lon < 360; lon += 0.37) {
    const s = vargaSign(lon, v.id);
    assert.ok(Number.isInteger(s) && s >= 0 && s < 12, `${v.id} ${lon}`);
  }
});

test("chara karakas rank the seven planets by degree", () => {
  const ck = charaKarakas(k);
  assert.equal(ck.length, 7);
  assert.equal(ck[0].karaka, "Atmakaraka");
  for (let i = 1; i < 7; i++) assert.ok(ck[i - 1].degree >= ck[i].degree);
  assert.ok(Array.isArray(vargottama(k)));
});

test("Placidus matches the table of houses (London, sidereal time 0h)", () => {
  const c = placidusFromArmc(0, 51.5, 23.44);
  const near = (lon: number, sign: number, deg: number, tol = 1) => Math.abs(lon - (sign * 30 + deg)) <= tol;
  assert.ok(near(c[9], 0, 0, 0.01)); // MC 0° Aries
  assert.ok(near(c[10], 1, 9)); // 11th Taurus 9°
  assert.ok(near(c[11], 2, 22)); // 12th Gemini 22°
  assert.ok(near(c[0], 3, 26.6)); // Asc Cancer 26°36'
  assert.ok(near(c[1], 4, 12, 1.2)); // 2nd Leo 12°
  assert.ok(near(c[2], 5, 3)); // 3rd Virgo 3°
});

test("KP lords, ayanamsa and chart", () => {
  // 0.5° Mesha: Ketu star, Ketu sub (0°–0°46′40″), and within it the Jupiter sub-sub (0°26′28″–0°32′42″).
  assert.deepEqual(kpLords(0.5), { sign: "Mars", star: "Ketu", sub: "Ketu", subSub: "Jupiter" });
  assert.deepEqual(kpLords(0.01), { sign: "Mars", star: "Ketu", sub: "Ketu", subSub: "Ketu" });
  assert.deepEqual(kpLords(359.99), { sign: "Jupiter", star: "Mercury", sub: "Saturn", subSub: "Jupiter" });
  // Krishnamurti ayanamsa runs about 6′ behind Lahiri.
  const diff = (lahiriAyanamsa(birth) - kpAyanamsa(birth)) * 60;
  assert.ok(diff > 4 && diff < 8, `diff ${diff}`);
  const chart = kpChart(birth, DELHI.latitude, DELHI.longitude);
  assert.equal(chart.cusps.length, 12);
  assert.equal(chart.planets.length, 9);
  assert.ok(chart.significators.every((s) => s.levels[3].length === 1));
  const rp = rulingPlanets(birth, DELHI.latitude, DELHI.longitude, 1);
  assert.equal(rp.dayLord, "Moon");
  assert.throws(() => kpChart(birth, 80, 10));
});

test("Bhrigu Nandi Nadi connections and reading", () => {
  // 1990-01-15: Jupiter (R) Mithuna, Saturn Dhanu (7th from Jupiter), Mercury (R) Dhanu.
  const jc = connections(k, "Jupiter");
  assert.ok(jc.some((c) => c.planet === "Saturn" && c.relation === "7th"));
  const r = readBnn(k, "m", new Date("2026-10-22T00:00:00Z"));
  assert.equal(r.native.karaka, "Jupiter");
  assert.equal(r.spouse?.karaka, "Venus");
  assert.ok(r.career.lines.length > 0);
});

test("Chaldean numerology", () => {
  assert.equal(reduce(1990), 1);
  const n = nameNumber("Ramesh")!; // R2 A1 M4 E5 S3 H5 = 20 → 2
  assert.equal(n.compound, 20);
  assert.equal(n.root, 2);
  assert.equal(n.planet, "Moon");
  const nu = numerology("1990-01-15", "Ramesh");
  assert.equal(nu.birth.number, 6); // 15 → 6
  assert.equal(nu.destiny.number, reduce(1 + 5 + 0 + 1 + 1 + 9 + 9 + 0)); // 26 → 8
  assert.equal(nu.destiny.number, 8);
});

test("place search and free-text places", () => {
  assert.equal(searchPlaces("banaras")[0].name, "Varanasi");
  assert.equal(searchPlaces("aurang")[0].region, "Maharashtra, India");
  assert.equal(searchPlaces("Edison")[0].region, "New Jersey, USA");
  assert.equal(searchPlaces("Haridwar")[0].timeZone, "Asia/Kolkata");
  assert.equal(parseBirthDetails("born 4/5/1988 7:10 am in Ratlam").place?.region, "Madhya Pradesh, India");
});
