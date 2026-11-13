import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBirthDetails } from "../lib/parse.ts";

test("English sentence with month name", () => {
  const d = parseBirthDetails("My DOB is 15 Jan 1990, 6:30 am in Delhi");
  assert.equal(d.date, "1990-01-15");
  assert.equal(d.time, "06:30");
  assert.equal(d.place?.name, "New Delhi");
});

test("Numeric day-first date with pm time", () => {
  const d = parseBirthDetails("born 05/11/1987 at 7.45 pm, Varanasi");
  assert.equal(d.date, "1987-11-05");
  assert.equal(d.time, "19:45");
  assert.equal(d.place?.name, "Varanasi");
});

test("Hinglish: shaam 7 baje, Bombay alias", () => {
  const d = parseBirthDetails("meri janam tithi 3-8-1995 hai, shaam 7 baje, bombay");
  assert.equal(d.date, "1995-08-03");
  assert.equal(d.time, "19:00");
  assert.equal(d.place?.name, "Mumbai");
});

test("US style month first and 24h clock", () => {
  const d = parseBirthDetails("January 2, 2001 18:20 Chicago");
  assert.equal(d.date, "2001-01-02");
  assert.equal(d.time, "18:20");
  assert.equal(d.place?.timeZone, "America/Chicago");
});

test("ISO date, subah, gazetteer city", () => {
  const d = parseBirthDetails("1992-04-21 subah 5:10 Lucknow mera naam Ravi hai");
  assert.equal(d.date, "1992-04-21");
  assert.equal(d.time, "05:10");
  assert.equal(d.place?.name, "Lucknow");
  assert.equal(d.name, "Ravi");
});

test("Missing pieces stay undefined; invalid date rejected", () => {
  const d = parseBirthDetails("31/02/1990");
  assert.equal(d.date, undefined);
  const e = parseBirthDetails("make my kundli");
  assert.deepEqual([e.date, e.time, e.place], [undefined, undefined, undefined]);
});
