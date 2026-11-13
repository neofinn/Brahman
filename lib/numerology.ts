// Chaldean numerology: name number (compound and root), birth number and destiny number, with their ruling planets.

// Chaldean values (the number 9 is not assigned to any letter).
const VALUES: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export const NUMBER_PLANETS: Record<number, string> = { 1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury", 6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars" };

const NUMBER_TRAITS: Record<number, string> = {
  1: "leadership, independence, ambition and originality",
  2: "sensitivity, cooperation, imagination and diplomacy",
  3: "wisdom, optimism, discipline and a love of learning",
  4: "hard work, unconventional thinking and sudden changes",
  5: "quick wit, communication, adaptability and business sense",
  6: "harmony, love, beauty, family and artistic taste",
  7: "intuition, spirituality, research and a reflective nature",
  8: "perseverance, responsibility and success that comes slowly but lasts",
  9: "courage, energy, generosity and a fighting spirit",
};

export const reduce = (n: number): number => {
  while (n > 9) n = String(n).split("").reduce((a, d) => a + Number(d), 0);
  return n;
};

export interface Numerology {
  name?: { compound: number; root: number; planet: string; traits: string; letters: { letter: string; value: number }[] };
  birth: { number: number; planet: string; traits: string };
  destiny: { compound: number; number: number; planet: string; traits: string };
}

export function nameNumber(name: string) {
  const letters = name.toUpperCase().split("").filter((c) => VALUES[c]).map((letter) => ({ letter, value: VALUES[letter] }));
  if (!letters.length) return undefined;
  const compound = letters.reduce((a, l) => a + l.value, 0);
  const root = reduce(compound);
  return { compound, root, planet: NUMBER_PLANETS[root], traits: NUMBER_TRAITS[root], letters };
}

/** `date` is YYYY-MM-DD (the civil date of birth). */
export function numerology(date: string, name?: string): Numerology {
  const [y, m, d] = date.split("-").map(Number);
  const birth = reduce(d);
  const compound = String(d).split("").concat(String(m).split(""), String(y).split("")).reduce((a, c) => a + Number(c), 0);
  const destiny = reduce(compound);
  return {
    name: name ? nameNumber(name) : undefined,
    birth: { number: birth, planet: NUMBER_PLANETS[birth], traits: NUMBER_TRAITS[birth] },
    destiny: { compound, number: destiny, planet: NUMBER_PLANETS[destiny], traits: NUMBER_TRAITS[destiny] },
  };
}
