// Lo Shu grid numerology as practised in Indian (Vedic) numerology: the digits of the date of birth, with the
// conductor (destiny) number and — for birth days of 10 and above — the driver number, placed in the magic square
//   4 9 2
//   3 5 7
//   8 1 6
import { NUMBER_PLANETS, reduce } from "./numerology.ts";

export const LO_SHU_LAYOUT = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

const MEANING: Record<number, { present: string; missing: string; repeated: string }> = {
  1: { present: "self-expression and communication", missing: "difficulty expressing feelings; work on speaking up", repeated: "very talkative or, at times, misunderstood; strong ego" },
  2: { present: "sensitivity, intuition and cooperation", missing: "low sensitivity to others' feelings; impatience", repeated: "over-sensitive and easily hurt" },
  3: { present: "imagination, memory and learning", missing: "weak memory or confidence in study", repeated: "lost in imagination; can be critical of others" },
  4: { present: "order, discipline and practical skill", missing: "lack of method and organisation", repeated: "rigid, overly hardworking; prone to stress" },
  5: { present: "balance, willpower and emotional centre", missing: "unstable emotions; needs grounding", repeated: "restless; ups and downs in life" },
  6: { present: "home, responsibility, love of comfort and family", missing: "neglect of home or tensions in family life", repeated: "over-protective; worry about family" },
  7: { present: "spiritual depth and learning through experience", missing: "little interest in spiritual life", repeated: "losses and setbacks that teach detachment" },
  8: { present: "money sense, method and endurance", missing: "careless with money and details", repeated: "fixed in views; material focus" },
  9: { present: "idealism, intelligence and humanitarian concern", missing: "lack of ambition or compassion for the wider world", repeated: "idealistic to the point of being judgmental" },
};

const PLANES: { name: string; numbers: number[]; text: string }[] = [
  { name: "Mental plane", numbers: [4, 9, 2], text: "a sharp, thoughtful mind and planning ability" },
  { name: "Emotional plane", numbers: [3, 5, 7], text: "emotional depth and spiritual sensitivity" },
  { name: "Practical plane", numbers: [8, 1, 6], text: "practical skill and success in material life" },
  { name: "Thought plane", numbers: [4, 3, 8], text: "a planner and organiser" },
  { name: "Will plane", numbers: [9, 5, 1], text: "strong determination and willpower" },
  { name: "Action plane", numbers: [2, 7, 6], text: "turning ideas into action" },
  { name: "Golden (success) yoga", numbers: [4, 5, 6], text: "success, prosperity and fame through effort" },
  { name: "Silver (property) yoga", numbers: [2, 5, 8], text: "gains through property and steady wealth" },
];

export interface LoShu {
  digits: number[];
  driver: number;
  conductor: number;
  counts: Record<number, number>;
  planes: { name: string; numbers: number[]; text: string }[];
  present: string[];
  missing: { n: number; planet: string; text: string; remedy: string }[];
  repeated: string[];
}

const REMEDY: Record<number, string> = {
  1: "Offer water to the rising Sun; wear or keep copper; respect your father.",
  2: "Keep a silver item; honour your mother; drink water from a silver glass.",
  3: "Respect teachers; apply a turmeric tilak on Thursdays; donate chana dal.",
  4: "Keep your space orderly; feed birds; chant 'Om Raam Rahave Namah' on Saturdays.",
  5: "Keep green plants; feed green grass to cows on Wednesdays; chant 'Om Budhaya Namah'.",
  6: "Keep your home clean and fragrant; respect women; worship Lakshmi on Fridays.",
  7: "Feed dogs; serve the needy; worship Ganesha.",
  8: "Serve elders and workers; donate black sesame on Saturdays; chant the Hanuman Chalisa.",
  9: "Worship Hanuman on Tuesdays; donate red lentils; keep good relations with brothers.",
};

export function loShu(date: string): LoShu {
  const [y, m, d] = date.split("-").map(Number);
  const digits = `${d}${m}${y}`.split("").map(Number).filter((n) => n > 0);
  const driver = reduce(d);
  const conductor = reduce(digits.reduce((a, b) => a + b, 0));
  const all = [...digits, conductor, ...(d >= 10 ? [driver] : [])];
  const counts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) counts[n] = all.filter((x) => x === n).length;
  return {
    digits: all,
    driver,
    conductor,
    counts,
    planes: PLANES.filter((p) => p.numbers.every((n) => counts[n] > 0)),
    present: [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => counts[n] === 1 || counts[n] === 2).map((n) => `${n} (${NUMBER_PLANETS[n]}): ${MEANING[n].present}`),
    missing: [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => counts[n] === 0).map((n) => ({ n, planet: NUMBER_PLANETS[n], text: MEANING[n].missing, remedy: REMEDY[n] })),
    repeated: [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => counts[n] >= 3).map((n) => `${n} appears ${counts[n]} times: ${MEANING[n].repeated}`),
  };
}

/** The personal year number for a calendar year (birth day + birth month + year, reduced). */
export function personalYear(date: string, year: number): number {
  const [, m, d] = date.split("-").map(Number);
  return reduce(`${d}${m}${year}`.split("").map(Number).reduce((a, b) => a + b, 0));
}

export const PERSONAL_YEAR: Record<number, string> = {
  1: "new beginnings — start projects, take initiative",
  2: "partnerships and patience — cooperate, let things ripen",
  3: "expression and growth — learning, creativity, social life",
  4: "hard work and foundations — discipline, health, property",
  5: "change and movement — travel, new directions",
  6: "home and responsibility — family, marriage, service",
  7: "reflection and spirituality — study, rest, inner work",
  8: "power and money — career rise, financial decisions",
  9: "completion — finish cycles, let go, charity",
};
