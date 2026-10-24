// Server-side store for learned knowledge: a JSON file shared by every user of this server.
// Set KNOWLEDGE_FILE to choose where it lives (it must be on persistent disk).
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LearnedEntry } from "./learned.ts";

// turbopackIgnore keeps the bundler from tracing the whole project into the server output.
const FILE = process.env.KNOWLEDGE_FILE ?? path.join(/* turbopackIgnore: true */ process.cwd(), "data", "learned-knowledge.json");
const MAX_ENTRIES = 5000;

let queue: Promise<unknown> = Promise.resolve();
/** Serialises writes so concurrent requests do not lose entries. */
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export async function listLearned(): Promise<LearnedEntry[]> {
  try {
    const data = JSON.parse(await readFile(FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function save(entries: LearnedEntry[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(entries, null, 2));
  await rename(tmp, FILE);
}

export function addLearned(entry: LearnedEntry): Promise<LearnedEntry> {
  return exclusive(async () => {
    const entries = await listLearned();
    if (entries.length >= MAX_ENTRIES) throw new Error("The knowledge store is full.");
    let id = entry.id;
    for (let n = 2; entries.some((e) => e.id === id); n++) id = `${entry.id}-${n}`;
    const saved = { ...entry, id };
    await save([...entries, saved]);
    return saved;
  });
}

export function removeLearned(id: string): Promise<boolean> {
  return exclusive(async () => {
    const entries = await listLearned();
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return false;
    await save(next);
    return true;
  });
}
