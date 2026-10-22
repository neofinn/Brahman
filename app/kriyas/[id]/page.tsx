import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KRIYAS, getKriya } from "@/lib/kriyas";

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
          <div>
            <h2>Vidhi</h2>
            <ol className="steps">
              {kriya.steps.map((s, i) => (
                <li key={i}>
                  <h3>{s.title}</h3>
                  <p>{s.detail}</p>
                  {s.mantra && (
                    <div className="mantra">
                      <div className="deva">{s.mantra.devanagari}</div>
                      <div className="iast">{s.mantra.iast}</div>
                      <div className="meaning">{s.mantra.meaning}</div>
                      {s.mantra.source && <div className="iast">— {s.mantra.source}</div>}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <aside style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div className="card">
              <h3>When</h3>
              <p>{kriya.when}</p>
            </div>
            <div className="card">
              <h3>Samagri</h3>
              <ul className="samagri">
                {kriya.samagri.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            {kriya.notes && (
              <div className="card">
                <h3>Notes</h3>
                {kriya.notes.map((n) => <p key={n} style={{ marginBottom: 8 }}>{n}</p>)}
              </div>
            )}
            <div className="card" style={{ display: "grid", gap: 8 }}>
              <h3>Ask Brahman</h3>
              <Link className="btn" href={ask(`Guide me through the ${kriya.title} in detail, with all the mantras and their meanings.`)}>Full vidhi with mantras</Link>
              <Link className="btn secondary" href={ask(`What is the spiritual significance of the ${kriya.title}, and which scriptures describe it?`)}>Significance &amp; sources</Link>
              <Link className="btn secondary" href={ask(`How is the ${kriya.title} done in my regional tradition? Ask me which region I follow.`)}>Regional variations</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
