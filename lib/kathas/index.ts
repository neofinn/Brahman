// The Katha library: granths and the stories within them.
import { GRANTHS } from "./granths.ts";
import { STORIES } from "./stories.ts";
import type { Katha } from "./types.ts";

export type { Katha, KathaPart } from "./types.ts";

export const KATHAS: Katha[] = [...GRANTHS, ...STORIES];

export function getKatha(id: string): Katha | undefined {
  return KATHAS.find((k) => k.id === id);
}
