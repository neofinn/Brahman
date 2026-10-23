// Records every mantra Brahman recites with the offline Kokoro Hindi male voice into public/voice/ (no key, no network).
// Usage: npm run build:voice:offline [-- --voice hm_psi] [-- --kathas]   (--kathas also records every Hindi katha)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { speakHindi, wav } from "./kokoro.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const voiceName = process.argv.includes("--voice") ? process.argv[process.argv.indexOf("--voice") + 1] : "hm_omega";
const withKathas = process.argv.includes("--kathas");
const list = (code) => JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "-e", code], { cwd: root, encoding: "utf8", maxBuffer: 64 << 20 }));
const mantras = list('import("./lib/mantra-texts.ts").then((m) => process.stdout.write(JSON.stringify(m.allMantraTexts())))');
const kathas = list('import("./lib/mantra-texts.ts").then((m) => process.stdout.write(JSON.stringify(m.allKathaTexts())))');
const chant = new Set(mantras);
const texts = [...mantras, ...(withKathas ? kathas.filter((t) => !chant.has(t)) : [])];
// Recordings of kathas from an earlier --kathas run are kept even when this run records only mantras.
const keep = new Set([...mantras, ...kathas]);

const dir = path.join(root, "public", "voice");
mkdirSync(dir, { recursive: true });
const manifestFile = path.join(dir, "manifest.json");
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : {};
const tmp = path.join(tmpdir(), "brahman-voice.wav");
let made = 0;
for (const text of texts) {
  const file = `${createHash("sha256").update(`kokoro:${voiceName}:${text}`).digest("hex").slice(0, 16)}.mp3`;
  if (manifest[text] === file && existsSync(path.join(dir, file))) continue;
  // Mantras are chanted, slower than the katha's storytelling pace.
  writeFileSync(tmp, wav(await speakHindi(text, { voiceName, speed: chant.has(text) ? 0.82 : 0.95 })));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", tmp, "-ac", "1", "-b:a", "40k", path.join(dir, file)]);
  if (manifest[text] && manifest[text] !== file) rmSync(path.join(dir, manifest[text]), { force: true });
  manifest[text] = file;
  made++;
  if (made % 10 === 0) {
    console.log(`${made} of ${texts.length} recorded…`);
    writeFileSync(manifestFile, JSON.stringify(manifest, null, 1)); // progress survives an interruption
  }
}
for (const key of Object.keys(manifest)) if (!keep.has(key)) delete manifest[key];
writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
console.log(`${Object.keys(manifest).length} texts recorded with Kokoro ${voiceName} in public/voice/`);
