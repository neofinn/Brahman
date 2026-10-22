// Katha library types: granths (with their parts), stories and vrat kathas, and texts recited in full.
import type { Mantra } from "../ritual-common.ts";

export interface KathaPart {
  title: string;
  summary: string;
  verse?: Mantra;
}

export interface Katha {
  id: string;
  title: string;
  devanagari: string;
  kind: "granth" | "katha" | "vrat-katha" | "path";
  keywords: string[];
  summary: string;
  source: string;
  /** When it is traditionally read or heard. */
  when?: string;
  /** The story itself, told in paragraphs (for kathas). */
  story?: string[];
  /** Chapters, kandas or skandhas (for granths). */
  partsLabel?: string;
  parts?: KathaPart[];
  keyVerses?: Mantra[];
  teachings?: string[];
  /** A text recited in full (e.g. Hanuman Chalisa), line by line. */
  fullText?: (Mantra & { label?: string })[];
  /** Ritual guide (lib/kriyas.ts) for conducting the path or katha. */
  vidhiId?: string;
  /** Other kathas in the library that belong to this one. */
  related?: string[];
}
