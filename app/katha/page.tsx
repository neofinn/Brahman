import Link from "next/link";
import type { Metadata } from "next";
import { KATHAS, type Katha } from "@/lib/kathas";

export const metadata: Metadata = { title: "Katha Library — Brahman" };

const GROUPS: [string, string, Katha["kind"][]][] = [
  ["Granths", "The great scriptures, chapter by chapter, with key verses and how to hold their path or katha.", ["granth", "path"]],
  ["Kathas", "Stories from the Puranas, Itihasas and Upanishads — read them, or let Brahman tell them aloud.", ["katha"]],
  ["Vrat Kathas", "The kathas heard on vratas and festivals.", ["vrat-katha"]],
];

export default function KathaLibrary() {
  return (
    <main>
      <div className="container">
        <h1>Katha Library</h1>
        <p className="lede">
          Bhagavat, Gita, Ramayana, Sundarkand, Garuda Purana, Shiv Purana, Durga Saptashati and the kathas within them.
          Tap 🔊 and Brahman will tell the katha or recite the path with you.
        </p>
        {GROUPS.map(([title, blurb, kinds]) => (
          <section key={title} className="section">
            <h2>{title}</h2>
            <p className="lede">{blurb}</p>
            <div className="grid">
              {KATHAS.filter((k) => kinds.includes(k.kind)).map((k) => (
                <Link key={k.id} href={`/katha/${k.id}`} className="card">
                  <span className="deva tag">{k.devanagari}</span>
                  <h3 style={{ marginTop: 8 }}>{k.title}</h3>
                  <p>{k.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
