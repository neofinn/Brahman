"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getKatha, getKathaHindi } from "@/lib/kathas";
import { getKriya } from "@/lib/kriyas";
import { speak, speechSupported } from "@/lib/speech";
import { KATHA_LANG_KEY, kathaLang, kathaSpeech } from "@/lib/voice";
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
  const [lang, setLang] = useState<"hi" | "en">("hi");

  useEffect(() => {
    setLang(kathaLang());
    setCanSpeak(speechSupported());
    return () => stopRef.current?.();
  }, []);
  useEffect(() => {
    if (part) partRef.current?.scrollIntoView({ block: "nearest" });
  }, [part]);

  if (!k) return <p>This katha is not in the library.</p>;
  const vidhi = k.vidhiId ? getKriya(k.vidhiId) : undefined;
  const hindi = getKathaHindi(k.id);
  const hi = lang === "hi" && hindi ? hindi : undefined;
  const changeLang = (l: "hi" | "en") => {
    stopRef.current?.();
    setLang(l);
    try {
      localStorage.setItem(KATHA_LANG_KEY, l);
    } catch {}
  };
  const story = hi?.story ?? k.story;
  const partText = (i: number) => hi?.parts?.[i] ?? k.parts![i];
  const teachings = hi?.teachings ?? k.teachings;

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
      {hindi && (
        <span className="segmented" role="group" aria-label="Katha language" style={{ marginLeft: 8 }}>
          <button type="button" className={lang === "hi" ? "on" : ""} onClick={() => changeLang("hi")}>हिंदी</button>
          <button type="button" className={lang === "en" ? "on" : ""} onClick={() => changeLang("en")}>English</button>
        </span>
      )}
      {compact ? <h2 style={{ margin: "8px 0 4px" }}>{hi?.title ?? k.title}</h2> : hi ? <h2 className="deva" style={{ margin: "8px 0 4px" }}>{hi.title}</h2> : null}
      <p style={{ marginTop: compact ? 0 : 8 }} className={hi ? "deva katha-hi" : undefined}>{hi?.summary ?? k.summary}</p>
      <div className="facts">
        <div><strong>Source:</strong> {k.source}</div>
        {k.when && <div><strong>When it is heard:</strong> {k.when}</div>}
      </div>

      {canSpeak && (k.story || k.parts) && (
        <p>
          <button type="button" className="btn" onClick={() => toggle("katha", kathaSpeech(k.id, undefined, lang))}>
            {speaking === "katha" ? (hi ? "⏹ रोकिए" : "⏹ Stop") : hi ? (k.story ? "🔊 कथा सुनिए" : "🔊 परिचय सुनिए") : k.story ? "🔊 Listen to the katha" : "🔊 Listen to the overview"}
          </button>
        </p>
      )}

      {hi?.opening && <p className="deva katha-hi jaikara">{hi.opening}</p>}

      {story && (
        <section>
          <h3>{hi ? "कथा" : "The katha"}</h3>
          {story.map((p) => <p key={p.slice(0, 30)} className={hi ? "deva katha-hi" : undefined}>{p}</p>)}
        </section>
      )}

      {k.parts && (
        <section>
          <h3>{k.partsLabel ?? "Parts"}</h3>
          <ol className="parts">
            {k.parts.map((p, i) => (
              <li key={p.title} ref={part === i + 1 ? partRef : undefined} className={open === i ? "open" : ""}>
                <button type="button" className="part-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <span className={hi ? "deva" : undefined}>{partText(i).title}</span>
                  <span aria-hidden>{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <div className="part-body">
                    <p className={hi ? "deva katha-hi" : undefined}>{partText(i).summary}</p>
                    {p.verse && <MantraBlock mantra={p.verse} />}
                    {canSpeak && (
                      <button type="button" className="chip" onClick={() => toggle(`part-${i}`, kathaSpeech(k.id, i + 1, lang))}>
                        {speaking === `part-${i}` ? (hi ? "⏹ रोकिए" : "⏹ Stop") : hi ? "🔊 सुनिए" : "🔊 Listen"}
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

      {teachings && (
        <section>
          <h3>{hi ? "सीख" : "Teachings"}</h3>
          <ul>{teachings.map((t) => <li key={t} className={hi ? "deva katha-hi" : undefined}>{t}</li>)}</ul>
        </section>
      )}

      {hi?.closing && <p className="deva katha-hi jaikara">{hi.closing}</p>}

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
