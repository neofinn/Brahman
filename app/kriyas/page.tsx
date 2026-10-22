import Link from "next/link";
import type { Metadata } from "next";
import { KRIYAS, type KriyaCategory } from "@/lib/kriyas";

const GROUPS: [string, KriyaCategory[]][] = [
  ["Hawan & Shanti", ["hawan", "shanti"]],
  ["Puja & Path", ["puja", "path"]],
  ["Vrat", ["vrat"]],
  ["Samskaras", ["samskara"]],
];

export const metadata: Metadata = { title: "Puja Vidhi — Brahman" };

export default function KriyasPage() {
  return (
    <main>
      <div className="container">
        <h1>Puja, Hawan &amp; Kriyas</h1>
        <p className="lede">
          Complete guides with samagri checklists, every step of the vidhi and the mantras — tap 🔊 to hear them recited,
          or choose “Perform with me” to be guided one step at a time. Traditions vary by region and family.
        </p>
        {GROUPS.map(([title, cats]) => {
          const items = KRIYAS.filter((k) => cats.includes(k.category));
          return (
            <section key={title} className="section">
              <h2>{title}</h2>
              <div className="grid">
                {items.map((k) => (
                  <Link key={k.id} href={`/kriyas/${k.id}`} className="card">
                    <span className="deva tag">{k.devanagari}</span>
                    <h3 style={{ marginTop: 8 }}>{k.title}</h3>
                    <p>{k.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
