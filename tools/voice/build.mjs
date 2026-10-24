// Records Brahman's mantras (and, with --kathas, every Hindi katha telling) with the offline Kokoro Hindi male voice.
// Usage: npm run build:voice:offline [-- --kathas] [-- --voice hm_psi]
// Mantras go to public/voice/ one file each. Katha passages are recorded into tools/voice/cache/ and joined into one
// file per telling (each whole katha and each chapter) in public/voice/, which keeps the file count small.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { speakHindi, wav } from "./kokoro.mjs";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../..");
const voiceName = process.argv.includes("--voice") ? process.argv[process.argv.indexOf("--voice") + 1] : "hm_omega";
const withKathas = process.argv.includes("--kathas");
const fromLib = (expr) =>
  JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "-e", `import("./lib/mantra-texts.ts").then((m) => process.stdout.write(JSON.stringify(${expr})))`], { cwd: root, encoding: "utf8", maxBuffer: 64 << 20 }));
const mantras = fromLib("m.allMantraTexts()");
const tellings = fromLib("m.allKathaTellings().map((items) => ({ key: m.tellingKey(items), parts: items.map(m.mantraKey) }))");

const out = path.join(root, "public", "voice");
const cache = path.join(here, "cache");
mkdirSync(out, { recursive: true });
mkdirSync(cache, { recursive: true });
const load = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {});
const manifestFile = path.join(out, "manifest.json");
const cacheFile = path.join(cache, "manifest.json");
const manifest = load(manifestFile);
const cached = load(cacheFile);
const save = () => {
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
  writeFileSync(cacheFile, JSON.stringify(cached, null, 1));
};
const hash = (s) => createHash("sha256").update(`kokoro:${voiceName}:${s}`).digest("hex").slice(0, 16);
const tmp = path.join(tmpdir(), "brahman-voice.wav");
const chant = new Set(mantras);

async function record(text, file) {
  // Mantras are chanted, slower than the katha's storytelling pace.
  writeFileSync(tmp, wav(await speakHindi(text, { voiceName, speed: chant.has(text) ? 0.82 : 0.95 })));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", tmp, "-ac", "1", "-b:a", "40k", file]);
}

let made = 0;
const progress = () => {
  if (++made % 10 === 0) {
    console.log(`${made} recorded…`);
    save();
  }
};

for (const text of mantras) {
  const file = `${hash(text)}.mp3`;
  if (manifest[text] === file && existsSync(path.join(out, file))) continue;
  await record(text, path.join(out, file));
  manifest[text] = file;
  progress();
}

if (withKathas) {
  const passages = [...new Set(tellings.flatMap((t) => t.parts))];
  for (const text of passages) {
    if (chant.has(text)) continue; // a verse inside a telling reuses the mantra recording
    const file = `${hash(text)}.mp3`;
    if (cached[text] === file && existsSync(path.join(cache, file))) continue;
    await record(text, path.join(cache, file));
    cached[text] = file;
    progress();
  }
  // Join each telling's passages into one file.
  for (const { key, parts } of tellings) {
    const file = `${hash(key)}.mp3`;
    if (manifest[key] === file && existsSync(path.join(out, file))) continue;
    const sources = parts.map((p) => (chant.has(p) ? path.join(out, manifest[p]) : path.join(cache, cached[p])));
    const list = path.join(tmpdir(), "brahman-concat.txt");
    writeFileSync(list, sources.map((s) => `file '${s}'`).join("\n"));
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-ac", "1", "-b:a", "40k", path.join(out, file)]);
    manifest[key] = file;
  }
}

// Drop entries (and files) for texts that are no longer in the app; keep katha tellings unless they changed.
const keep = new Set([...mantras, ...tellings.map((t) => t.key)]);
for (const [key, file] of Object.entries(manifest)) {
  if (!keep.has(key)) {
    rmSync(path.join(out, file), { force: true });
    delete manifest[key];
  }
}
save();
console.log(`${Object.keys(manifest).length} recordings in public/voice/ (Kokoro ${voiceName})`);
