// Every fixed mantra and verse Brahman recites, so a human-like recitation can be recorded once for each of them.
import { GITA_9_26, MANASA_PUJA, RIVERS_INVOCATION } from "./abroad.ts";
import { GRAHAS } from "./grahas.ts";
import { MANTRAS } from "./hawans.ts";
import { KATHAS } from "./kathas/index.ts";
import { KRIYAS } from "./kriyas.ts";
import { SITUATIONS } from "./support.ts";

import { mantraKey } from "./speech.ts";

export { mantraKey };

export function allMantraTexts(): string[] {
  const texts = new Set<string>();
  const add = (d?: string) => d && /[ऀ-ॿ]/.test(d) && texts.add(mantraKey(d));
  Object.values(MANTRAS).forEach((m) => add(m.devanagari));
  for (const k of KRIYAS) {
    k.steps.forEach((s) => add(s.mantra?.devanagari));
  }
  for (const g of GRAHAS) {
    add(g.beej.devanagari);
    add(g.stotra.devanagari);
  }
  for (const k of KATHAS) {
    k.keyVerses?.forEach((m) => add(m.devanagari));
    k.parts?.forEach((p) => add(p.verse?.devanagari));
    k.fullText?.forEach((m) => add(m.devanagari));
  }
  for (const s of SITUATIONS) {
    s.mantras.forEach((m) => add(m.devanagari));
    add(s.verse.devanagari);
  }
  [RIVERS_INVOCATION, MANASA_PUJA, GITA_9_26].forEach((m) => add(m.devanagari));
  return [...texts];
}
