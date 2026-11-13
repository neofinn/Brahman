import { test } from "node:test";
import assert from "node:assert/strict";
import { respond, type Card } from "../lib/finder.ts";
import { supportWords, SITUATIONS } from "../lib/support.ts";
import { getKatha } from "../lib/kathas/index.ts";
import { getKriya } from "../lib/kriyas.ts";

const card = (q: string) => respond(q).cards[0] as Card;
const support = (q: string) => {
  const c = card(q);
  assert.equal(c.type, "support", `${q} → ${JSON.stringify(c)}`);
  return c as Extract<Card, { type: "support" }>;
};

test("everyday feelings and moments are recognised", () => {
  const cases: [string, string][] = [
    ["I have exam tomorrow pray for me", "exam"],
    ["kal mera paper hai, ashirwad dijiye", "exam"],
    ["board exams are coming and I am nervous", "exam"],
    ["I have an interview today", "interview"],
    ["job interview hai kal", "interview"],
    ["I'm feeling scared", "fear"],
    ["mujhe bahut darr lag raha hai", "fear"],
    ["motivate me", "motivation"],
    ["I failed again and want to give up", "motivation"],
    ["I lost my job", "motivation"],
    ["my mother is in hospital", "illness"],
    ["papa ki tabiyat kharab hai", "illness"],
    ["my grandfather passed away yesterday", "grief"],
    ["I am going abroad next week, bless my journey", "travel"],
    ["starting a new business on Monday", "new-beginning"],
    ["I am in debt and worried about money", "money"],
    ["shaadi mein deri ho rahi hai", "marriage"],
    ["I feel so lonely", "loneliness"],
    ["I can't sleep", "sleep"],
    ["I passed my exam! thank god", "gratitude"],
    ["mujhe bahut gussa aata hai", "anger"],
    ["मुझे डर लग रहा है", "fear"],
  ];
  for (const [q, id] of cases) assert.equal(support(q).id, id, q);
});

test("who and when are picked up and the words personalised", () => {
  const c = support("my son has his exam tomorrow, please pray");
  assert.equal(c.relation?.who, "your son");
  assert.equal(c.when, "tomorrow");
  const w = supportWords(c)!;
  assert.match(w.comfort, /pray for your son.*he will do well/);
  assert.match(w.prayer, /bless this devotee's son tomorrow/);
  assert.match(w.prayer, /Make his mind calm/);
  const self = supportWords(support("I have exam tomorrow pray for me"))!;
  assert.match(self.prayer, /bless this devotee tomorrow/);
  assert.match(self.prayer, /Make their mind calm/);
  assert.doesNotMatch(self.comfort, /, you[.!]/);
  for (const s of SITUATIONS) {
    for (const t of [...s.comfort, s.comfortOther, s.prayer]) {
      assert.doesNotMatch(t.replace(/\{(who|whose|they|them|when)\}/g, ""), /[{}]/, `${s.id}: ${t}`);
    }
    if (s.kathaId) assert.ok(getKatha(s.kathaId), `${s.id} katha`);
    if (s.ritualId) assert.ok(getKriya(s.ritualId), `${s.id} ritual`);
  }
});

test("crisis and emergencies put real help first", () => {
  for (const q of ["I want to die", "i don't want to live anymore", "mujhe marna hai, jeena nahi chahta", "I keep thinking about suicide", "आत्महत्या"]) {
    assert.deepEqual(card(q), { type: "crisis", kind: "crisis" }, q);
  }
  assert.deepEqual(card("my father has chest pain"), { type: "crisis", kind: "emergency" });
});

test("named rites and kathas still win when asked for directly", () => {
  assert.deepEqual(card("mahamrityunjaya jaap for my father's health"), { type: "ritual", id: "mahamrityunjaya" });
  assert.deepEqual(card("ganesh puja for new business"), { type: "ritual", id: "ganesh-puja" });
  assert.equal(card("blood test report").type !== "support" || (card("blood test report") as { id: string }).id === "illness", true);
  assert.deepEqual(card("hanuman chalisa"), { type: "katha", id: "hanuman-chalisa" });
});
