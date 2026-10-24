import { test } from "node:test";
import assert from "node:assert/strict";
import { computeKundli, NAKSHATRAS } from "../lib/jyotish.ts";
import { ganaOf, nadiOf } from "../lib/reading.ts";
import { findDoshas, findYogas, forecast, predict, relationship, remedyPlan, transitIngresses } from "../lib/predictions.ts";
import { milan, YONI_OF, YONI_TABLE } from "../lib/milan.ts";
import { detectActivity, findMuhurtas } from "../lib/muhurta.ts";
import { substitutesFor } from "../lib/abroad.ts";
import { respond } from "../lib/finder.ts";
import { zonedToUtc } from "../lib/time.ts";

const DELHI = { latitude: 28.6139, longitude: 77.209 };
const k = computeKundli(zonedToUtc("1990-01-15", "06:30", "Asia/Kolkata"), DELHI);
const NOW = new Date("2026-10-22T00:00:00Z");

test("predictions: yogas, doshas, areas, forecast and remedies", () => {
  const p = predict(k, {}, NOW);
  assert.equal(p.areas.length, 8);
  for (const a of p.areas) {
    assert.ok(["excellent", "favourable", "mixed", "challenging"].includes(a.rating));
    assert.ok(a.factors.length > 0);
    for (const w of a.windows) assert.ok(w.start >= NOW && w.end > w.start);
  }
  assert.ok(p.areas.find((a) => a.id === "career")!.fields!.length > 0);
  assert.ok(p.current && p.current.start <= NOW && p.current.end > NOW);
  // The forecast covers the next five years without gaps.
  for (let i = 1; i < p.periods.length; i++) assert.equal(p.periods[i].start.getTime(), p.periods[i - 1].end.getTime());
  assert.ok(p.periods[p.periods.length - 1].end.getTime() >= NOW.getTime() + 4.9 * 365 * 86400000);
  assert.ok(p.summary.length > 40);
  assert.ok(p.practices.length >= 2);
  assert.deepEqual(forecast(k, NOW).map((x) => x.antar), p.periods.map((x) => x.antar));
  for (const y of findYogas(k)) assert.ok(y.name && y.text && y.planets.length);
  for (const d of findDoshas(k, NOW)) assert.ok(d.grahas.length && d.practices.length);
});

test("predictions: natural friendships and remedies follow the rules", () => {
  assert.equal(relationship("Sun", "Saturn"), "enemy");
  assert.equal(relationship("Moon", "Saturn"), "neutral");
  assert.equal(relationship("Venus", "Saturn"), "friend");
  const plan = remedyPlan(k, findDoshas(k, NOW), NOW);
  for (const r of plan) {
    assert.ok(r.japa >= 6000 && r.mantra.devanagari.startsWith("ॐ"));
    // Gems are never suggested to pacify a planet.
    if (r.purpose === "pacify") assert.equal(r.gem, undefined);
  }
  for (let i = 1; i < plan.length; i++) assert.ok(plan[i].priority >= plan[i - 1].priority);
});

test("predictions: slow-planet ingresses", () => {
  const ing = transitIngresses(k, NOW, 5);
  // Saturn enters sidereal Mesha in 2027 and Jupiter changes sign at least once a year.
  assert.ok(ing.some((i) => i.planet === "Saturn" && i.sign === "Mesha" && i.date.getUTCFullYear() === 2027));
  assert.ok(ing.filter((i) => i.planet === "Jupiter").length >= 5);
  assert.ok(ing.some((i) => i.planet === "Rahu"));
  for (let i = 1; i < ing.length; i++) assert.ok(ing[i].date >= ing[i - 1].date);
});

test("milan: tables are consistent with the nakshatra lists", () => {
  for (let i = 0; i < 14; i++) for (let j = 0; j < 14; j++) assert.equal(YONI_TABLE[i][j], YONI_TABLE[j][i]);
  // Each animal belongs to two nakshatras, except the Mongoose (Uttara Ashadha alone without Abhijit).
  const counts = YONI_OF.reduce((m, y) => m.set(y, (m.get(y) ?? 0) + 1), new Map<number, number>());
  assert.equal(counts.get(12), 1);
  for (const [y, n] of counts) if (y !== 12) assert.equal(n, 2);
  const deva = ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Swati", "Anuradha", "Shravana", "Revati"];
  const rakshasa = ["Krittika", "Ashlesha", "Magha", "Chitra", "Vishakha", "Jyeshtha", "Mula", "Dhanishta", "Shatabhisha"];
  NAKSHATRAS.forEach((n, i) => assert.equal(ganaOf(i), deva.includes(n) ? "Deva" : rakshasa.includes(n) ? "Rakshasa" : "Manushya", n));
  const adi = ["Ashwini", "Ardra", "Punarvasu", "Uttara Phalguni", "Hasta", "Jyeshtha", "Mula", "Shatabhisha", "Purva Bhadrapada"];
  for (const n of adi) assert.equal(nadiOf(NAKSHATRAS.indexOf(n as (typeof NAKSHATRAS)[number])), "Adi", n);
});

test("milan: scores add up and same-nadi is flagged", () => {
  const girl = computeKundli(zonedToUtc("1992-06-10", "14:00", "Asia/Kolkata"), DELHI);
  const r = milan(k, girl);
  assert.equal(r.kootas.length, 8);
  assert.equal(r.kootas.reduce((s, x) => s + x.max, 0), 36);
  assert.equal(r.total, r.kootas.reduce((s, x) => s + x.score, 0));
  for (const x of r.kootas) assert.ok(x.score >= 0 && x.score <= x.max);
  // A chart matched with itself: same nakshatra, rashi and pada — Nadi dosha with no exception, Bhakoot full.
  const self = milan(k, k);
  const nadi = self.kootas.find((x) => x.name === "Nadi")!;
  assert.equal(nadi.score, 0);
  assert.ok(nadi.dosha);
  assert.equal(self.kootas.find((x) => x.name === "Bhakoot")!.score, 7);
  assert.equal(self.kootas.find((x) => x.name === "Tara")!.score, 3);
  assert.equal(self.kootas.find((x) => x.name === "Yoni")!.score, 4);
});

test("muhurta: days avoid the forbidden limbs", () => {
  const place = { ...DELHI, timeZone: "Asia/Kolkata" };
  const days = findMuhurtas("griha-pravesh", "2026-10-22", place, 90, 6);
  assert.ok(days.length > 0);
  for (const d of days) {
    assert.ok(!/Amavasya|Chaturthi|Navami|Chaturdashi/.test(d.tithi), d.tithi);
    assert.ok(!/Tuesday|Saturday|Sunday/.test(d.weekday), d.weekday);
    assert.ok(d.windows.length > 0);
  }
  assert.equal(detectActivity("griha pravesh ka muhurat"), "griha-pravesh");
  assert.equal(detectActivity("shaadi ki date"), "vivah");
});

test("abroad: substitutes match the rite's samagri", () => {
  const items = substitutesFor(["Kalash with water, mango leaves and coconut", "Ganga jal, panchamrit", "Tulsi leaves"]).map((s) => s.item);
  assert.ok(items.includes("Ganga jal") && items.includes("Tulsi") && items.includes("Coconut"));
  assert.ok(!items.includes("Kusha grass"));
});

test("finder: predictions, milan, muhurta and abroad intents", () => {
  const ask = respond("Shaadi kab hogi?");
  assert.equal(ask.state.pendingFocus, "marriage");
  const got = respond("15 Jan 1990, 6:30 am, Delhi", ask.state);
  const card = got.cards.find((c) => c.type === "prediction");
  assert.ok(card && card.type === "prediction" && card.focus === "marriage");
  // Later questions reuse the remembered birth details.
  const career = respond("career kaisa rahega", got.state);
  assert.ok(career.cards.some((c) => c.type === "prediction" && c.focus === "career"));
  assert.ok(respond("kundli milan karna hai").cards.some((c) => c.type === "milan"));
  assert.ok(respond("griha pravesh ka shubh muhurat").cards.some((c) => c.type === "muhurta"));
  assert.ok(respond("I live in Canada, no pandit, how to do satyanarayan puja").cards.some((c) => c.type === "abroad"));
  // A worry with a prayer request still gets comfort, not a forecast.
  assert.equal(respond("Interview tomorrow, will I get the job? Please pray for me").cards[0].type, "support");
});

test("kathas: every katha has a Hindi telling that matches the English structure", async () => {
  const { KATHAS, getKathaHindi } = await import("../lib/kathas/index.ts");
  const { kathaSpeech } = await import("../lib/voice.ts");
  for (const k of KATHAS) {
    const h = getKathaHindi(k.id);
    assert.ok(h, k.id);
    assert.equal(h.parts?.length ?? 0, k.parts?.length ?? 0, `${k.id} parts`);
    assert.equal(h.story?.length ?? 0, k.story?.length ?? 0, `${k.id} story`);
    const text = [h.title, h.summary, h.opening, h.closing, ...(h.story ?? []), ...(h.teachings ?? []), ...(h.parts ?? []).flatMap((p) => [p.title, p.summary])].join(" ");
    assert.ok(!/[A-Za-z]/.test(text), `${k.id} has Latin letters`);
    assert.ok(kathaSpeech(k.id).every((t) => !/[A-Za-z]/.test(t)), `${k.id} speech`);
  }
});

test("siddhis: classified, sourced, and no procedures for harmful practices", async () => {
  const { SIDDHIS, SIDDHI_VERSES } = await import("../lib/siddhis.ts");
  const { getKriya } = await import("../lib/kriyas.ts");
  assert.ok(SIDDHIS.length >= 60);
  assert.equal(new Set(SIDDHIS.map((s) => s.id)).size, SIDDHIS.length);
  for (const g of ["sattvic", "rajasic", "tamasic"]) assert.ok(SIDDHIS.some((s) => s.guna === g), g);
  // Krishna's list in Bhagavata 11.15: 8 primary, 10 secondary, 5 lesser.
  assert.equal(SIDDHIS.filter((s) => s.group === "bhagavata").length, 15);
  for (const s of SIDDHIS) {
    assert.ok(s.sources.length && s.meaning, s.id);
    s.rituals?.forEach((r) => assert.ok(getKriya(r), `${s.id} → ${r}`));
    if (s.guna === "tamasic" || ["vashikarana", "akarshana", "stambhana", "yakshini-sadhana"].includes(s.id)) {
      assert.equal(s.path, undefined, `${s.id} must not carry a procedure`);
      assert.ok(s.instead, `${s.id} offers a sattvic alternative`);
    }
  }
  assert.ok(SIDDHI_VERSES.some((v) => v.source === "Yoga Sutra 4.1"));
  assert.equal(respond("vashikaran mantra").cards[0].type, "siddhi");
  assert.equal(respond("tamsik sidhi").cards.at(-1)?.type, "siddhiList");
});

test("jaimini, lo shu, life so far and confluence", async () => {
  const { readJaimini, rashiAspects, arudha } = await import("../lib/jaimini.ts");
  const { loShu, personalYear } = await import("../lib/loshu.ts");
  const { pastChapters, rectify, matchEvent } = await import("../lib/lifeline.ts");
  const { confluence, presentConfluence } = await import("../lib/confluence.ts");
  const { kpChart } = await import("../lib/kp.ts");
  const { PAKKA_GHAR } = await import("../lib/lalkitab.ts");
  const birth = zonedToUtc("1990-01-15", "06:30", "Asia/Kolkata");
  // Rashi drishti: movable → fixed except the next sign; fixed → movable except the previous; duals → duals.
  assert.deepEqual(rashiAspects(0), [4, 7, 10]);
  assert.deepEqual(rashiAspects(1), [3, 6, 9]);
  assert.deepEqual(rashiAspects(2), [5, 8, 11]);
  // An arudha is never in the 1st or 7th from its house.
  for (let s = 0; s < 12; s++) { const a = arudha(k, s); assert.ok(a !== s && a !== (s + 6) % 12); }
  const j = readJaimini(k, birth, NOW);
  assert.equal(j.karakas.length, 7);
  assert.ok(j.points.length >= 4 && j.ishtaDevata.devata);
  assert.ok(j.currentChara && j.charaDasha[0].start.getTime() === birth.getTime());
  for (const p of j.charaDasha) assert.ok(p.years >= 1 && p.years <= 12);
  // Lo Shu for 15-01-1990: digits 1,5,1,1,9,9,0 with conductor 8 (and driver 6 for a two-digit day).
  const ls = loShu("1990-01-15");
  assert.equal(ls.counts[1], 3);
  assert.equal(ls.counts[9], 2);
  assert.equal(ls.conductor, 8);
  assert.ok(ls.missing.some((m) => m.n === 2));
  assert.equal(personalYear("1990-01-15", 2026), 8);
  const chapters = pastChapters(k, birth, NOW);
  assert.ok(chapters.length > 20 && chapters[0].ageFrom === 0);
  assert.ok(chapters.some((c) => c.markers.length));
  assert.ok(matchEvent(k, { type: "marriage", date: "2016-02" }));
  const r = rectify("06:30", (hm) => zonedToUtc("1990-01-15", hm, "Asia/Kolkata"), DELHI, [{ type: "career", date: "2012-07" }]);
  assert.equal(r.candidates.length, 5);
  const p = predict(k, {}, NOW);
  const areas = confluence(k, p, kpChart(birth, DELHI.latitude, DELHI.longitude), { pakka: PAKKA_GHAR });
  assert.equal(areas.length, 8);
  for (const a of areas) assert.equal(a.votes.length, 4);
  assert.ok(presentConfluence(k, p, j, "1990-01-15", NOW).lines.length >= 3);
});
