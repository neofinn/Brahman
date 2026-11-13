import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { respond, setLearnedKnowledge, type Card } from "../lib/finder.ts";
import { getKriya } from "../lib/kriyas.ts";
import type { LearnedEntry } from "../lib/learned.ts";
import { parseBirthDetails } from "../lib/parse.ts";
import { chunks, segments } from "../lib/speech.ts";

const first = (cards: Card[]) => cards.find((c) => c.type !== "text")!;

const base = {
  devanagari: "", summary: "", when: "", duration: "", purohit: "", samagri: [], steps: [], notes: [], body: "", sources: [],
  createdAt: "2026-10-22T00:00:00Z",
};

const ARTICLE: LearnedEntry = {
  ...base, id: "learned-pandharpur-wari", kind: "article", category: "knowledge", title: "Pandharpur Wari",
  keywords: ["pandharpur", "wari", "vithoba", "warkari", "pandharpur yatra"], body: "The Wari is a pilgrimage…", question: "what is pandharpur wari",
};
const RITUAL: LearnedEntry = {
  ...base, id: "learned-chhath-puja", kind: "ritual", category: "vrat", title: "Chhath Puja",
  keywords: ["chhath", "chhath puja", "surya shashthi", "chhath vrat"], question: "how to do chhath puja",
  samagri: ["Bamboo soop"], steps: [{ title: "Nahay khay", detail: "Bathe and eat a sattvic meal." }],
};

test("unknown questions are unmatched before learning", () => {
  setLearnedKnowledge([]);
  assert.equal(respond("what is pandharpur wari").unmatched, true);
  assert.equal(respond("chhath puja kaise kare").unmatched, true);
});

test("learned entries answer later questions offline", () => {
  setLearnedKnowledge([ARTICLE, RITUAL]);
  assert.deepEqual(first(respond("tell me about the pandharpur wari").cards), { type: "article", id: "learned-pandharpur-wari" });
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
    { text: "ॐ नमः शिवाय।", lang: "hi" },
    { text: "Then offer water.", lang: "en" },
  ]);
});

test("speech is split into sentence-sized pieces at the danda", () => {
  assert.deepEqual(chunks("पहला वाक्य। दूसरा वाक्य।", 12), ["पहला वाक्य।", "दूसरा वाक्य।"]);
  assert.deepEqual(chunks("पहला वाक्य। दूसरा वाक्य।"), ["पहला वाक्य। दूसरा वाक्य।"]);
  for (const c of chunks("a ".repeat(400), 100)) assert.ok(c.length <= 100);
});

test("natural voice: provider selection and SSML", async () => {
  const { ttsProvider, azureSsml } = await import("../lib/tts.ts");
  assert.equal(ttsProvider({}), null);
  assert.equal(ttsProvider({ AZURE_SPEECH_KEY: "k", AZURE_SPEECH_REGION: "centralindia" })?.name, "azure");
  assert.equal(ttsProvider({ GOOGLE_TTS_API_KEY: "k" })?.name, "google");
  const ssml = azureSsml("राम & श्याम। जय", "hi");
  assert.ok(ssml.includes("hi-IN-MadhurNeural") && ssml.includes("&amp;") && ssml.includes('<break time="350ms"/>'));
  assert.ok(azureSsml("Hello", "en").includes("en-IN-PrabhatNeural"));
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

test("every recited mantra is collected for recording", async () => {
  const { allMantraTexts } = await import("../lib/mantra-texts.ts");
  const { isChant, mantraKey } = await import("../lib/speech.ts");
  const texts = allMantraTexts();
  assert.ok(texts.length > 100);
  assert.ok(texts.includes(mantraKey("ॐ भूर्भुवः स्वः। तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि। धियो यो नः प्रचोदयात्॥")));
  assert.equal(new Set(texts).size, texts.length);
  assert.ok(isChant("ॐ नमः शिवाय") && !isChant("भक्तों, आइए कथा सुनते हैं।"));
  const { azureSsml } = await import("../lib/tts.ts");
  assert.ok(azureSsml("ॐ नमः शिवाय॥", "hi", "chant").includes('rate="-20%"'));
});
