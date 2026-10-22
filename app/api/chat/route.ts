import Anthropic from "@anthropic-ai/sdk";
import { KUNDLI_INSTRUCTIONS, PRIEST_SYSTEM_PROMPT, type ChatMode } from "@/lib/priest";

export const runtime = "nodejs";

const client = new Anthropic();

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  mode?: ChatMode;
}

const MAX_MESSAGES = 40;
const MAX_CHARS = 20000;

/** Lets the UI know whether the optional AI answers are configured. */
export function GET() {
  return Response.json({ ai: Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) });
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const messages = (body.messages ?? []).slice(-MAX_MESSAGES).filter(
    (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim(),
  );
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return badRequest("The conversation must end with a user message.");
  }
  // The window may start mid-conversation; the API needs a user turn first.
  while (messages[0].role !== "user") messages.shift();
  if (messages.some((m) => m.content.length > MAX_CHARS)) {
    return badRequest("A message is too long.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const context = [`Today's date (UTC) is ${today}.`];
  if (body.mode === "kundli") context.push(KUNDLI_INSTRUCTIONS);

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 64000,
    // Opt into server-side fallback so a classifier decline is retried on the recommended model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: [
      { type: "text", text: PRIEST_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: context.join("\n\n") },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("\n\n🙏 I'm unable to help with that request. Please rephrase it or ask something else."),
          );
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n…(the answer was cut short — ask me to continue)"));
        }
      } catch (err) {
        console.error("Brahman chat error:", err);
        let message = "Something went wrong while contacting Brahman. Please try again.";
        // No credentials at all surfaces as a plain client-side error rather than a typed API error.
        const noCredentials = err instanceof Error && err.message.startsWith("Could not resolve authentication method");
        if (err instanceof Anthropic.AuthenticationError || noCredentials) {
          message = "The server's ANTHROPIC_API_KEY is missing or invalid. Set it in .env.local and restart.";
        } else if (err instanceof Anthropic.RateLimitError) {
          message = "Brahman is receiving many questions right now. Please try again in a moment.";
        } else if (err instanceof Anthropic.APIConnectionError) {
          message = "Could not reach the AI service. Please check the connection and try again.";
        }
        controller.enqueue(encoder.encode(`\n\n⚠️ ${message}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
