// Kokoro-82M Hindi synthesis, fully offline: eSpeak NG Hindi IPA → Kokoro tokens → ONNX → 24 kHz audio.
import ESpeakNg from "espeak-ng";
import ort from "onnxruntime-node";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(import.meta.url);
const vocab = JSON.parse(readFileSync(path.join(here, "vocab.json"), "utf8"));

let session;
async function model() {
  if (!session) {
    const dir = path.dirname(require.resolve("kokoro-q8-shards/package.json"));
    const parts = Array.from({ length: 6 }, (_, i) => readFileSync(path.join(dir, `kokoro-q8.part${i}.bin`)));
    session = await ort.InferenceSession.create(Buffer.concat(parts));
  }
  return session;
}

const styles = {};
const voice = (name) => (styles[name] ??= new Float32Array(readFileSync(path.join(here, "voices", `${name}.bin`)).buffer.slice(0)));

/** Devanagari → Hindi IPA, one line per clause. */
export async function hindiIpa(text) {
  const espeak = await ESpeakNg({
    arguments: ["--phonout", "out", "-q", "-b", "1", "--ipa", "-v", "hi", "-f", "in.txt"],
    preRun: [(m) => m.FS.writeFile("in.txt", text)],
  });
  return espeak.FS.readFile("out", { encoding: "utf8" });
}

/** One verse or sentence → Float32 samples at 24 kHz. A pause follows each danda. */
export async function speakHindi(text, { voiceName = "hm_omega", speed = 1 } = {}) {
  const clauses = text.split(/[।॥|]+/).map((c) => c.trim()).filter(Boolean);
  const pieces = [];
  const gap = new Float32Array(Math.round(24000 * (speed < 0.95 ? 0.55 : 0.3)));
  for (const clause of clauses) {
    const phon = (await hindiIpa(clause)).trim().split(/\n+/).map((l) => l.trim()).filter(Boolean).join(", ") + ".";
    const ids = [...phon].map((c) => vocab[c]).filter((x) => x !== undefined).slice(0, 508);
    if (!ids.length) continue;
    const s = await model();
    const style = voice(voiceName).slice(256 * ids.length, 256 * ids.length + 256);
    const out = await s.run({
      input_ids: new ort.Tensor("int64", BigInt64Array.from([0, ...ids, 0].map(BigInt)), [1, ids.length + 2]),
      style: new ort.Tensor("float32", style, [1, 256]),
      speed: new ort.Tensor("float32", [speed], [1]),
    });
    pieces.push(out[Object.keys(out)[0]].data, gap);
  }
  const total = pieces.reduce((n, p) => n + p.length, 0);
  const audio = new Float32Array(total);
  let o = 0;
  for (const p of pieces) {
    audio.set(p, o);
    o += p.length;
  }
  return audio;
}

export function wav(samples, rate = 24000) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return buf;
}
