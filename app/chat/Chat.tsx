"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { RitualGuide } from "@/components/RitualGuide";
import { GrahaCard } from "@/components/GrahaCard";
import { MantraBlock } from "@/components/MantraBlock";
import { KundliReport } from "@/components/KundliReport";
import { ArticleCard } from "@/components/ArticleCard";
import { KathaView } from "@/components/KathaView";
import { CrisisCard, SupportCard } from "@/components/SupportCard";
import { SankalpaBlock } from "@/components/SankalpaBlock";
import { getKatha } from "@/lib/kathas";
import { PanchangPanel } from "@/app/panchang/PanchangView";
import { useAiAvailable } from "@/components/useAi";
import { respond, setLearnedKnowledge, STARTER_SUGGESTIONS, type Card, type FinderState } from "@/lib/finder";
import { computeKundli } from "@/lib/jyotish";
import { getKriya } from "@/lib/kriyas";
import type { LearnedEntry } from "@/lib/learned";
import { KUNDLI_HANDOFF_KEY } from "@/lib/handoff";
import { isStaticBuild, listen, listeningSupported, speak, speechSupported } from "@/lib/speech";
import { speechForCard } from "@/lib/voice";
import { zonedToUtc } from "@/lib/time";

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; cards: Card[]; pending?: boolean }
  | { role: "assistant"; ai: string };

const STORAGE_KEY = "brahman:finder:v1";
const VOICE_KEY = "brahman:voice";
const LISTEN_LANG_KEY = "brahman:listen-lang";

function load(): { messages: Message[]; state: FinderState } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // A search that was cut off by a reload will not finish.
      saved.messages = saved.messages.filter((m: Message) => !("pending" in m && m.pending));
      return saved;
    }
  } catch {}
  return { messages: [], state: {} };
}

function KundliCard({ card, onRitual }: { card: Extract<Card, { type: "kundli" }>; onRitual: (id: string) => void }) {
  const kundli = useMemo(
    () => computeKundli(zonedToUtc(card.date, card.time, card.place.timeZone), card.place),
    [card.date, card.time, card.place],
  );
  return <KundliReport kundli={kundli} name={card.name} onRitual={onRitual} />;
}

function CardView({ card, voice, onRitual, onSend, onKatha }: { card: Card; voice: boolean; onRitual: (id: string) => void; onSend: (text: string) => void; onKatha: (id: string) => void }) {
  switch (card.type) {
    case "text":
      return <p className="card-text">{card.text}</p>;
    case "ritual": {
      const kriya = getKriya(card.id);
      return kriya ? <RitualGuide kriya={kriya} compact voice={voice} /> : <p>This entry is no longer in Brahman&apos;s knowledge.</p>;
    }
    case "ritualList":
      return (
        <div>
          <div className="sub">{card.title}:</div>
          <div className="chips">
            {card.ids.map((id) => (
              <button key={id} type="button" className="chip" onClick={() => onRitual(id)}>{getKriya(id)?.title ?? id}</button>
            ))}
          </div>
        </div>
      );
    case "graha":
      return <GrahaCard name={card.name} />;
    case "mantra":
      return (
        <div>
          <h3 style={{ margin: "0 0 6px" }}>{card.title}</h3>
          <MantraBlock mantra={card.mantra} />
        </div>
      );
    case "kundli":
      return <KundliCard card={card} onRitual={onRitual} />;
    case "panchang":
      return <PanchangPanel />;
    case "scripture":
      return (
        <div className="scripture">
          <span className="tag">{card.category}</span>
          <h3 style={{ margin: "6px 0 4px" }}>{card.name}</h3>
          <p style={{ margin: 0 }}>{card.description}</p>
          <Link href="/library" className="sub">Browse the scripture library →</Link>
        </div>
      );
    case "article":
      return <ArticleCard id={card.id} />;
    case "katha":
      return <KathaView id={card.id} part={card.part} compact voice={voice} onKatha={onKatha} />;
    case "support":
      return <SupportCard card={card} onRitual={onRitual} onKatha={onKatha} />;
    case "crisis":
      return <CrisisCard kind={card.kind} />;
    case "sankalpa":
      return (
        <div>
          <h3 style={{ margin: "0 0 6px" }}>Sankalpa{getKriya(card.ritualId) ? ` — ${getKriya(card.ritualId)!.title}` : ""}</h3>
          <p className="sub" style={{ marginTop: 0 }}>Hold water, akshata, a flower and a coin in your right hand, recite the sankalpa, then release the water into a plate.</p>
          <SankalpaBlock ritualId={card.ritualId} />
        </div>
      );
    case "suggestions":
      return (
        <div className="chips">
          {card.items.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => onSend(s)}>{s}</button>
          ))}
        </div>
      );
  }
}

export function Chat() {
  const router = useRouter();
  const params = useSearchParams();
  const ai = useAiAvailable();
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<FinderState>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const [listening, setListening] = useState(false);
  const [listenError, setListenError] = useState<string | null>(null);
  const [listenLang, setListenLang] = useState("hi-IN");
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [, setKnowledgeVersion] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const stopListenRef = useRef<(() => void) | null>(null);
  const initialised = useRef(false);
  const stateRef = useRef<FinderState>({});
  const voiceRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  const aiRef = useRef(false);
  stateRef.current = state;
  voiceRef.current = voice;
  aiRef.current = ai;

  const say = useCallback((cards: Card[], index: number) => {
    stopSpeechRef.current?.();
    const texts = cards.flatMap(speechForCard);
    if (!texts.length) return;
    setSpeakingIndex(index);
    stopSpeechRef.current = speak(texts, () => setSpeakingIndex((i) => (i === index ? null : i)));
  }, []);

  const learnKnowledge = useCallback((entries: LearnedEntry[]) => {
    setLearnedKnowledge(entries);
    setKnowledgeVersion((v) => v + 1);
  }, []);

  /** Searches with AI for something the granth does not cover, and adds what it learns to Brahman's knowledge. */
  const learn = useCallback(async (question: string, index: number) => {
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const finish = (cards: Card[]) => {
      setMessages((prev) => prev.map((m, i) => (i === index ? { role: "assistant", cards } : m)));
      if (voiceRef.current) say(cards, index);
    };
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "The search failed.");
      if (data.entries) learnKnowledge(data.entries);
      if (data.status === "known") {
        finish(data.cards);
      } else if (data.status === "learned" || data.status === "unsaved") {
        const entry = data.entry as LearnedEntry;
        finish([
          {
            type: "text",
            text: data.status === "learned"
              ? "✨ I searched the shastras and have added this to my knowledge — next time anyone asks, I will know it."
              : "✨ Here is what I found (it could not be saved to my knowledge this time).",
          },
          entry.kind === "ritual" ? { type: "ritual", id: entry.id } : { type: "article", id: entry.id },
        ]);
      } else {
        finish([{ type: "text", text: data.message ?? "🙏 I could not find an answer." }, { type: "suggestions", items: STARTER_SUGGESTIONS }]);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") finish([{ type: "text", text: "Search stopped." }]);
      else finish([{ type: "text", text: `⚠️ ${(err as Error).message}` }, { type: "suggestions", items: STARTER_SUGGESTIONS }]);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [learnKnowledge, say]);

  const send = useCallback((text: string) => {
    const content = text.trim();
    if (!content) return;
    stopSpeechRef.current?.();
    const reply = respond(content, stateRef.current);
    setState(reply.state);
    const searching = reply.unmatched && aiRef.current;
    const cards: Card[] = searching
      ? [{ type: "text", text: "🔎 This is not in my granth yet — let me search the shastras…" }]
      : reply.cards;
    const next: Message[] = [...messagesRef.current, { role: "user", text: content }, { role: "assistant", cards, pending: searching }];
    const index = next.length - 1;
    messagesRef.current = next;
    setMessages(next);
    setInput("");
    if (searching) learn(content, index);
    else if (voiceRef.current) say(cards, index);
  }, [learn, say]);

  const showRitual = useCallback((id: string) => {
    const k = getKriya(id);
    if (!k) return;
    setMessages((prev) => [...prev, { role: "user", text: k.title }, { role: "assistant", cards: [{ type: "ritual", id }] }]);
  }, []);

  const showKatha = useCallback((id: string) => {
    const k = getKatha(id);
    if (!k) return;
    setMessages((prev) => [...prev, { role: "user", text: k.title }, { role: "assistant", cards: [{ type: "katha", id }] }]);
  }, []);

  /** Optional conversational kundli reading, only when the server has an AI key. */
  const askAi = useCallback(async (question: string) => {
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let reply = "";
    setMessages((prev) => [...prev, { role: "assistant", ai: "" }]);
    const update = (text: string) => setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", ai: text }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: question }], mode: "kundli" }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? "Request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        update(reply);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") update(`${reply}\n\n⚠️ ${(err as Error).message}`);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, []);

  // Restore the conversation and settings, load learned knowledge, then handle anything passed from another page.
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    setCanSpeak(speechSupported());
    setCanListen(listeningSupported());
    try {
      setVoice(localStorage.getItem(VOICE_KEY) === "on");
      setListenLang(localStorage.getItem(LISTEN_LANG_KEY) ?? "hi-IN");
    } catch {}
    const saved = load();
    setMessages(saved.messages);
    setState(saved.state);
    stateRef.current = saved.state;
    (isStaticBuild() ? Promise.resolve({ ok: false } as Response) : fetch("/api/knowledge"))
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d: { entries?: LearnedEntry[] }) => learnKnowledge(d.entries ?? []))
      .catch(() => undefined)
      .finally(() => {
        const q = params.get("q");
        const handoff = params.get("mode") === "kundli" ? sessionStorage.getItem(KUNDLI_HANDOFF_KEY) : null;
        if (handoff) {
          sessionStorage.removeItem(KUNDLI_HANDOFF_KEY);
          setMessages((prev) => [...prev, { role: "user", text: "Please give me a detailed reading of my kundli." }]);
          askAi(handoff);
        } else if (q) {
          send(q);
        }
        if (q || handoff) router.replace("/chat");
      });
  }, [params, router, send, askAi, learnKnowledge]);

  useEffect(() => {
    if (!busy && initialised.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: messages.slice(-30), state }));
      } catch {}
    }
  }, [messages, state, busy]);

  useEffect(() => () => {
    stopSpeechRef.current?.();
    stopListenRef.current?.();
  }, []);

  const lastCount = useRef(0);
  useEffect(() => {
    // Scroll so the newest reply starts at the top of the view (replies can be long).
    if (messages.length > lastCount.current) {
      const nodes = logRef.current?.querySelectorAll(".msg");
      const target = nodes?.[Math.max(0, messages.length - 2)] as HTMLElement | undefined;
      target?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    lastCount.current = messages.length;
  }, [messages]);

  const toggleVoice = () => {
    const next = !voice;
    setVoice(next);
    if (!next) stopSpeechRef.current?.();
    try {
      localStorage.setItem(VOICE_KEY, next ? "on" : "off");
    } catch {}
  };

  const toggleListening = () => {
    if (listening) {
      stopListenRef.current?.();
      return;
    }
    stopSpeechRef.current?.();
    setListenError(null);
    setListening(true);
    let heard = "";
    stopListenRef.current = listen(
      listenLang,
      (text, final) => {
        heard = text;
        setInput(text);
        if (final) {
          // Speaking to Brahman turns its voice on, so the conversation continues by voice.
          if (!voiceRef.current) toggleVoiceOn();
          send(text);
        }
      },
      (error) => {
        setListening(false);
        stopListenRef.current = null;
        if (error && error !== "aborted" && error !== "no-speech" && !heard) {
          setInput("");
          setListenError(error === "not-allowed" ? "Please allow microphone access to speak to Brahman." : `Could not hear clearly (${error}). Please try again.`);
        }
      },
    );
  };

  const toggleVoiceOn = () => {
    setVoice(true);
    try {
      localStorage.setItem(VOICE_KEY, "on");
    } catch {}
  };

  const changeListenLang = (lang: string) => {
    setListenLang(lang);
    try {
      localStorage.setItem(LISTEN_LANG_KEY, lang);
    } catch {}
  };

  const reset = () => {
    abortRef.current?.abort();
    stopSpeechRef.current?.();
    setMessages([]);
    setState({});
  };

  return (
    <div className="chat container">
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 ? (
          <div className="hero">
            <div className="om-big deva" aria-hidden>ॐ</div>
            <h1>🙏 Namaste</h1>
            <p>
              I am Brahman, your purohit. Share what is on your heart — an exam, an interview, a worry — and I will pray
              with you. Tell me — or say aloud — the puja, hawan or vrat you wish to perform and I will
              give you the samagri, every step and the mantras, and recite them with you. Ask for any katha — Bhagavat, Gita,
              Ramayana, Sundarkand, Garuda Purana — and I will tell it. Share your birth details and I will prepare your kundli.
            </p>
            <div className="chips" style={{ justifyContent: "center" }}>
              {STARTER_SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className={`bubble${m.role === "assistant" && "cards" in m && m.cards.some((c) => !["text", "suggestions", "ritualList"].includes(c.type)) ? " wide" : ""}`}>
                {m.role === "user" ? (
                  m.text
                ) : "ai" in m ? (
                  m.ai ? <Markdown>{m.ai}</Markdown> : <span className="typing">Brahman is contemplating…</span>
                ) : (
                  <div className="cards">
                    {m.cards.map((c, j) => <CardView key={j} card={c} voice={voice} onRitual={showRitual} onSend={send} onKatha={showKatha} />)}
                    {m.pending && <span className="typing">Searching the shastras… this can take up to a minute.</span>}
                    {canSpeak && !m.pending && m.cards.some((c) => speechForCard(c).length > 0) && (
                      <div>
                        <button
                          type="button"
                          className="chip listen"
                          onClick={() => (speakingIndex === i ? stopSpeechRef.current?.() : say(m.cards, i))}
                        >
                          {speakingIndex === i ? "⏹ Stop" : "🔊 Listen"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="chat-input">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          {messages.length > 0 && (
            <button type="button" className="btn secondary icon" onClick={reset} title="New conversation" aria-label="New conversation">＋</button>
          )}
          <textarea
            rows={1}
            value={input}
            placeholder={listening ? "Listening… speak now" : "e.g. I want to perform Graha Shanti hawan…"}
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          {canListen && (
            <button
              type="button"
              className={`btn secondary icon${listening ? " recording" : ""}`}
              onClick={toggleListening}
              title={listening ? "Stop listening" : "Speak to Brahman"}
              aria-label={listening ? "Stop listening" : "Speak to Brahman"}
            >
              🎙️
            </button>
          )}
          {busy ? (
            <button type="button" className="btn" onClick={() => abortRef.current?.abort()}>Stop</button>
          ) : (
            <button type="submit" className="btn" disabled={!input.trim()}>Ask</button>
          )}
        </form>
        {listenError && <p className="bad" role="alert" style={{ margin: "6px 0 0" }}>{listenError}</p>}
        <div className="voice-bar">
          {canSpeak && (
            <button type="button" className={`chip${voice ? " on" : ""}`} onClick={toggleVoice} aria-pressed={voice}>
              {voice ? "🔊 Brahman's voice: on" : "🔈 Brahman's voice: off"}
            </button>
          )}
          {canListen && (
            <select value={listenLang} onChange={(e) => changeListenLang(e.target.value)} aria-label="Language you speak">
              <option value="hi-IN">I speak Hindi / Hinglish</option>
              <option value="en-IN">I speak English</option>
            </select>
          )}
          <span className="disclaimer">
            {ai ? "Answers come from Brahman's granth; new questions are searched and added to it." : "Brahman answers from its built-in granth — no account or API key needed."}
          </span>
        </div>
      </div>
    </div>
  );
}
