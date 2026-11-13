import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KRIYAS, getKriya } from "@/lib/kriyas";
import { RitualGuide } from "@/components/RitualGuide";

export function generateStaticParams() {
  return KRIYAS.map((k) => ({ id: k.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const kriya = getKriya((await params).id);
  return { title: kriya ? `${kriya.title} — Brahman` : "Puja Vidhi — Brahman" };
}

export default async function KriyaPage({ params }: { params: Promise<{ id: string }> }) {
  const kriya = getKriya((await params).id);
  if (!kriya) notFound();

  const ask = (q: string) => `/chat?q=${encodeURIComponent(q)}`;

  return (
    <main>
      <div className="container">
        <p><Link href="/kriyas">← All puja vidhi</Link></p>
        <span className="deva tag">{kriya.devanagari}</span>
        <h1 style={{ marginTop: 8 }}>{kriya.title}</h1>
        <p className="lede">{kriya.summary}</p>

        <div className="two-col">
          <div className="card">
            <RitualGuide kriya={kriya} />
          </div>
          <aside style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div className="card" style={{ display: "grid", gap: 8 }}>
              <h3>Ask Brahman</h3>
              <Link className="btn secondary" href={ask(kriya.title)}>Open in Ask Brahman</Link>
              <Link className="btn secondary" href="/kundli">Check your kundli first</Link>
              <Link className="btn secondary" href="/panchang">Find a muhurta in the Panchang</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
