// Brahman's voice: the browser's built-in speech synthesis, with a calm, deep "pandit" delivery.
// Devanagari is spoken with a Hindi voice and English with an Indian-English voice.

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Male Indian voices shipped by common platforms (Windows, macOS/iOS, Android/Chrome), preferred in order.
const PANDIT_VOICES = [/madhur/i, /hemant/i, /prabhat/i, /rishi/i, /ravi/i, /kalpana/i];

function pickVoice(lang: "hi" | "en"): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const wanted = lang === "hi" ? ["sa-IN", "hi-IN"] : ["en-IN"];
  const candidates = voices.filter((v) => wanted.includes(v.lang) || v.lang.startsWith(lang === "hi" ? "hi" : "en-IN"));
  for (const re of PANDIT_VOICES) {
    const v = candidates.find((c) => re.test(c.name));
    if (v) return v;
  }
  return candidates.find((v) => /google|natural|neural/i.test(v.name)) ?? candidates[0] ?? (lang === "en" ? voices.find((v) => v.lang.startsWith("en")) : undefined);
}

interface Segment {
  text: string;
  lang: "hi" | "en";
}

/** Splits mixed text into Devanagari and Latin runs so each is spoken by the right voice. */
export function segments(text: string): Segment[] {
  const out: Segment[] = [];
  for (const part of text.match(/[ऀ-ॿ][ऀ-ॿ\s\d,.!?;:'"()\-–—]*|[^ऀ-ॿ]+/g) ?? []) {
    const clean = part.replace(/[॥।|]+/g, ", ").replace(/[*#_`>]/g, "").trim();
    if (!clean || !/[\p{L}\p{N}]/u.test(clean)) continue;
    const lang = /[ऀ-ॿ]/.test(clean) ? "hi" : "en";
    const last = out[out.length - 1];
    if (last && last.lang === lang) last.text += ` ${clean}`;
    else out.push({ text: clean, lang });
  }
  return out;
}

let session = 0;

/**
 * Speaks a list of texts in order (each may mix scripts). Returns a function that stops speaking.
 * `onDone` runs once, when speech finishes or is stopped.
 */
export function speak(texts: string[], onDone?: () => void, onItem?: (index: number) => void): () => void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const id = ++session;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    onDone?.();
  };
  const queue = texts.flatMap((t, index) => segments(t).map((s) => ({ ...s, index })));
  let i = 0;
  const next = () => {
    if (id !== session) return finish();
    if (i >= queue.length) return finish();
    const { text, lang, index } = queue[i++];
    onItem?.(index);
    // Long passages are split at sentence ends: some engines stop speaking after ~15 seconds.
    const chunks = text.match(/[^.!?]{1,220}(?:[.!?]+|$)/g) ?? [text];
    let c = 0;
    const sayChunk = () => {
      if (id !== session) return finish();
      if (c >= chunks.length) return next();
      const u = new SpeechSynthesisUtterance(chunks[c++]);
      const voice = pickVoice(lang);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? (lang === "hi" ? "hi-IN" : "en-IN");
      u.rate = lang === "hi" ? 0.8 : 0.92;
      u.pitch = 0.85;
      u.onend = sayChunk;
      u.onerror = () => finish();
      synth.speak(u);
    };
    sayChunk();
  };
  next();
  return () => {
    session++;
    synth.cancel();
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
