import { listLearned, removeLearned } from "@/lib/knowledge-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Everything Brahman has learned, for the finder to answer offline. */
export async function GET() {
  return Response.json({ entries: await listLearned() }, { headers: { "Cache-Control": "no-store" } });
}

/** Removes a learned entry. Requires BRAHMAN_ADMIN_TOKEN. */
export async function DELETE(req: Request) {
  const token = process.env.BRAHMAN_ADMIN_TOKEN;
  if (!token) return Response.json({ error: "Set BRAHMAN_ADMIN_TOKEN on the server to manage knowledge." }, { status: 503 });
  if (req.headers.get("x-admin-token") !== token) return Response.json({ error: "Wrong admin token." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  return (await removeLearned(id)) ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
}
