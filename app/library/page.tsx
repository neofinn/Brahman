import Link from "next/link";
import type { Metadata } from "next";
import { LIBRARY } from "@/lib/library";

export const metadata: Metadata = { title: "Scripture Library — Brahman" };

function askHref(text: string) {
  return `/chat?q=${encodeURIComponent(`Tell me about the ${text}: what it contains, its key teachings, and a few important verses.`)}`;
}

export default function LibraryPage() {
  return (
    <main>
      <div className="container">
        <h1>Scripture Library</h1>
        <p className="lede">
          A map of the Sanatan Dharma canon — from the Shruti of the Vedas to the Smriti of the epics and Puranas.
          Choose any text to ask Brahman about it.
        </p>
        {LIBRARY.map((cat) => (
          <section key={cat.id} id={cat.id} className="section">
            <h2>
              {cat.title} <span className="deva tag">{cat.devanagari}</span>
            </h2>
            <p className="lede">{cat.summary}</p>
            <div className="grid">
              {cat.texts.map((t) => (
                <Link key={t.name} href={t.kathaId ? `/katha/${t.kathaId}` : askHref(t.name)} className="card">
                  <h3>
                    {t.name}
                    {t.devanagari && <span className="deva" style={{ display: "block", fontWeight: 400, color: "var(--maroon)" }}>{t.devanagari}</span>}
                  </h3>
                  <p>{t.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
