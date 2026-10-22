// Mantra recitation through the browser's built-in speech synthesis (works offline where voices are installed).

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "sa-IN") ??
    voices.find((v) => v.lang === "hi-IN" && /google|natural|neural/i.test(v.name)) ??
    voices.find((v) => v.lang === "hi-IN") ??
    voices.find((v) => v.lang.startsWith("hi")) ??
    voices.find((v) => v.lang === "en-IN")
  );
}

/** Speaks `text` `times` times. Returns a function that stops recitation. */
export function recite(text: string, times: number, onProgress?: (done: number) => void, onEnd?: () => void): () => void {
  const synth = window.speechSynthesis;
  synth.cancel();
  let cancelled = false;
  let done = 0;
  // Danda punctuation reads better as pauses.
  const spoken = text.replace(/[॥।|]+/g, ", ");
  const next = () => {
    if (cancelled) return;
    if (done >= times) {
      onEnd?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(spoken);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "hi-IN";
    u.rate = 0.8;
    u.onend = () => {
      done += 1;
      onProgress?.(done);
      next();
    };
    u.onerror = () => {
      if (!cancelled) onEnd?.();
    };
    synth.speak(u);
  };
  next();
  return () => {
    cancelled = true;
    synth.cancel();
    onEnd?.();
  };
}
