"use client";

import { useEffect, useRef, useState } from "react";
import { getKatha } from "@/lib/kathas";
import { getKriya } from "@/lib/kriyas";
import { speak, speechSupported } from "@/lib/speech";
import { CRISIS_TEXT, EMERGENCY_TEXT, personalise, supportWords, type Relation } from "@/lib/support";
import { MantraBlock } from "./MantraBlock";

/** Brahman's answer to a feeling or life moment: comfort, a prayer offered on the person's behalf, mantras and guidance. */
export function SupportCard({
  card,
  onRitual,
  onKatha,
}: {
  card: { id: string; relation?: Relation; when?: "today" | "tomorrow" | "tonight"; seed: string };
  onRitual: (id: string) => void;
  onKatha: (id: string) => void;
}) {
  const words = supportWords(card);
  const [praying, setPraying] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    setCanSpeak(speechSupported());
    return () => stopRef.current?.();
  }, []);
  if (!words) return null;
  const { situation: s, comfort, prayer } = words;
  const katha = s.kathaId ? getKatha(s.kathaId) : undefined;
  const ritual = s.ritualId ? getKriya(s.ritualId) : undefined;

  const pray = () => {
    if (praying) return stopRef.current?.();
    setPraying(true);
    stopRef.current = speak([prayer, s.mantras[0].devanagari], () => setPraying(false));
  };

  return (
    <div className="support">
      <p className="comfort">{comfort}</p>
      <div className="prayer">
        <div className="mantra-title">🙏 Brahman&apos;s prayer for {card.relation ? card.relation.who : "you"}</div>
        <p>{prayer}</p>
        {canSpeak && (
          <button type="button" className="chip" onClick={pray}>{praying ? "⏹ Stop" : "🔊 Pray aloud with me"}</button>
        )}
      </div>
      <h3>Chant — {s.deity}</h3>
      {s.mantras.map((m) => <MantraBlock key={m.devanagari} title={m.title} mantra={m} />)}
      <h3>Words of strength</h3>
      <MantraBlock mantra={s.verse} />
      <h3>{card.relation ? "What you can do" : "What to do"}</h3>
      <ul className="support-steps">
        {s.steps.map((step) => <li key={step}>{personalise(step, card)}</li>)}
      </ul>
      {(katha || ritual) && (
        <div className="chips">
          {katha && <button type="button" className="chip" onClick={() => onKatha(katha.id)}>📖 Katha: {katha.title.split(/[—(]/)[0].trim()}</button>}
          {ritual && <button type="button" className="chip" onClick={() => onRitual(ritual.id)}>🪔 {ritual.title}</button>}
        </div>
      )}
    </div>
  );
}

export function CrisisCard({ kind }: { kind: "crisis" | "emergency" }) {
  const lines = kind === "crisis" ? CRISIS_TEXT : EMERGENCY_TEXT;
  return (
    <div className="crisis" role="alert">
      {lines.map((l) => <p key={l}>{l}</p>)}
      <div className="chips">
        {kind === "crisis" ? (
          <>
            <a className="btn" href="tel:14416">📞 Call Tele-MANAS 14416</a>
            <a className="btn secondary" href="tel:112">Emergency 112</a>
          </>
        ) : (
          <>
            <a className="btn" href="tel:112">📞 Call 112</a>
            <a className="btn secondary" href="tel:108">Ambulance 108</a>
          </>
        )}
      </div>
    </div>
  );
}
