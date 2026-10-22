"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getKatha } from "@/lib/kathas";
import { getKriya } from "@/lib/kriyas";
import { speak, speechSupported } from "@/lib/speech";
import { kathaSpeech } from "@/lib/voice";
import { MantraBlock } from "./MantraBlock";
import { RitualGuide } from "./RitualGuide";

const KIND_LABEL = { granth: "Granth", katha: "Katha", "vrat-katha": "Vrat Katha", path: "Path" } as const;

/** A katha or granth: the story (told aloud on request), its parts, key verses, full text and path vidhi. */
export function KathaView({
  id,
  part,
  compact = false,
  voice = false,
  onKatha,
}: {
  id: string;
  part?: number;
  compact?: boolean;
  voice?: boolean;
  onKatha?: (id: string) => void;
}) {
  const k = getKatha(id);
  const [open, setOpen] = useState<number | null>(part ? part - 1 : null);
  const [showVidhi, setShowVidhi] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [line, setLine] = useState<number | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const partRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    setCanSpeak(speechSupported());
    return () => stopRef.current?.();
  }, []);
  useEffect(() => {
    if (part) partRef.current?.scrollIntoView({ block: "nearest" });
  }, [part]);

  if (!k) return <p>This katha is not in the library.</p>;
  const vidhi = k.vidhiId ? getKriya(k.vidhiId) : undefined;

  const say = (key: string, texts: string[], onLine?: (i: number) => void) => {
    stopRef.current?.();
    setSpeaking(key);
    stopRef.current = speak(texts, () => {
      setSpeaking(null);
      setLine(null);
    }, onLine);
  };
  const toggle = (key: string, texts: string[], onLine?: (i: number) => void) =>
    speaking === key ? stopRef.current?.() : say(key, texts, onLine);

  return (
    <div className="katha">
      <span className="deva tag">{k.devanagari}</span> <span className="tag">{KIND_LABEL[k.kind]}</span>
      {compact ? <h2 style={{ margin: "8px 0 4px" }}>{k.title}</h2> : null}
      <p style={{ marginTop: compact ? 0 : 8 }}>{k.summary}</p>
      <div className="facts">
        <div><strong>Source:</strong> {k.source}</div>
        {k.when && <div><strong>When it is heard:</strong> {k.when}</div>}
      </div>

      {canSpeak && (k.story || k.parts) && (
        <p>
          <button type="button" className="btn" onClick={() => toggle("katha", kathaSpeech(k.id))}>
            {speaking === "katha" ? "⏹ Stop" : k.story ? "🔊 Listen to the katha" : "🔊 Listen to the overview"}
          </button>
        </p>
      )}

      {k.story && (
        <section>
          <h3>The katha</h3>
          {k.story.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}
        </section>
      )}

      {k.parts && (
        <section>
          <h3>{k.partsLabel ?? "Parts"}</h3>
          <ol className="parts">
            {k.parts.map((p, i) => (
              <li key={p.title} ref={part === i + 1 ? partRef : undefined} className={open === i ? "open" : ""}>
                <button type="button" className="part-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <span>{p.title}</span>
                  <span aria-hidden>{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <div className="part-body">
                    <p>{p.summary}</p>
                    {p.verse && <MantraBlock mantra={p.verse} />}
                    {canSpeak && (
                      <button type="button" className="chip" onClick={() => toggle(`part-${i}`, kathaSpeech(k.id, i + 1))}>
                        {speaking === `part-${i}` ? "⏹ Stop" : "🔊 Listen"}
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {k.fullText && (
        <section>
          <div className="vidhi-head">
            <h3>Path — full text</h3>
            {canSpeak && (
              <button
                type="button"
                className="btn"
                onClick={() => toggle("full", k.fullText!.map((l) => l.devanagari), (i) => setLine(i))}
              >
                {speaking === "full" ? "⏹ Stop" : "🔊 Recite the whole path"}
              </button>
            )}
          </div>
          <ol className="fulltext">
            {k.fullText.map((l, i) => (
              <li key={i} className={line === i ? "current" : ""}>
                {l.label && <div className="mantra-title">{l.label}</div>}
                <div className="deva">{l.devanagari}</div>
                <div className="iast">{l.iast}</div>
                <div className="meaning">{l.meaning}</div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {k.keyVerses && k.keyVerses.length > 0 && (
        <section>
          <h3>Key verses</h3>
          {k.keyVerses.map((m) => <MantraBlock key={m.devanagari} mantra={m} />)}
        </section>
      )}

      {k.teachings && (
        <section>
          <h3>Teachings</h3>
          <ul>{k.teachings.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      )}

      {vidhi && (
        <section>
          <div className="vidhi-head">
            <h3>How to do the path / katha</h3>
            <button type="button" className="chip" onClick={() => setShowVidhi(!showVidhi)}>
              {showVidhi ? "Hide vidhi" : `Show ${vidhi.title}`}
            </button>
          </div>
          {showVidhi && <div className="card" style={{ marginTop: 8 }}><RitualGuide kriya={vidhi} compact voice={voice} /></div>}
        </section>
      )}

      {k.related && k.related.length > 0 && (
        <section>
          <h3>Related kathas</h3>
          <div className="chips">
            {k.related.map((rid) => {
              const r = getKatha(rid);
              if (!r) return null;
              const label = r.title.split(/[—(]/)[0].trim();
              return onKatha ? (
                <button key={rid} type="button" className="chip" onClick={() => onKatha(rid)}>{label}</button>
              ) : (
                <Link key={rid} className="chip" href={`/katha/${rid}`}>{label}</Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
