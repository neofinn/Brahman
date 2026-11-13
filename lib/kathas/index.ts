// The Katha library: granths and the stories within them.
import { GRANTHS } from "./granths.ts";
import { STORIES } from "./stories.ts";
import { HINDI } from "./hindi/index.ts";
import type { Katha, KathaHindi } from "./types.ts";

export type { Katha, KathaHindi, KathaPart } from "./types.ts";

export const KATHAS: Katha[] = [...GRANTHS, ...STORIES];

export function getKatha(id: string): Katha | undefined {
  return KATHAS.find((k) => k.id === id);
}

/** The Hindi telling of a katha, if there is one. */
export function getKathaHindi(id: string): KathaHindi | undefined {
  return HINDI[id];
}
