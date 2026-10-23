// Brahman's voice. With a natural-voice service on the server (Azure or Google neural TTS) Brahman speaks with a
// human-like Indian male voice; otherwise the browser's built-in speech synthesis is used with a calm, deep delivery.
// Devanagari is spoken with a Hindi voice and English with an Indian-English voice.

export function speechSupported(): boolean {
  return typeof window !== "undefined" && ("speechSynthesis" in window || "Audio" in window);
}

export const DEVICE_VOICE_KEY = "brahman:device-voice";

// Male Indian voices shipped by common platforms (Edge's natural voices, Windows, macOS/iOS), preferred in order.
const PANDIT_VOICES = [/madhur.*(natural|online)/i, /prabhat.*(natural|online)/i, /madhur/i, /hemant/i, /prabhat/i, /rishi/i, /ravi/i];

function savedVoiceName(): string | null {
  try {
    return localStorage.getItem(DEVICE_VOICE_KEY);
  } catch {
    return null;
  }
}

/** Installed voices that can speak Hindi or Indian English, best first — for the voice picker. */
export function deviceVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices().filter((v) => /^(hi|sa|en-IN)/i.test(v.lang));
  const rank = (v: SpeechSynthesisVoice) => {
    const i = PANDIT_VOICES.findIndex((re) => re.test(v.name));
    return (i === -1 ? 50 : i) + (/natural|neural|online|enhanced|premium/i.test(v.name) ? -20 : 0) + (v.lang.startsWith("en") ? 100 : 0);
  };
  return voices.sort((a, b) => rank(a) - rank(b));
}

function pickVoice(lang: "hi" | "en"): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const wanted = lang === "hi" ? ["sa-IN", "hi-IN"] : ["en-IN"];
  const candidates = voices.filter((v) => wanted.includes(v.lang) || v.lang.startsWith(lang === "hi" ? "hi" : "en-IN"));
  const saved = savedVoiceName();
  const chosen = saved && candidates.find((c) => c.name === saved);
  if (chosen) return chosen;
  for (const re of PANDIT_VOICES) {
    const v = candidates.find((c) => re.test(c.name));
    if (v) return v;
  }
  return candidates.find((v) => /natural|neural|online|enhanced|premium/i.test(v.name)) ?? candidates.find((v) => /google/i.test(v.name)) ?? candidates[0] ?? (lang === "en" ? voices.find((v) => v.lang.startsWith("en")) : undefined);
}

interface Segment {
  text: string;
  lang: "hi" | "en";
}

/** Splits mixed text into Devanagari and Latin runs so each is spoken by the right voice. */
export function segments(text: string): Segment[] {
  const out: Segment[] = [];
  for (const part of text.match(/[ऀ-ॿ][ऀ-ॿ\s\d,.!?;:'"()\-–—]*|[^ऀ-ॿ]+/g) ?? []) {
    const clean = part.replace(/[॥।|]+/g, "। ").replace(/[*#_`>]/g, "").trim();
    if (!clean || !/[\p{L}\p{N}]/u.test(clean)) continue;
    const lang = /[ऀ-ॿ]/.test(clean) ? "hi" : "en";
    const last = out[out.length - 1];
    if (last && last.lang === lang) last.text += ` ${clean}`;
    else out.push({ text: clean, lang });
  }
  return out;
}

/** Sentence-sized pieces (at . ! ? and the danda) so speech has natural pauses and engines don't time out. */
export function chunks(text: string, max = 220): string[] {
  const out: string[] = [];
  for (const sentence of text.match(/[^.!?।]+(?:[.!?।]+|$)/g) ?? [text]) {
    const t = sentence.trim();
    if (!t) continue;
    const last = out[out.length - 1];
    if (last && last.length + t.length + 1 <= max) out[out.length - 1] = `${last} ${t}`;
    else if (t.length <= max) out.push(t);
    else out.push(...(t.match(new RegExp(`.{1,${max}}(?:\\s|$)`, "g")) ?? [t]).map((x) => x.trim()).filter(Boolean));
  }
  return out;
}

// --- Recorded mantras -------------------------------------------------------------

/** The text key a recording is stored under: the Devanagari, with whitespace normalised. */
export function mantraKey(devanagari: string): string {
  return devanagari.replace(/\s+/g, " ").trim();
}

/** Mantra-like Devanagari (Om, a double danda, svaha or namah) is chanted rather than spoken. */
export function isChant(text: string): boolean {
  return /ॐ|॥|स्वाहा|नमः|नमो/.test(text);
}

let recorded: Promise<Record<string, string>> | null = null;

/** Mantras recorded once with the natural voice (npm run build:voice): text → audio URL. */
function recordings(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return Promise.resolve({});
  recorded ??= (async () => {
    const embedded = (window as unknown as { __BRAHMAN_VOICE__?: Record<string, string> }).__BRAHMAN_VOICE__;
    if (embedded) return embedded;
    if (isStaticBuild()) return {};
    try {
      const r = await fetch("/voice/manifest.json");
      if (!r.ok) return {};
      const files = (await r.json()) as Record<string, string>;
      return Object.fromEntries(Object.entries(files).map(([k, f]) => [k, `/voice/${f}`]));
    } catch {
      return {};
    }
  })();
  return recorded;
}

// --- Natural voice (server neural TTS) ----------------------------------------------

let natural: Promise<boolean> | null = null;
const audioCache = new Map<string, Promise<string>>();

/** Whether the server offers the natural human-like voice. Checked once per page load. */
export function naturalVoiceAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || isStaticBuild()) return Promise.resolve(false);
  natural ??= fetch("/api/tts")
    .then((r) => (r.ok ? r.json() : { available: false }))
    .then((j: { available?: boolean }) => Boolean(j.available))
    .catch(() => false);
  return natural;
}

function naturalAudio(text: string, lang: "hi" | "en"): Promise<string> {
  const style = lang === "hi" && isChant(text) ? "chant" : "speech";
  const key = `${lang}:${style}:${text}`;
  let url = audioCache.get(key);
  if (!url) {
    url = fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, lang, style }) }).then(async (r) => {
      if (!r.ok) throw new Error(`tts ${r.status}`);
      return URL.createObjectURL(await r.blob());
    });
    url.catch(() => audioCache.delete(key));
    audioCache.set(key, url);
    if (audioCache.size > 300) audioCache.delete(audioCache.keys().next().value!);
  }
  return url;
}

let session = 0;
let currentAudio: HTMLAudioElement | null = null;

/**
 * Speaks a list of texts in order (each may mix scripts). Returns a function that stops speaking.
 * `onDone` runs once, when speech finishes or is stopped.
 */
export function speak(texts: string[], onDone?: () => void, onItem?: (index: number) => void): () => void {
  const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  synth?.cancel();
  currentAudio?.pause();
  const id = ++session;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    onDone?.();
  };
  type Item = { text: string; lang: "hi" | "en"; index: number; url?: string };
  let queue: Item[] = [];
  let i = 0;
  let useNatural = false;

  const playUrl = (url: string, onFail: () => void) => {
    if (id !== session) return finish();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => setTimeout(next, 150);
    audio.onerror = onFail;
    audio.play().catch(onFail);
  };

  const deviceSay = (item: Item) => {
    if (!synth) return next();
    const u = new SpeechSynthesisUtterance(item.text);
    const voice = pickVoice(item.lang);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? (item.lang === "hi" ? "hi-IN" : "en-IN");
    const chant = item.lang === "hi" && isChant(item.text);
    u.rate = chant ? 0.78 : item.lang === "hi" ? 0.88 : 0.92;
    u.pitch = chant ? 0.75 : 0.9;
    u.onend = () => setTimeout(next, item.lang === "hi" ? 180 : 120); // a breath between sentences
    u.onerror = () => finish();
    synth.speak(u);
  };

  const naturalSay = (item: Item) => {
    const ahead = queue[i];
    if (ahead) naturalAudio(ahead.text, ahead.lang).catch(() => {}); // prefetch the next sentence
    naturalAudio(item.text, item.lang)
      .then((url) => {
        playUrl(url, () => {
          useNatural = false;
          deviceSay(item);
        });
      })
      .catch(() => {
        // The natural voice failed (limit or network): carry on with the device voice.
        useNatural = false;
        if (id === session) deviceSay(item);
      });
  };

  const next = () => {
    if (id !== session) return finish();
    if (i >= queue.length) return finish();
    const item = queue[i++];
    onItem?.(item.index);
    if (item.url) {
      const recordedItem = item;
      // A recorded mantra; if it cannot play, say it with the natural or device voice instead.
      playUrl(item.url, () => (useNatural ? naturalSay({ ...recordedItem, url: undefined }) : deviceSay(recordedItem)));
    } else if (useNatural) naturalSay(item);
    else deviceSay(item);
  };

  Promise.all([naturalVoiceAvailable(), recordings()]).then(([ok, rec]) => {
    useNatural = ok;
    // A whole katha telling may be recorded as one file.
    const whole = texts.length > 1 ? rec[mantraKey(texts.join(" "))] : undefined;
    queue = whole ? [{ text: mantraKey(texts.join(" ")), lang: "hi" as const, index: 0, url: whole }] : texts.flatMap((t, index) => {
      const url = rec[mantraKey(t)];
      if (url) return [{ text: mantraKey(t), lang: "hi" as const, index, url }];
      return segments(t).flatMap((s) => chunks(s.text, s.lang === "hi" ? 260 : 300).map((text) => ({ text, lang: s.lang, index })));
    });
    next();
  });
  return () => {
    session++;
    synth?.cancel();
    currentAudio?.pause();
    finish();
  };
}

/** Recites a mantra `times` times, reporting each completed repetition. */
export function recite(mantra: string, times: number, onProgress?: (done: number) => void, onEnd?: () => void): () => void {
  let done = 0;
  return speak(Array(times).fill(mantra), onEnd, (index) => {
    if (index > done) {
      done = index;
      onProgress?.(done);
    }
  });
}

// --- Listening ---------------------------------------------------------------------

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

/** True in the single-file beta, which runs without the server (no AI, no shared knowledge, no microphone). */
export function isStaticBuild(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __BRAHMAN_STATIC__?: boolean }).__BRAHMAN_STATIC__);
}

export function listeningSupported(): boolean {
  if (typeof window === "undefined") return false;
  // The hosted beta runs in a frame without microphone access.
  if (isStaticBuild()) return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

/** Listens once. `lang` "hi-IN" understands Hindi and Hinglish; "en-IN" Indian English. */
export function listen(
  lang: string,
  onText: (text: string, final: boolean) => void,
  onEnd: (error?: string) => void,
): () => void {
  const w = window as unknown as Record<string, new () => Recognition>;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  let error: string | undefined;
  rec.onresult = (e) => {
    let text = "";
    let final = false;
    for (let i = 0; i < e.results.length; i++) {
      text += e.results[i][0].transcript;
      final = e.results[i].isFinal;
    }
    onText(text, final);
  };
  rec.onerror = (e) => {
    error = e.error;
  };
  rec.onend = () => onEnd(error);
  rec.start();
  return () => rec.stop();
}
