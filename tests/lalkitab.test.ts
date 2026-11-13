import { test } from "node:test";
import assert from "node:assert/strict";
import { computeKundli } from "../lib/jyotish.ts";
import { LK_ASPECTS, LK_PLANETS, PAKKA_GHAR, PLANET_IN_HOUSE, RINAS, lalKitab } from "../lib/lalkitab.ts";
import { zonedToUtc } from "../lib/time.ts";

test("planet-in-house data covers 9 planets × 12 houses", () => {
  assert.equal(Object.keys(PLANET_IN_HOUSE).length, 9);
  for (const p of LK_PLANETS) {
    for (let h = 1; h <= 12; h++) {
      const entry = PLANET_IN_HOUSE[p][h];
      assert.ok(entry, `${p} in ${h}`);
      assert.ok(entry.effect.length > 20, `${p} in ${h} effect`);
      assert.ok(entry.remedies.length >= 2 && entry.remedies.length <= 4, `${p} in ${h} remedies`);
    }
  }
});

test("pakka ghar values", () => {
  assert.deepEqual(PAKKA_GHAR.Sun, [1]);
  assert.deepEqual(PAKKA_GHAR.Moon, [4]);
  assert.deepEqual(PAKKA_GHAR.Mars, [3, 8]);
  assert.deepEqual(PAKKA_GHAR.Mercury, [7]);
  assert.deepEqual(PAKKA_GHAR.Jupiter, [2, 5, 9, 12]);
  assert.deepEqual(PAKKA_GHAR.Venus, [7]);
  assert.deepEqual(PAKKA_GHAR.Saturn, [8, 10]);
  assert.deepEqual(PAKKA_GHAR.Rahu, [12]);
  assert.deepEqual(PAKKA_GHAR.Ketu, [6]);
});

test("aspects and debts are well formed", () => {
  assert.ok(LK_ASPECTS.some((a) => a.from === 1 && a.to === 7 && a.strength === 100));
  assert.ok(LK_ASPECTS.some((a) => a.from === 4 && a.to === 10 && a.strength === 100));
  for (const r of RINAS) {
    assert.ok(r.planets.every((p) => PAKKA_GHAR[p]), r.name);
    assert.ok(r.houses.every((h) => h >= 1 && h <= 12), r.name);
  }
});

test("computed kundli gives a sensible Lal Kitab reading", () => {
  const k = computeKundli(zonedToUtc("1990-01-15", "06:30", "Asia/Kolkata"), { latitude: 28.6139, longitude: 77.209 });
  const lk = lalKitab(k);
  assert.equal(lk.chart.length, 12);
  assert.equal(lk.chart[0].rashi, "Mesha");
  assert.equal(lk.chart.reduce((n, c) => n + c.planets.length, 0), 9);
  assert.equal(lk.placements.length, 9);
  for (const p of lk.placements) {
    assert.equal(p.house, k.grahas.find((g) => g.name === p.planet)!.house);
    assert.equal(p.pakka, PAKKA_GHAR[p.planet].includes(p.house));
    assert.ok(p.remedies.length >= 2);
  }
  // Rahu and Ketu are always opposite.
  const h = (n: string) => lk.placements.find((p) => p.planet === n)!.house;
  assert.equal(((h("Rahu") - h("Ketu") + 12) % 12), 6);
  for (const s of lk.sleepingHouses) assert.equal(lk.chart[s - 1].planets.length, 0);
  for (const s of lk.sleepingPlanets) assert.equal(lk.placements.find((p) => p.planet === s)!.pakka, false);
  assert.ok(lk.generalRules.some((r) => /43 days/.test(r)));
  for (const r of lk.rinas) assert.ok(r.reason && r.remedy);
});
