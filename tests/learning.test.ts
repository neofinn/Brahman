import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { respond, setLearnedKnowledge, type Card } from "../lib/finder.ts";
import { getKriya } from "../lib/kriyas.ts";
import type { LearnedEntry } from "../lib/learned.ts";
import { parseBirthDetails } from "../lib/parse.ts";
import { segments } from "../lib/speech.ts";

const first = (cards: Card[]) => cards.find((c) => c.type !== "text")!;

const base = {
  devanagari: "", summary: "", when: "", duration: "", purohit: "", samagri: [], steps: [], notes: [], body: "", sources: [],
  createdAt: "2026-10-22T00:00:00Z",
};

const ARTICLE: LearnedEntry = {
  ...base, id: "learned-nachiketa", kind: "article", category: "knowledge", title: "The story of Nachiketa",
  keywords: ["nachiketa", "nachiketa story", "yama and nachiketa"], body: "Nachiketa was a boy…", question: "who was nachiketa",
};
const RITUAL: LearnedEntry = {
  ...base, id: "learned-chhath-puja", kind: "ritual", category: "vrat", title: "Chhath Puja",
  keywords: ["chhath", "chhath puja", "surya shashthi", "chhath vrat"], question: "how to do chhath puja",
  samagri: ["Bamboo soop"], steps: [{ title: "Nahay khay", detail: "Bathe and eat a sattvic meal." }],
};

test("unknown questions are unmatched before learning", () => {
  setLearnedKnowledge([]);
  assert.equal(respond("who was nachiketa").unmatched, true);
  assert.equal(respond("chhath puja kaise kare").unmatched, true);
});

test("learned entries answer later questions offline", () => {
  setLearnedKnowledge([ARTICLE, RITUAL]);
  assert.deepEqual(first(respond("tell me the nachiketa story").cards), { type: "article", id: "learned-nachiketa" });
  assert.deepEqual(first(respond("chhath puja kaise kare").cards), { type: "ritual", id: "learned-chhath-puja" });
  assert.deepEqual(first(respond("chhath vrat vidhi batao").cards), { type: "ritual", id: "learned-chhath-puja" });
  assert.equal(getKriya("learned-chhath-puja")?.learned, true);
  // Built-in rites still win for their own questions.
  assert.deepEqual(first(respond("graha shanti hawan").cards), { type: "ritual", id: "navagraha-shanti" });
  setLearnedKnowledge([]);
  assert.equal(getKriya("learned-chhath-puja"), undefined);
});

test("Hindi in Devanagari reaches the finder and parser", () => {
  assert.deepEqual(first(respond("मुझे ग्रह शांति हवन करना है").cards), { type: "ritual", id: "navagraha-shanti" });
  assert.deepEqual(first(respond("सत्यनारायण कथा").cards), { type: "ritual", id: "satyanarayan" });
  const d = parseBirthDetails("15 जनवरी 1990 सुबह 6:30 बजे दिल्ली");
  assert.deepEqual([d.date, d.time, d.place?.name], ["1990-01-15", "06:30", "New Delhi"]);
  assert.equal(first(respond("मेरी कुंडली बनाओ, 15 जनवरी 1990 सुबह 6:30 बजे दिल्ली").cards).type, "kundli");
});

test("speech splits Devanagari and English for the right voices", () => {
  assert.deepEqual(segments("Recite with me: ॐ नमः शिवाय। Then offer water."), [
    { text: "Recite with me:", lang: "en" },
    { text: "ॐ नमः शिवाय,", lang: "hi" },
    { text: "Then offer water.", lang: "en" },
  ]);
});

test("knowledge store adds, de-duplicates ids and removes", async () => {
  process.env.KNOWLEDGE_FILE = path.join(await mkdtemp(path.join(tmpdir(), "brahman-")), "k.json");
  const store = await import("../lib/knowledge-store.ts");
  assert.deepEqual(await store.listLearned(), []);
  const [a, b] = await Promise.all([store.addLearned(ARTICLE), store.addLearned(ARTICLE)]);
  assert.notEqual(a.id, b.id);
  assert.equal((await store.listLearned()).length, 2);
  assert.equal(await store.removeLearned(a.id), true);
  assert.equal(await store.removeLearned("missing"), false);
  assert.deepEqual((await store.listLearned()).map((e) => e.id), [b.id]);
});
