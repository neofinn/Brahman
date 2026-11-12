import { verifyPayment } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : undefined);
  const orderId = str("orderId"), reportId = str("reportId"), ticket = str("ticket"), subject = str("subject");
  if (!orderId || !reportId || !ticket || !subject) return Response.json({ error: "Missing fields." }, { status: 400 });
  try {
    const token = verifyPayment(process.env, { orderId, reportId, ticket, subject, paymentId: str("paymentId"), signature: str("signature") });
    return Response.json({ token });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 402 });
  }
}
