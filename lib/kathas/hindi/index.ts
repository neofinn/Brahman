// Hindi narrations of the katha library, told as a kathavachak tells them.
import type { KathaHindi } from "../types.ts";
import { HINDI_GRANTHS_A } from "./granths-a.ts";
import { HINDI_GRANTHS_B } from "./granths-b.ts";
import { HINDI_STORIES_A } from "./stories-a.ts";
import { HINDI_STORIES_B } from "./stories-b.ts";

export const HINDI: Record<string, KathaHindi> = { ...HINDI_GRANTHS_A, ...HINDI_GRANTHS_B, ...HINDI_STORIES_A, ...HINDI_STORIES_B };
