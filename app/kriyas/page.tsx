import Link from "next/link";
import type { Metadata } from "next";
import { KRIYAS } from "@/lib/kriyas";

export const metadata: Metadata = { title: "Puja Vidhi — Brahman" };

export default function KriyasPage() {
  return (
    <main>
      <div className="container">
        <h1>Puja Vidhi &amp; Kriyas</h1>
        <p className="lede">
          Step-by-step guides a household can follow, with samagri lists and mantras. Traditions vary by region and
          family — ask Brahman to adapt any vidhi to yours.
        </p>
        <div className="grid">
          {KRIYAS.map((k) => (
            <Link key={k.id} href={`/kriyas/${k.id}`} className="card">
              <span className="deva tag">{k.devanagari}</span>
              <h3 style={{ marginTop: 8 }}>{k.title}</h3>
              <p>{k.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
