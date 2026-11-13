import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KATHAS, getKatha } from "@/lib/kathas";
import { KathaView } from "@/components/KathaView";

export function generateStaticParams() {
  return KATHAS.map((k) => ({ id: k.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const k = getKatha((await params).id);
  return { title: k ? `${k.title} — Brahman` : "Katha — Brahman" };
}

export default async function KathaPage({ params }: { params: Promise<{ id: string }> }) {
  const k = getKatha((await params).id);
  if (!k) notFound();
  return (
    <main>
      <div className="container">
        <p><Link href="/katha">← Katha library</Link></p>
        <h1>{k.title}</h1>
        <div className="card"><KathaView id={k.id} /></div>
      </div>
    </main>
  );
}
