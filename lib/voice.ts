// What Brahman says aloud for each kind of answer — a spoken version, shorter than the written one.
import type { Card } from "./finder.ts";
import { getGraha } from "./grahas.ts";
import { computeKundli } from "./jyotish.ts";
import { getKatha } from "./kathas/index.ts";
import { getKriya } from "./kriyas.ts";
import { getArticle } from "./learned.ts";
import { readKundli } from "./reading.ts";
import type { Step } from "./ritual-common.ts";
import { zonedToUtc } from "./time.ts";

const list = (items: string[]) => items.join(", ").replace(/, ([^,]*)$/, " and $1");

export function stepSpeech(step: Step, index: number): string[] {
  const out = [`Step ${index + 1}. ${step.title}. ${step.detail}`];
  if (step.mantra) out.push(`Recite with me: ${step.mantra.devanagari}`);
  return out;
}

export function speechForCard(card: Card): string[] {
  switch (card.type) {
    case "text":
      return [card.text.replace(/^🙏\s*/, "")];
    case "ritual": {
      const k = getKriya(card.id);
      if (!k) return [];
      return [
        `${k.title}. ${k.summary}`,
        `When: ${k.when}`,
        `You will need: ${list(k.samagri.map((s) => s.split(/[(:]/)[0].trim()))}.`,
        `The vidhi has ${k.steps.length} steps. Choose "Perform with me" and I will guide you through each one and recite the mantras.`,
      ];
    }
    case "ritualList":
      return [`${card.title}: ${list(card.ids.map((id) => getKriya(id)?.title ?? id))}.`];
    case "graha": {
      const g = getGraha(card.name);
      return [`${g.sanskrit}. Its beej mantra is`, g.beej.devanagari, `Chant it 108 times on ${g.day}. Give ${g.daan} in charity.`];
    }
    case "mantra":
      return [card.title, card.mantra.devanagari, `Meaning: ${card.mantra.meaning}`];
    case "kundli": {
      const k = computeKundli(zonedToUtc(card.date, card.time, card.place.timeZone), card.place);
      const r = readKundli(k);
      const pick = (title: string) => r.sections.find((s) => s.title.startsWith(title));
      const lagna = pick("Lagna");
      const moon = pick("Rashi");
      const dasha = pick("Current dasha");
      const doshas = pick("Doshas");
      return [
        `Your kundli is ready. ${r.summary}`,
        ...(lagna?.paragraphs ?? []),
        ...(moon?.paragraphs.slice(1) ?? []),
        ...(doshas?.bullets ?? []),
        ...(dasha?.paragraphs.slice(0, 1) ?? []),
        r.remedies.length ? `For remedies I suggest worship of ${list([...new Set(r.remedies.map((x) => getGraha(x.graha).sanskrit))])}. The mantras are shown below.` : "",
      ].filter(Boolean);
    }
    case "panchang":
      return ["Here is the panchang. Choose the date and your city to see the timings."];
    case "scripture":
      return [`${card.name}. ${card.description}`];
    case "article": {
      const a = getArticle(card.id);
      if (!a) return [];
      const plain = a.body.replace(/^#+\s*/gm, "").replace(/^\s*[-*]\s+/gm, "").replace(/\n{2,}/g, ". ");
      return [a.title, plain.length > 1500 ? `${plain.slice(0, 1500)}…` : plain];
    }
    case "katha":
      return kathaSpeech(card.id, card.part);
    case "suggestions":
      return [];
  }
}

/** Brahman tells the katha: the whole story for a katha, an overview (or one chapter) for a granth. */
export function kathaSpeech(id: string, part?: number): string[] {
  const k = getKatha(id);
  if (!k) return [];
  if (part && k.parts?.[part - 1]) {
    const p = k.parts[part - 1];
    return [`${k.title}. ${p.title}.`, p.summary, ...(p.verse ? [p.verse.devanagari, `Meaning: ${p.verse.meaning}`] : [])];
  }
  if (k.story) return [k.title, ...k.story];
  if (k.fullText) return [`${k.title}. ${k.summary}`, "Tap Recite the whole path, and I will recite it with you."];
  return [
    `${k.title}. ${k.summary}`,
    ...(k.parts ? [`${k.partsLabel ?? "It has these parts"}: ${list(k.parts.map((p) => p.title.split(/ — | \(/)[0]))}.`] : []),
    ...(k.teachings?.length ? [`Its teachings: ${k.teachings.join(" ")}`] : []),
  ];
}
