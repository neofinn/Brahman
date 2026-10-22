"use client";

import { useEffect, useRef, useState } from "react";
import type { Kriya } from "@/lib/ritual-common";
import { speak, speechSupported } from "@/lib/speech";
import { stepSpeech } from "@/lib/voice";
import { MantraBlock } from "./MantraBlock";
import { AbroadBlock } from "./AbroadBlock";
import { SankalpaBlock, TarpanBlock } from "./SankalpaBlock";

const CATEGORY_LABEL: Record<Kriya["category"], string> = {
  puja: "Puja", hawan: "Hawan", shanti: "Shanti", vrat: "Vrat", samskara: "Samskara", path: "Path",
};

/** Personal mantras for a step: the sankalpa (with name, gotra, father's name) and named tarpan offerings. */
function PersonalBlock({ kriya, title }: { kriya: Kriya; title: string }) {
  if (/sankalpa/i.test(title) && !kriya.learned) return <SankalpaBlock ritualId={kriya.id} />;
  if (/^tarpana$/i.test(title)) return <TarpanBlock />;
  return null;
}

/** A complete ritual: overview, samagri checklist and the vidhi, either as a list or performed step by step. */
export function RitualGuide({ kriya, compact = false, voice = false }: { kriya: Kriya; compact?: boolean; voice?: boolean }) {
  const [mode, setMode] = useState<"list" | "guided">("list");
  const [step, setStep] = useState(0);
  const [have, setHave] = useState<Set<number>>(new Set());
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const current = kriya.steps[step];

  const narrate = (index: number) => {
    stopRef.current?.();
    setSpeaking(true);
    stopRef.current = speak(stepSpeech(kriya.steps[index], index), () => setSpeaking(false));
  };

  useEffect(() => setCanSpeak(speechSupported()), []);
  // With Brahman's voice on, each step is read out as you reach it.
  useEffect(() => {
    if (mode === "guided" && voice && speechSupported()) narrate(step);
    return () => stopRef.current?.();
  }, [mode, step, voice]);

  const toggle = (i: number) => {
    const next = new Set(have);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setHave(next);
  };

  return (
    <div className="ritual">
      {compact && (
        <>
          <span className="deva tag">{kriya.devanagari}</span> <span className="tag">{CATEGORY_LABEL[kriya.category]}</span>
          {kriya.learned && <span className="tag learned" title="Learned through an AI search and added to Brahman's knowledge">✨ Learned</span>}
          <h2 style={{ margin: "8px 0 4px" }}>{kriya.title}</h2>
          <p style={{ marginTop: 0 }}>{kriya.summary}</p>
        </>
      )}
      <div className="facts">
        <div><strong>When:</strong> {kriya.when}</div>
        {kriya.duration && <div><strong>Duration:</strong> {kriya.duration}</div>}
        {kriya.purohit && <div><strong>Purohit:</strong> {kriya.purohit}</div>}
      </div>

      <h3>Samagri — what you will need ({have.size}/{kriya.samagri.length} ready)</h3>
      <ul className="checklist">
        {kriya.samagri.map((s, i) => (
          <li key={s}>
            <label>
              <input type="checkbox" checked={have.has(i)} onChange={() => toggle(i)} /> <span>{s}</span>
            </label>
          </li>
        ))}
      </ul>

      <AbroadBlock kriya={kriya} />

      <div className="vidhi-head">
        <h3>Vidhi — procedure ({kriya.steps.length} steps)</h3>
        <div className="segmented" role="tablist">
          <button type="button" className={mode === "list" ? "on" : ""} onClick={() => setMode("list")}>All steps</button>
          <button type="button" className={mode === "guided" ? "on" : ""} onClick={() => { setMode("guided"); setStep(0); }}>▶ Perform with me</button>
        </div>
      </div>

      {mode === "list" ? (
        <ol className="steps">
          {kriya.steps.map((s, i) => (
            <li key={i}>
              <h4>{i + 1}. {s.title}</h4>
              <p>{s.detail}</p>
              {s.mantra && <MantraBlock mantra={s.mantra} />}
              <PersonalBlock kriya={kriya} title={s.title} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="guided">
          <div className="progress"><div style={{ width: `${((step + 1) / kriya.steps.length) * 100}%` }} /></div>
          <div className="step-count">
            Step {step + 1} of {kriya.steps.length}
            {canSpeak && (
              <button type="button" className="chip" style={{ marginLeft: 8 }} onClick={() => (speaking ? stopRef.current?.() : narrate(step))}>
                {speaking ? "⏹ Stop" : "🔊 Speak this step"}
              </button>
            )}
          </div>
          <h4 className="guided-title">{current.title}</h4>
          <p>{current.detail}</p>
          {current.mantra && <MantraBlock key={step} mantra={current.mantra} />}
          <PersonalBlock kriya={kriya} title={current.title} />
          <div className="guided-nav">
            <button type="button" className="btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous</button>
            {step < kriya.steps.length - 1 ? (
              <button type="button" className="btn" onClick={() => setStep(step + 1)}>Next step →</button>
            ) : (
              <button type="button" className="btn" onClick={() => setMode("list")}>🙏 Complete</button>
            )}
          </div>
        </div>
      )}
      {kriya.notes && (
        <div className="notes">
          {kriya.notes.map((n) => <p key={n}>ℹ️ {n}</p>)}
        </div>
      )}
    </div>
  );
}
