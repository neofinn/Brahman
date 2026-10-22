"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { RitualGuide } from "@/components/RitualGuide";
import { GrahaCard } from "@/components/GrahaCard";
import { MantraBlock } from "@/components/MantraBlock";
import { KundliReport } from "@/components/KundliReport";
import { PanchangPanel } from "@/app/panchang/PanchangView";
import { useAiAvailable } from "@/components/useAi";
import { respond, STARTER_SUGGESTIONS, type Card, type FinderState } from "@/lib/finder";
import { computeKundli } from "@/lib/jyotish";
import { getKriya } from "@/lib/kriyas";
import { KUNDLI_HANDOFF_KEY } from "@/lib/handoff";
import { zonedToUtc } from "@/lib/time";

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; cards: Card[]; unmatched?: boolean; question?: string }
  | { role: "assistant"; ai: string };

const STORAGE_KEY = "brahman:finder:v1";

function load(): { messages: Message[]; state: FinderState } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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

function CardView({ card, onRitual, onSend }: { card: Card; onRitual: (id: string) => void; onSend: (text: string) => void }) {
  switch (card.type) {
    case "text":
      return <p className="card-text">{card.text}</p>;
    case "ritual": {
      const kriya = getKriya(card.id);
      return kriya ? <RitualGuide kriya={kriya} compact /> : null;
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
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialised = useRef(false);
  const stateRef = useRef<FinderState>({});
  stateRef.current = state;

  const send = useCallback((text: string) => {
    const content = text.trim();
    if (!content) return;
    const reply = respond(content, stateRef.current);
    setState(reply.state);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: content },
      { role: "assistant", cards: reply.cards, unmatched: reply.unmatched, question: content },
    ]);
    setInput("");
  }, []);

  const showRitual = useCallback((id: string) => {
    const k = getKriya(id);
    if (!k) return;
    setMessages((prev) => [...prev, { role: "user", text: k.title }, { role: "assistant", cards: [{ type: "ritual", id }] }]);
  }, []);

  /** Optional: a free-form answer from Claude, only when the server has a key configured. */
  const askAi = useCallback(async (question: string, mode: "general" | "kundli" = "general") => {
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let reply = "";
    setMessages((prev) => [...prev, { role: "assistant", ai: "" }]);
    const update = (text: string) =>
      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", ai: text }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: question }], mode }),
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

  // Restore the conversation, then handle a question or kundli passed in from another page.
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const saved = load();
    setMessages(saved.messages);
    setState(saved.state);
    stateRef.current = saved.state;
    const q = params.get("q");
    const handoff = params.get("mode") === "kundli" ? sessionStorage.getItem(KUNDLI_HANDOFF_KEY) : null;
    if (handoff) {
      sessionStorage.removeItem(KUNDLI_HANDOFF_KEY);
      setMessages((prev) => [...prev, { role: "user", text: "Please give me a detailed reading of my kundli." }]);
      askAi(handoff, "kundli");
    } else if (q) {
      send(q);
    }
    if (q || handoff) router.replace("/chat");
  }, [params, router, send, askAi]);

  useEffect(() => {
    if (!busy && initialised.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: messages.slice(-30), state }));
      } catch {}
    }
  }, [messages, state, busy]);

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

  const reset = () => {
    abortRef.current?.abort();
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
              I am Brahman, your purohit. Tell me the puja, hawan or vrat you wish to perform and I will give you the
              samagri, every step and the mantras — and recite them with you. Share your date, time and place of birth
              and I will prepare your kundli.
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
              <div className={`bubble${m.role === "assistant" && "cards" in m && m.cards.some((c) => c.type !== "text" && c.type !== "suggestions" && c.type !== "ritualList") ? " wide" : ""}`}>
                {m.role === "user" ? (
                  m.text
                ) : "ai" in m ? (
                  m.ai ? <Markdown>{m.ai}</Markdown> : <span className="typing">Brahman is contemplating…</span>
                ) : (
                  <div className="cards">
                    {m.cards.map((c, j) => <CardView key={j} card={c} onRitual={showRitual} onSend={send} />)}
                    {m.unmatched && ai && m.question && (
                      <button type="button" className="chip" disabled={busy} onClick={() => askAi(m.question!)}>✨ Ask AI in depth</button>
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
            <button type="button" className="btn secondary" onClick={reset} title="New conversation">＋</button>
          )}
          <textarea
            rows={1}
            value={input}
            placeholder="e.g. I want to perform Graha Shanti hawan…"
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          {busy ? (
            <button type="button" className="btn" onClick={() => abortRef.current?.abort()}>Stop</button>
          ) : (
            <button type="submit" className="btn" disabled={!input.trim()}>Ask</button>
          )}
        </form>
        <div className="disclaimer">Brahman answers from its built-in granth — no account or API key needed. For samskaras, involve your family purohit.</div>
      </div>
    </div>
  );
}
