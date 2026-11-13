// Gemstones for life goals, chosen from the planets that govern each goal and checked against the chart, so a stone
// is never suggested for a planet that rules a difficult house for this lagna.
import { type Kundli } from "./jyotish.ts";
import { SIGN_LORDS } from "./reading.ts";
import { gemSafety } from "./predictions.ts";

export interface GemInfo {
  planet: string;
  gem: string;
  hindi: string;
  substitute: string;
  finger: string;
  metal: string;
  day: string;
  weight: string;
  mantra: string;
}

export const GEMS: Record<string, GemInfo> = {
  Sun: { planet: "Sun", gem: "Ruby", hindi: "माणिक्य (Manik)", substitute: "Red garnet or sunstone", finger: "ring finger", metal: "gold or copper", day: "Sunday at sunrise", weight: "3–5 ratti", mantra: "ॐ घृणिः सूर्याय नमः" },
  Moon: { planet: "Moon", gem: "Pearl", hindi: "मोती (Moti)", substitute: "Moonstone", finger: "little finger", metal: "silver", day: "Monday morning (Shukla paksha)", weight: "4–6 ratti", mantra: "ॐ सों सोमाय नमः" },
  Mars: { planet: "Mars", gem: "Red coral", hindi: "मूंगा (Moonga)", substitute: "Carnelian", finger: "ring finger", metal: "gold or copper", day: "Tuesday morning", weight: "6–9 ratti", mantra: "ॐ अं अङ्गारकाय नमः" },
  Mercury: { planet: "Mercury", gem: "Emerald", hindi: "पन्ना (Panna)", substitute: "Peridot or green tourmaline", finger: "little finger", metal: "gold", day: "Wednesday morning", weight: "3–6 ratti", mantra: "ॐ बुं बुधाय नमः" },
  Jupiter: { planet: "Jupiter", gem: "Yellow sapphire", hindi: "पुखराज (Pukhraj)", substitute: "Citrine or yellow topaz", finger: "index finger", metal: "gold", day: "Thursday morning", weight: "3–5 ratti", mantra: "ॐ बृं बृहस्पतये नमः" },
  Venus: { planet: "Venus", gem: "Diamond", hindi: "हीरा (Heera)", substitute: "White sapphire, white zircon or opal", finger: "middle or ring finger", metal: "silver or platinum", day: "Friday morning", weight: "0.5–1 carat (diamond); 3–6 ratti (substitutes)", mantra: "ॐ शुं शुक्राय नमः" },
  Saturn: { planet: "Saturn", gem: "Blue sapphire", hindi: "नीलम (Neelam)", substitute: "Amethyst or blue spinel", finger: "middle finger", metal: "silver or panchadhatu", day: "Saturday evening", weight: "3–5 ratti", mantra: "ॐ शं शनैश्चराय नमः" },
  Rahu: { planet: "Rahu", gem: "Hessonite", hindi: "गोमेद (Gomed)", substitute: "Orange zircon", finger: "middle finger", metal: "silver", day: "Saturday evening", weight: "5–8 ratti", mantra: "ॐ रां राहवे नमः" },
  Ketu: { planet: "Ketu", gem: "Cat's eye", hindi: "लहसुनिया (Lehsunia)", substitute: "Tiger's eye", finger: "little or middle finger", metal: "silver", day: "Tuesday or Thursday", weight: "3–5 ratti", mantra: "ॐ कें केतवे नमः" },
};

export interface GoalDef {
  id: string;
  goal: string;
  houses: number[];
  karakas: string[];
}

export const GOALS: GoalDef[] = [
  { id: "wealth", goal: "Accumulate wealth and savings", houses: [2, 11], karakas: ["Jupiter", "Venus"] },
  { id: "business", goal: "Increase business income", houses: [7, 10, 11], karakas: ["Mercury"] },
  { id: "career", goal: "Career growth, promotion and status", houses: [10, 1], karakas: ["Sun", "Saturn"] },
  { id: "studies", goal: "Improve studies, memory and exams", houses: [5, 4], karakas: ["Mercury", "Jupiter"] },
  { id: "love", goal: "Love life, romance and attraction", houses: [5, 7], karakas: ["Venus"] },
  { id: "marriage", goal: "Early or happy marriage", houses: [7], karakas: ["Venus", "Jupiter"] },
  { id: "children", goal: "Blessing of children", houses: [5], karakas: ["Jupiter"] },
  { id: "health", goal: "Health, vitality and recovery", houses: [1], karakas: ["Sun"] },
  { id: "confidence", goal: "Confidence, courage and leadership", houses: [1, 10], karakas: ["Sun", "Mars"] },
  { id: "peace", goal: "Peace of mind and emotional balance", houses: [4], karakas: ["Moon"] },
  { id: "property", goal: "Property, home and vehicles", houses: [4], karakas: ["Mars", "Venus"] },
  { id: "spiritual", goal: "Spiritual growth and protection", houses: [9, 12], karakas: ["Jupiter"] },
];

export interface GoalGem {
  id: string;
  goal: string;
  recommended?: GemInfo & { reason: string };
  alternative?: GemInfo & { reason: string };
  avoid: { planet: string; gem: string; reason: string }[];
  note: string;
}

export function gemsForGoals(k: Kundli): GoalGem[] {
  const lagna = k.lagna.rashi.index;
  return GOALS.map((g) => {
    const candidates = [...new Set([...g.houses.map((h) => SIGN_LORDS[(lagna + h - 1) % 12]), ...g.karakas])];
    const judged = candidates.map((p) => ({ p, s: gemSafety(k, p) }));
    const rank = { best: 0, good: 1, caution: 2, avoid: 3 } as const;
    const usable = judged.filter((x) => x.s.verdict === "best" || x.s.verdict === "good").sort((a, b) => rank[a.s.verdict] - rank[b.s.verdict]);
    const avoid = judged.filter((x) => x.s.verdict === "avoid").map((x) => ({ planet: x.p, gem: GEMS[x.p].gem, reason: x.s.reason }));
    const pick = (i: number) => (usable[i] ? { ...GEMS[usable[i].p], reason: usable[i].s.reason } : undefined);
    const recommended = pick(0);
    return {
      id: g.id,
      goal: g.goal,
      recommended,
      alternative: pick(1),
      avoid,
      note: recommended
        ? `Wear the ${recommended.gem.toLowerCase()} in ${recommended.metal} on the ${recommended.finger}, ${recommended.day}, after chanting ${recommended.mantra} 108 times. Test it for 3–7 days; remove it if sleep, health or mood suffers.`
        : "No planet governing this goal is safe to strengthen with a gem in your chart — use its mantra, daan and worship instead.",
    };
  });
}
