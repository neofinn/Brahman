"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import type { ChatMode } from "@/lib/priest";
import { KUNDLI_HANDOFF_KEY } from "@/lib/handoff";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "brahman:conversation";


const SUGGESTIONS = [
  "What does Bhagavad Gita 2.47 teach about karma?",
  "How do I perform a simple Lakshmi puja at home on Diwali?",
  "Explain tat tvam asi from the Chandogya Upanishad",
  "Ekadashi vrat ke niyam kya hain?",
  "What is the significance of the Gayatri mantra?",
  "Which mantras should I chant for peace of mind?",
];

function load(): { messages: Message[]; mode: ChatMode } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { messages: [], mode: "general" };
}

export function Chat() {
  const router = useRouter();
  const params = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<ChatMode>("general");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialised = useRef(false);

  const send = useCallback(async (text: string, history: Message[], sendMode: ChatMode) => {
    const content = text.trim();
    if (!content) return;
    const next: Message[] = [...history, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let reply = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mode: sendMode }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Request failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        reply += `${reply ? "\n\n" : ""}⚠️ ${(err as Error).message}`;
      }
    } finally {
      const final: Message[] = reply ? [...next, { role: "assistant", content: reply }] : next;
      setMessages(final);
      setBusy(false);
      abortRef.current = null;
    }
  }, []);

  // Restore the conversation, then handle a question or kundli passed in from another page.
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const saved = load();
    const q = params.get("q");
    const handoff = params.get("mode") === "kundli" ? sessionStorage.getItem(KUNDLI_HANDOFF_KEY) : null;
    if (handoff) {
      sessionStorage.removeItem(KUNDLI_HANDOFF_KEY);
      setMode("kundli");
      send(handoff, [], "kundli");
    } else if (q) {
      setMode("general");
      send(q, [], "general");
    } else {
      setMessages(saved.messages);
      setMode(saved.mode);
    }
    if (q || handoff) router.replace("/chat");
  }, [params, router, send]);

  useEffect(() => {
    if (!busy && initialised.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, mode }));
      } catch {}
    }
  }, [messages, mode, busy]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  const newConversation = () => {
    abortRef.current?.abort();
    setMessages([]);
    setMode("general");
  };

  return (
    <div className="chat container">
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 ? (
          <div className="hero">
            <div className="om-big deva" aria-hidden>ॐ</div>
            <h1>🙏 Namaste</h1>
            <p>
              I am Brahman. Ask me about any scripture, puja, vrat, festival, mantra or question of dharma — in English,
              Hindi or your own language.
            </p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s, [], "general")}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">
                {m.role === "assistant" ? (
                  m.content ? <Markdown>{m.content}</Markdown> : <span className="typing">Brahman is contemplating…</span>
                ) : (
                  m.content
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
            if (!busy) send(input, messages, mode);
          }}
        >
          {messages.length > 0 && (
            <button type="button" className="btn secondary" onClick={newConversation} title="New conversation">
              ＋
            </button>
          )}
          <textarea
            rows={1}
            value={input}
            placeholder="Ask Brahman…"
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (!busy) send(input, messages, mode);
              }
            }}
          />
          {busy ? (
            <button type="button" className="btn" onClick={() => abortRef.current?.abort()}>Stop</button>
          ) : (
            <button type="submit" className="btn" disabled={!input.trim()}>Ask</button>
          )}
        </form>
        <div className="disclaimer">
          Brahman can make mistakes. Verify important verses and muhurtas with your family purohit.
        </div>
      </div>
    </div>
  );
}
