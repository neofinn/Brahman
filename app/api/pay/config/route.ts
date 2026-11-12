import { payMode } from "@/lib/payments";

export const runtime = "nodejs";

/** Tells the report store whether it can take payments. */
export function GET() {
  return Response.json({ mode: payMode() });
}
