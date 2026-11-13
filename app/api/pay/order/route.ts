import { createOrder } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { reportId?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body.reportId !== "string") return Response.json({ error: "reportId is required." }, { status: 400 });
  try {
    return Response.json(await createOrder(process.env, body.reportId));
  } catch (e) {
    console.error("Brahman order error:", e);
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
