import { test } from "node:test";
import assert from "node:assert/strict";
import { respond, type Card } from "../lib/finder.ts";
import { computeKundli } from "../lib/jyotish.ts";
import { readKundli, antardashas, namingSyllable, nadiOf } from "../lib/reading.ts";
import { zonedToUtc } from "../lib/time.ts";

const first = (cards: Card[]) => cards.find((c) => c.type !== "text")!;

const RITUAL_QUERIES: [string, string][] = [
  ["I wanna perform greh shanti hawan", "navagraha-shanti"],
  ["grah shanti pooja kaise kare", "navagraha-shanti"],
  ["navgrah havan samagri", "navagraha-shanti"],
  ["how to do havan at home", "havan"],
  ["griha pravesh puja", "griha-pravesh"],
  ["naye ghar mein greh pravesh karna hai", "griha-pravesh"],
  ["satyanarayan katha vidhi", "satyanarayan"],
  ["Diwali laxmi pujan", "lakshmi-puja"],
  ["navratri kalash sthapana", "navratri"],
  ["rudrabhishek on shivratri", "rudrabhishek"],
  ["kaal sarp dosh puja", "kaal-sarp"],
  ["manglik dosh remedy", "mangal-dosh"],
  ["pitru paksha shradh", "tarpan"],
  ["ekadashi vrat ke niyam", "ekadashi"],
  ["vastu shanti for new office", "vastu-shanti"],
  ["karwa chauth", "karwa-chauth"],
  ["mundan sanskar", "samskaras"],
];

for (const [q, id] of RITUAL_QUERIES) {
  test(`finder: "${q}" → ${id}`, () => {
    const card = first(respond(q).cards);
    assert.equal(card.type, "ritual", JSON.stringify(respond(q).cards));
    assert.equal((card as { id: string }).id, id);
  });
}

test("finder: mantra lookup", () => {
  const card = first(respond("gayatri mantra").cards);
  assert.equal(card.type, "mantra");
  const mm = first(respond("om tryambakam mantra").cards);
  assert.equal(mm.type, "mantra");
});

test("finder: graha mantra", () => {
  const card = first(respond("shani mantra").cards);
  assert.deepEqual(card, { type: "graha", name: "Saturn" });
});

test("finder: kundli in one message", () => {
  const r = respond("My DOB is 15 Jan 1990, 6:30 am, Delhi");
  const card = first(r.cards);
  assert.equal(card.type, "kundli");
});

test("finder: kundli gathered across messages", () => {
  const r1 = respond("make my kundli");
  assert.ok(r1.state.pendingKundli);
  const r2 = respond("12/03/1985", r1.state);
  assert.equal(r2.state.pendingKundli?.date, "1985-03-12");
  const r3 = respond("subah 7:15 baje, Pune", r2.state);
  const card = first(r3.cards);
  assert.equal(card.type, "kundli");
  assert.equal(r3.state.pendingKundli, undefined);
  assert.equal(r3.state.lastBirth?.date, "1985-03-12");
});

test("finder: moving on from a pending kundli", () => {
  const r1 = respond("kundli banao");
  const r2 = respond("satyanarayan katha vidhi", r1.state);
  assert.equal(first(r2.cards).type, "ritual");
});

test("finder: panchang and greeting", () => {
  assert.equal(first(respond("aaj ka panchang").cards).type, "panchang");
  assert.equal(first(respond("Namaste").cards).type, "suggestions");
  assert.equal(respond("qwerty zxcv").unmatched, true);
});

test("reading: complete and consistent", () => {
  const k = computeKundli(zonedToUtc("1990-01-15", "06:30", "Asia/Kolkata"), { latitude: 28.6139, longitude: 77.209 });
  const r = readKundli(k, new Date("2026-10-22T00:00:00Z"));
  assert.match(r.summary, /Dhanu lagna, Simha rashi, Purva Phalguni/);
  const titles = r.sections.map((s) => s.title);
  assert.ok(titles.some((t) => t.startsWith("Current dasha: Rahu")), titles.join("|"));
  assert.ok(titles.includes("Doshas"));
  assert.ok(r.remedies.some((x) => x.graha === "Rahu"));
  assert.ok(r.rituals.includes("navagraha-shanti"));
});

test("reading: helpers", () => {
  const a = antardashas({ lord: "Jupiter", start: new Date(0), end: new Date(16 * 365.2425 * 86400000) });
  assert.equal(a[0].lord, "Jupiter");
  assert.equal(a[1].lord, "Saturn");
  assert.ok(Math.abs(a[8].end.getTime() - 16 * 365.2425 * 86400000) < 1000);
  assert.equal(namingSyllable(0, 1), "चू");
  assert.equal(nadiOf(3), "Antya"); // Rohini
  assert.equal(nadiOf(17), "Adi"); // Jyeshtha
});

test("finder: more everyday phrasings", () => {
  const cases: [string, string][] = [
    ["I want to do havan", "havan"],
    ["hawan karna hai", "havan"],
    ["shri ganesh puja vidhi", "ganesh-puja"],
    ["shri satyanarayan bhagwan ki katha", "satyanarayan"],
    ["krishna janmashtami ki puja", "janmashtami"],
    ["mahamrityunjaya jaap for my father's health", "mahamrityunjaya"],
  ];
  for (const [q, id] of cases) {
    const card = respond(q).cards.find((c) => c.type !== "text");
    assert.deepEqual(card, { type: "ritual", id }, q);
  }
});

test("finder: kathas and granths", () => {
  const cases: [string, string, number?][] = [
    ["sunderkand path", "sundarkand"],
    ["bhagwat katha", "bhagavata-purana"],
    ["bhagwat skandh 10", "bhagavata-purana", 10],
    ["gita adhyay 2", "bhagavad-gita", 2],
    ["bhagavad gita chapter 18", "bhagavad-gita", 18],
    ["garud puran", "garuda-purana"],
    ["ramayan ki katha", "ramcharitmanas"],
    ["valmiki ramayan", "valmiki-ramayana"],
    ["hanuman chalisa", "hanuman-chalisa"],
    ["durga saptashati path", "durga-saptashati"],
    ["shiv puran katha", "shiv-purana"],
    ["mahabharat", "mahabharata"],
    ["dhruv ki kahani", "dhruva"],
    ["prahlad aur holika", "prahlad"],
    ["gajendra moksha", "gajendra-moksha"],
    ["samudra manthan", "samudra-manthan"],
    ["savitri satyavan katha", "savitri-satyavan"],
    ["karwa chauth katha", "karwa-chauth-katha"],
    ["ganesh chaturthi katha", "ganesh-chaturthi-katha"],
    ["shivratri vrat katha", "shivratri-katha"],
    ["सुंदरकांड", "sundarkand"],
  ];
  for (const [q, id, part] of cases) {
    const card = respond(q).cards.find((c) => c.type !== "text");
    assert.deepEqual(card, { type: "katha", id, ...(part ? { part } : {}) }, q);
  }
  // Vrat rituals stay rituals unless the katha is asked for.
  assert.deepEqual(respond("karwa chauth").cards[0], { type: "ritual", id: "karwa-chauth" });
});

test("katha library: Hanuman Chalisa has 40 chaupais and every katha links resolve", async () => {
  const { KATHAS, getKatha } = await import("../lib/kathas/index.ts");
  const { getKriya } = await import("../lib/kriyas.ts");
  const chalisa = getKatha("hanuman-chalisa")!;
  assert.equal(chalisa.fullText!.filter((l) => l.label?.startsWith("Chaupai")).length, 40);
  assert.equal(getKatha("bhagavad-gita")!.parts!.length, 18);
  assert.equal(getKatha("bhagavata-purana")!.parts!.length, 12);
  for (const k of KATHAS) {
    if (k.vidhiId) assert.ok(getKriya(k.vidhiId), `${k.id} vidhi ${k.vidhiId}`);
    for (const r of k.related ?? []) assert.ok(getKatha(r), `${k.id} related ${r}`);
  }
  assert.equal(new Set(KATHAS.map((k) => k.id)).size, KATHAS.length);
});
