import { test } from "node:test";
import assert from "node:assert/strict";
import { transliterate } from "../lib/devanagari.ts";

test("common words", () => {
  assert.equal(transliterate("ग्रह शांति हवन"), "grah shanti havan");
  assert.equal(transliterate("पूजा"), "puja");
  assert.equal(transliterate("सत्यनारायण कथा"), "satyanarayan katha");
  assert.equal(transliterate("कुंडली बनाओ"), "kundali banao");
  assert.equal(transliterate("15 जनवरी 1990 सुबह 6:30 बजे दिल्ली"), "15 janavari 1990 subah 6:30 baje dilli");
  assert.equal(transliterate("शाम ७ बजे"), "sham 7 baje");
  assert.equal(transliterate("Mixed हिंदी text"), "Mixed hindi text");
});
