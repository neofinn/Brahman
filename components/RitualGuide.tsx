"use client";

import { useState } from "react";
import type { Kriya } from "@/lib/ritual-common";
import { MantraBlock } from "./MantraBlock";

const CATEGORY_LABEL: Record<Kriya["category"], string> = {
  puja: "Puja", hawan: "Hawan", shanti: "Shanti", vrat: "Vrat", samskara: "Samskara", path: "Path",
};

/** A complete ritual: overview, samagri checklist and the vidhi, either as a list or performed step by step. */
export function RitualGuide({ kriya, compact = false }: { kriya: Kriya; compact?: boolean }) {
  const [mode, setMode] = useState<"list" | "guided">("list");
  const [step, setStep] = useState(0);
  const [have, setHave] = useState<Set<number>>(new Set());
  const current = kriya.steps[step];

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
            </li>
          ))}
        </ol>
      ) : (
        <div className="guided">
          <div className="progress"><div style={{ width: `${((step + 1) / kriya.steps.length) * 100}%` }} /></div>
          <div className="step-count">Step {step + 1} of {kriya.steps.length}</div>
          <h4 className="guided-title">{current.title}</h4>
          <p>{current.detail}</p>
          {current.mantra && <MantraBlock key={step} mantra={current.mantra} />}
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
