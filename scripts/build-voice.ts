// Records every mantra Brahman recites with the natural Indian male voice, once, into public/voice/.
// Run with a voice key set (AZURE_SPEECH_KEY + AZURE_SPEECH_REGION, or GOOGLE_TTS_API_KEY):
//   npm run build:voice
// The recordings are then used everywhere — including the single-file beta and offline — with no key at runtime.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { allMantraTexts } from "../lib/mantra-texts.ts";
import { ttsProvider } from "../lib/tts.ts";

const dir = path.join(process.cwd(), "public", "voice");
const provider = ttsProvider();
if (!provider) {
  console.error("No voice service configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (or GOOGLE_TTS_API_KEY) and run again.");
  process.exit(1);
}
mkdirSync(dir, { recursive: true });
const manifestFile = path.join(dir, "manifest.json");
const manifest: Record<string, string> = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : {};
const texts = allMantraTexts();
let made = 0;
for (const text of texts) {
  const file = `${createHash("sha256").update(text).digest("hex").slice(0, 16)}.mp3`;
  if (manifest[text] === file && existsSync(path.join(dir, file))) continue;
  const audio = await provider.synthesize(text, "hi", "chant");
  writeFileSync(path.join(dir, file), Buffer.from(audio));
  manifest[text] = file;
  made++;
  process.stdout.write(`\r${made} recorded`);
}
// Drop recordings of mantras that are no longer in the app.
for (const key of Object.keys(manifest)) if (!texts.includes(key)) delete manifest[key];
writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
console.log(`\n${Object.keys(manifest).length} mantras recorded with ${provider.name} in public/voice/`);
