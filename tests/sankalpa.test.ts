import { test } from "node:test";
import assert from "node:assert/strict";
import { computePanchang } from "../lib/jyotish.ts";
import { buildSankalpa, KARMAS, sankalpaTime, tarpanMantras, type Profile } from "../lib/sankalpa.ts";
import { nameToDevanagari, toIast } from "../lib/sanskrit.ts";
import { PLACES, weekdayOf, zonedToUtc } from "../lib/time.ts";
import { respond } from "../lib/finder.ts";
import { KRIYAS } from "../lib/kriyas.ts";

const VARANASI = PLACES[0];
const panchangOn = (date: string) => computePanchang(zonedToUtc(date, "00:00", "Asia/Kolkata"), weekdayOf(date), VARANASI);

const RAMESH: Profile = {
  name: "Ramesh Sharma", nameDeva: "रमेश शर्मा", gender: "m", gotra: "kashyap", gotraDeva: "काश्यप",
  father: "Ramprasad Sharma", fatherDeva: "रामप्रसाद शर्मा", place: VARANASI, placeDeva: "वाराणसी",
  monthSystem: "purnimanta", ancestors: { father: "रामप्रसाद", grandmother: "गंगा" },
};

test("sankalpa names the person, gotra, father, place and the day's panchang", () => {
  // 22 Jan 2024: Pausha Shukla Dwadashi, Mrigashira, Monday (Ram Mandir pran pratishtha).
  const s = buildSankalpa(RAMESH, "ganesh-puja", panchangOn("2024-01-22"));
  for (const part of [
    "ॐ विष्णुर्विष्णुर्विष्णुः।", "जम्बूद्वीपे भरतखण्डे भारतवर्षे वाराणसीनगरे", "विक्रमाब्दे २०८०", "उत्तरायणे", "हेमन्तर्तौ",
    "पौषमासे", "शुक्लपक्षे", "द्वादशीतिथौ", "सोमवासरे", "मृगशिरानक्षत्रे",
    "काश्यपगोत्रोत्पन्नः रामप्रसाद शर्मा नाम्नः पुत्रः रमेश शर्मा नामाहं",
    "क्षेमस्थैर्यायुरारोग्यैश्वर्याभिवृद्ध्यर्थं", "श्रीमहागणपतिपूजनं करिष्ये॥",
  ]) assert.ok(s.devanagari.includes(part), `missing ${part}\n${s.devanagari}`);
  assert.match(s.meaning, /I, Ramesh Sharma, son of Ramprasad Sharma, born in the Kashyap gotra/);
  assert.match(s.iast, /kāśyapagotrotpannaḥ rāmaprasāda śarmā nāmnaḥ putraḥ rameśa śarmā nāmāhaṃ/);
});

test("feminine forms, rite-specific purpose, and places outside India", () => {
  const priya: Profile = { ...RAMESH, name: "Priya", nameDeva: "प्रिया", gender: "f", place: PLACES.find((p) => p.name === "London")!, placeDeva: "लन्दन" };
  const s = buildSankalpa(priya, "karwa-chauth", panchangOn("2024-10-20"));
  assert.ok(s.devanagari.includes("काश्यपगोत्रोत्पन्ना रामप्रसाद शर्मा नाम्नः पुत्री प्रिया नाम्नी अहं"));
  assert.ok(s.devanagari.includes("मम पत्युः दीर्घायुरारोग्यसौभाग्यप्राप्त्यर्थं करकचतुर्थीव्रतं करिष्ये॥"));
  assert.ok(!s.devanagari.includes("भरतखण्डे"));
  assert.ok(s.devanagari.includes("लन्दननगरे"));
});

test("month systems and adhik masa", () => {
  // 26 Feb 2025 (Maha Shivaratri, Krishna paksha): Magha in amanta, Phalguna in purnimanta.
  const p = panchangOn("2025-02-26");
  assert.equal(sankalpaTime(p, "amanta").masaDeva, "माघमासे");
  assert.equal(sankalpaTime(p, "purnimanta").masaDeva, "फाल्गुनमासे");
  assert.equal(sankalpaTime(p, "amanta").rituDeva, "शिशिरर्तौ");
  // 25 Jul 2023 fell in Adhik Shravana (Shukla paksha).
  assert.equal(sankalpaTime(panchangOn("2023-07-25"), "purnimanta").masaDeva, "अधिकश्रावणमासे");
  // Amavasya and Purnima use their own names.
  assert.equal(sankalpaTime(panchangOn("2024-11-01"), "amanta").tithiDeva, "अमावास्यातिथौ");
});

test("tarpan names each departed ancestor with the right form", () => {
  const t = tarpanMantras(RAMESH);
  assert.equal(t.length, 2);
  assert.equal(t[0].devanagari, "काश्यपगोत्रः अस्मत्पिता रामप्रसाद नामा वसुरूपस्तृप्यताम्। इदं सतिलं जलं तस्मै स्वधा नमः॥");
  assert.equal(t[1].devanagari, "काश्यपगोत्रा अस्मत्पितामही गंगा नाम्नी देवी रुद्ररूपा तृप्यताम्। इदं सतिलं जलं तस्यै स्वधा नमः॥");
});

test("script helpers", () => {
  assert.equal(toIast("काश्यपगोत्रोत्पन्नः शरदृतौ"), "kāśyapagotrotpannaḥ śaradṛtau");
  assert.equal(nameToDevanagari("Ramesh Sharma"), "रमेश शर्मा");
  assert.equal(nameToDevanagari("Suresh Kumar"), "सुरेश कुमार");
  assert.equal(nameToDevanagari("Ankit"), "अंकित");
  assert.equal(nameToDevanagari("रमेश"), "रमेश");
});

test("every rite with a sankalpa step has a Sanskrit purpose", () => {
  for (const k of KRIYAS) {
    if (k.steps.some((s) => /sankalpa/i.test(s.title))) assert.ok(KARMAS[k.id], `${k.id} has no karma`);
  }
});

test("chat: sankalpa requests", () => {
  assert.deepEqual(respond("mera sankalp batao").cards[0], { type: "sankalpa", ritualId: "daily-puja" });
  assert.deepEqual(respond("satyanarayan puja sankalpa").cards[0], { type: "sankalpa", ritualId: "satyanarayan" });
  assert.deepEqual(respond("my gotra is kashyap").cards[0], { type: "sankalpa", ritualId: "daily-puja" });
});
