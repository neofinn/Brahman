import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { respond, setLearnedKnowledge } from "@/lib/finder";
import { addLearned, listLearned } from "@/lib/knowledge-store";
import type { LearnedEntry } from "@/lib/learned";
import { LEARN_INSTRUCTIONS, PRIEST_SYSTEM_PROMPT } from "@/lib/priest";

export const runtime = "nodejs";
export const maxDuration = 300;

const client = new Anthropic();

const MantraSchema = z.object({
  devanagari: z.string(),
  iast: z.string(),
  meaning: z.string(),
  source: z.string(),
  count: z.string(),
});

const EntrySchema = z.object({
  answerable: z.boolean(),
  kind: z.enum(["ritual", "article"]),
  title: z.string(),
  devanagari: z.string(),
  category: z.enum(["puja", "hawan", "shanti", "vrat", "samskara", "path", "knowledge"]),
  keywords: z.array(z.string()),
  summary: z.string(),
  when: z.string(),
  duration: z.string(),
  purohit: z.string(),
  samagri: z.array(z.string()),
  steps: z.array(z.object({ title: z.string(), detail: z.string(), mantra: MantraSchema.nullable() })),
  notes: z.array(z.string()),
  body: z.string(),
  sources: z.array(z.string()),
});

const MAX_QUESTION = 500;
const HOURLY_PER_CLIENT = 10;
const DAILY_LIMIT = Number(process.env.LEARN_DAILY_LIMIT ?? 200);
const recent = new Map<string, number[]>();
let daily = { day: "", count: 0 };

function allowed(clientId: string): boolean {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  if (daily.day !== today) daily = { day: today, count: 0 };
  if (daily.count >= DAILY_LIMIT) return false;
  const times = (recent.get(clientId) ?? []).filter((t) => now - t < 3600000);
  if (times.length >= HOURLY_PER_CLIENT) return false;
  recent.set(clientId, [...times, now]);
  daily.count++;
  return true;
}

function slug(text: string): string {
  return (
    "learned-" +
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60)
  );
}

const clip = (s: string, n: number) => s.trim().slice(0, n);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return Response.json({ error: "AI search is not configured on this server." }, { status: 503 });
  }
  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  if (typeof question !== "string" || !question.trim() || question.length > MAX_QUESTION) {
    return Response.json({ error: "Please ask a question of up to 500 characters." }, { status: 400 });
  }

  // Someone may have taught Brahman this already since the asker's page loaded.
  const existing = await listLearned();
  setLearnedKnowledge(existing);
  const local = respond(question);
  if (!local.unmatched && local.cards.some((c) => c.type === "ritual" || c.type === "article")) {
    return Response.json({ status: "known", cards: local.cards, entries: existing });
  }

  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowed(clientId)) {
    return Response.json({ error: "Brahman has searched a lot just now. Please try again later." }, { status: 429 });
  }

  let parsed: z.infer<typeof EntrySchema> | null;
  try {
    const message = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // Opt into server-side fallback so a classifier decline is retried on the recommended model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: betaZodOutputFormat(EntrySchema) },
      system: [
        { type: "text", text: PRIEST_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: LEARN_INSTRUCTIONS },
      ],
      messages: [{ role: "user", content: question }],
    });
    if (message.stop_reason === "refusal") {
      return Response.json({ status: "declined", message: "🙏 I am unable to help with that request." });
    }
    if (message.stop_reason === "max_tokens") {
      return Response.json({ error: "The answer was too long to complete. Please ask something more specific." }, { status: 502 });
    }
    parsed = message.parsed_output;
  } catch (err) {
    console.error("Brahman learn error:", err);
    const status = err instanceof Anthropic.RateLimitError ? 429 : 502;
    return Response.json({ error: "Could not search right now. Please try again." }, { status });
  }

  if (!parsed) return Response.json({ error: "The search returned an unreadable answer." }, { status: 502 });
  if (!parsed.answerable) {
    return Response.json({
      status: "declined",
      message: "🙏 That question is outside what Brahman covers. Ask about puja, hawan, vrat, scripture, festivals or jyotisha.",
    });
  }

  const isRitual = parsed.kind === "ritual" && parsed.steps.length > 0;
  const entry: LearnedEntry = {
    id: slug(parsed.title || question),
    kind: isRitual ? "ritual" : "article",
    title: clip(parsed.title, 120),
    devanagari: clip(parsed.devanagari, 120),
    category: isRitual ? parsed.category : "knowledge",
    keywords: parsed.keywords.map((k) => clip(k, 60)).filter(Boolean).slice(0, 20),
    summary: clip(parsed.summary, 1000),
    when: clip(parsed.when, 600),
    duration: clip(parsed.duration, 100),
    purohit: clip(parsed.purohit, 300),
    samagri: parsed.samagri.map((s) => clip(s, 300)).filter(Boolean).slice(0, 40),
    steps: isRitual
      ? parsed.steps.slice(0, 60).map((s) => ({
          title: clip(s.title, 150),
          detail: clip(s.detail, 1500),
          ...(s.mantra && s.mantra.devanagari.trim()
            ? {
                mantra: {
                  devanagari: clip(s.mantra.devanagari, 1500),
                  iast: clip(s.mantra.iast, 1500),
                  meaning: clip(s.mantra.meaning, 1000),
                  ...(s.mantra.source.trim() ? { source: clip(s.mantra.source, 200) } : {}),
                  ...(s.mantra.count.trim() ? { count: clip(s.mantra.count, 100) } : {}),
                },
              }
            : {}),
        }))
      : [],
    notes: parsed.notes.map((n) => clip(n, 600)).filter(Boolean).slice(0, 10),
    body: isRitual ? "" : clip(parsed.body, 20000),
    sources: parsed.sources.map((s) => clip(s, 200)).filter(Boolean).slice(0, 10),
    question: clip(question, MAX_QUESTION),
    createdAt: new Date().toISOString(),
  };

  try {
    const saved = await addLearned(entry);
    return Response.json({ status: "learned", entry: saved, entries: [...existing, saved] });
  } catch (err) {
    console.error("Brahman knowledge store error:", err);
    // Still answer the person even if it could not be saved.
    return Response.json({ status: "unsaved", entry, entries: [...existing, entry] });
  }
}
