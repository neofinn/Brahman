"use client";

import { useEffect, useState } from "react";
import { DEVICE_VOICE_KEY, deviceVoices, naturalVoiceAvailable, speak } from "@/lib/speech";

const SAMPLE = "जय श्री राम। भक्तों, आइए आज भगवान की कथा सुनते हैं। ॐ नमः शिवाय।";

/** Shows which voice Brahman uses and lets the listener choose among the voices on their device. */
export function VoiceSettings() {
  const [natural, setNatural] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<{ name: string; lang: string }[]>([]);
  const [chosen, setChosen] = useState("");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    naturalVoiceAvailable().then(setNatural);
    try {
      setChosen(localStorage.getItem(DEVICE_VOICE_KEY) ?? "");
    } catch {}
    const load = () => setVoices(deviceVoices().map((v) => ({ name: v.name, lang: v.lang })));
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);

  const choose = (name: string) => {
    setChosen(name);
    try {
      if (name) localStorage.setItem(DEVICE_VOICE_KEY, name);
      else localStorage.removeItem(DEVICE_VOICE_KEY);
    } catch {}
  };

  return (
    <div className="card voice-settings">
      <h3 style={{ marginTop: 0 }}>Brahman&apos;s voice</h3>
      {natural ? (
        <p className="good">✓ Natural voice is on — Brahman speaks with a human-like Indian male voice (Hindi and Indian English).</p>
      ) : (
        <p className="sub">
          Brahman is using your device&apos;s voice. For the most natural Hindi male voice, use Microsoft Edge (its &quot;Madhur Online
          (Natural)&quot; voice is chosen automatically) or install a Hindi voice in your phone&apos;s text-to-speech settings. The site
          owner can also switch on the natural voice for everyone.
        </p>
      )}
      {!natural && voices.length > 0 && (
        <label>
          Device voice
          <select value={chosen} onChange={(e) => choose(e.target.value)}>
            <option value="">Automatic (best Hindi male voice)</option>
            {voices.map((v) => <option key={v.name} value={v.name}>{v.name} — {v.lang}</option>)}
          </select>
        </label>
      )}
      <p>
        <button type="button" className="chip" onClick={() => { setPlaying(true); speak([SAMPLE], () => setPlaying(false)); }} disabled={playing}>
          {playing ? "Speaking…" : "🔊 Hear a sample"}
        </button>
      </p>
    </div>
  );
}
