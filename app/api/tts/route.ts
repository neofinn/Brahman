import { createHash } from "node:crypto";
import { ttsProvider, type TtsLang, type TtsStyle } from "@/lib/tts";

export const runtime = "nodejs";

const MAX_CHARS = 1200;
const PER_MINUTE = 60;
const DAILY_CHARS = Number(process.env.TTS_DAILY_CHAR_LIMIT ?? 300000);
const CACHE_MAX = 500;

// Mantras and kathas repeat, so recent audio is kept in memory; repeats cost nothing.
const cache = new Map<string, ArrayBuffer>();
const recent = new Map<string, number[]>();
let daily = { day: "", chars: 0 };

/** Lets the client know whether the natural voice is configured. */
export function GET() {
  const p = ttsProvider();
  return Response.json({ available: Boolean(p), provider: p?.name ?? null });
}

export async function POST(req: Request) {
  const provider = ttsProvider();
  if (!provider) return Response.json({ error: "Natural voice is not configured." }, { status: 503 });
  let body: { text?: unknown; lang?: unknown; style?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const lang: TtsLang = body.lang === "en" ? "en" : "hi";
  const style: TtsStyle = body.style === "chant" ? "chant" : "speech";
  if (!text || text.length > MAX_CHARS) return Response.json({ error: "Text is empty or too long." }, { status: 400 });

  const key = createHash("sha256").update(`${provider.name}:${lang}:${style}:${text}`).digest("hex");
  let audio = cache.get(key);
  if (!audio) {
    const client = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const now = Date.now();
    const times = (recent.get(client) ?? []).filter((t) => now - t < 60000);
    const today = new Date().toISOString().slice(0, 10);
    if (daily.day !== today) daily = { day: today, chars: 0 };
    if (times.length >= PER_MINUTE || daily.chars + text.length > DAILY_CHARS) {
      return Response.json({ error: "Voice limit reached; using the device voice." }, { status: 429 });
    }
    recent.set(client, [...times, now]);
    daily.chars += text.length;
    try {
      audio = await provider.synthesize(text, lang, style);
    } catch (err) {
      console.error("Brahman TTS error:", err);
      return Response.json({ error: "Voice service unavailable." }, { status: 502 });
    }
    cache.set(key, audio);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!);
  }
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000, immutable" } });
}
