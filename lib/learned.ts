// Knowledge Brahman has learned through AI searches. Entries are stored on the server, shared with every user,
// and answered offline afterwards like the built-in granth.
import type { Kriya, KriyaCategory, Step } from "./ritual-common.ts";

export interface LearnedEntry {
  id: string;
  kind: "ritual" | "article";
  title: string;
  devanagari: string;
  category: KriyaCategory | "knowledge";
  keywords: string[];
  summary: string;
  /** Ritual fields (empty for articles). */
  when: string;
  duration: string;
  purohit: string;
  samagri: string[];
  steps: Step[];
  notes: string[];
  /** Markdown answer for articles. */
  body: string;
  sources: string[];
  /** The question that first taught Brahman this entry. */
  question: string;
  createdAt: string;
}

export function learnedToKriya(e: LearnedEntry): Kriya {
  return {
    id: e.id,
    title: e.title,
    devanagari: e.devanagari,
    category: e.category === "knowledge" ? "puja" : e.category,
    keywords: [...e.keywords, e.question],
    duration: e.duration || undefined,
    purohit: e.purohit || undefined,
    summary: e.summary,
    when: e.when,
    samagri: e.samagri,
    steps: e.steps,
    notes: [...e.notes, ...(e.sources.length ? [`Sources: ${e.sources.join("; ")}`] : [])],
    learned: true,
  };
}

let ARTICLES: LearnedEntry[] = [];

export function registerArticles(entries: LearnedEntry[]): void {
  ARTICLES = entries.filter((e) => e.kind === "article");
}

export function getArticle(id: string): LearnedEntry | undefined {
  return ARTICLES.find((a) => a.id === id);
}
