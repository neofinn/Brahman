import { test } from "node:test";
import assert from "node:assert/strict";
import { computePanchang, computeKundli, ascendant, siderealLongitude, rashiOf } from "../lib/jyotish.ts";
import { zonedToUtc, weekdayOf, formatTime } from "../lib/time.ts";
import * as Astronomy from "astronomy-engine";

const AYODHYA = { latitude: 26.7922, longitude: 82.1998 };
const DELHI = { latitude: 28.6139, longitude: 77.209 };

function panchangFor(date: string, place: { latitude: number; longitude: number }) {
  return computePanchang(zonedToUtc(date, "00:00", "Asia/Kolkata"), weekdayOf(date), place);
}

test("Ram Mandir pran pratishtha, 22 Jan 2024: Pausha Shukla Dwadashi, Mrigashira", () => {
  const p = panchangFor("2024-01-22", AYODHYA);
  assert.equal(p.tithi.paksha, "Shukla");
  assert.equal(p.tithi.name, "Dwadashi");
  assert.equal(p.nakshatra.name, "Mrigashira");
  assert.equal(p.lunarMonth?.amanta, "Pausha");
  assert.equal(p.vaara, "Somavara (Monday)");
  assert.equal(p.vikramSamvat, 2080);
});

test("Maha Shivaratri, 26 Feb 2025: Magha (amanta) Krishna Trayodashi at sunrise, Chaturdashi later", () => {
  const p = panchangFor("2025-02-26", DELHI);
  assert.equal(p.tithi.paksha, "Krishna");
  assert.ok(["Trayodashi", "Chaturdashi"].includes(p.tithi.name), p.tithi.name);
  assert.equal(p.lunarMonth?.amanta, "Magha");
  assert.equal(p.lunarMonth?.purnimanta, "Phalguna");
});

test("Diwali, 1 Nov 2024: Ashwin (amanta) Amavasya at sunrise", () => {
  const p = panchangFor("2024-11-01", DELHI);
  assert.equal(p.tithi.name, "Amavasya");
  assert.equal(p.lunarMonth?.amanta, "Ashwin");
});

test("Adhik Shravana month in 2023 is detected", () => {
  const p = panchangFor("2023-07-25", DELHI);
  assert.equal(p.lunarMonth?.adhik, true);
  assert.equal(p.lunarMonth?.amanta, "Shravana");
});

test("Delhi sunrise times are plausible", () => {
  const p = panchangFor("2024-06-21", DELHI);
  assert.equal(formatTime(p.sunrise, "Asia/Kolkata"), "5:24 am");
  assert.ok(p.muhurtas.some((m) => m.name === "Rahu Kaal"));
});

test("Lagna at sunrise is in the Sun's sign", () => {
  for (const date of ["2024-03-10", "2024-08-15", "2025-12-01"]) {
    const sunrise = Astronomy.SearchRiseSet(
      Astronomy.Body.Sun, new Astronomy.Observer(DELHI.latitude, DELHI.longitude, 0), +1,
      zonedToUtc(date, "00:00", "Asia/Kolkata"), 1,
    )!.date;
    const lagna = ascendant(new Date(sunrise.getTime() + 10 * 60000), DELHI.latitude, DELHI.longitude);
    const sun = siderealLongitude(Astronomy.Body.Sun, sunrise);
    const diff = Math.abs(((lagna - sun + 540) % 360) - 180);
    assert.ok(diff < 8, `${date}: lagna ${lagna.toFixed(1)} sun ${sun.toFixed(1)}`);
  }
});

test("Kundli: Sun in Makara on 15 Jan, dashas span 120 years", () => {
  const k = computeKundli(zonedToUtc("1990-01-15", "06:30", "Asia/Kolkata"), DELHI);
  assert.equal(k.grahas.find((g) => g.name === "Sun")!.rashi.name, "Makara");
  const rahu = k.grahas.find((g) => g.name === "Rahu")!;
  const ketu = k.grahas.find((g) => g.name === "Ketu")!;
  assert.equal((rahu.rashi.index + 6) % 12, ketu.rashi.index);
  const years = (k.dashas[8].end.getTime() - k.dashas[0].start.getTime()) / (365.2425 * 86400000);
  assert.ok(Math.abs(years - 120) < 0.01);
  assert.equal(rashiOf(k.lagna.longitude).index, k.lagna.rashi.index);
});
