"use client";

import { useState } from "react";
import { MantraBlock } from "@/components/MantraBlock";
import { SiddhiCard } from "@/components/SiddhiCard";
import { GROUP_TITLES, GUNA_INFO, SIDDHI_VERSES, SIDDHIS, type Guna, type SiddhiGroup } from "@/lib/siddhis";

const GROUP_ORDER: SiddhiGroup[] = ["ashta", "nidhi", "bhagavata", "yoga-sutra", "mantra", "hatha", "shatkarma", "sadhana"];

export function SiddhisView() {
  return (
    <main>
      <div className="container">
        <h1>Siddhis</h1>
        <p className="lede">
          Every siddhi named in the scriptures — the ashta siddhi and nava nidhi, the eighteen siddhis Shri Krishna describes to
          Uddhava, the powers of samyama in the Yoga Sutra, and the mantra, tantric and folk siddhis — sorted by guna, with their
          sources and the tradition&apos;s warnings.
        </p>
        <SiddhiLibrary />
      </div>
    </main>
  );
}

/** The siddhi library with a guna filter, also embedded in the chat. */
export function SiddhiLibrary({ initialGuna, onRitual }: { initialGuna?: Guna; onRitual?: (id: string) => void }) {
  const [guna, setGuna] = useState<Guna | "all">(initialGuna ?? "all");
  const shown = SIDDHIS.filter((s) => guna === "all" || s.guna === guna);
  return (
    <>
      <div className="segmented" role="group" aria-label="Guna" style={{ marginBottom: 12 }}>
        {(["all", "sattvic", "rajasic", "tamasic"] as const).map((g) => (
          <button key={g} type="button" className={guna === g ? "on" : ""} onClick={() => setGuna(g)}>
            {g === "all" ? `All (${SIDDHIS.length})` : `${GUNA_INFO[g].title} (${SIDDHIS.filter((s) => s.guna === g).length})`}
          </button>
        ))}
      </div>
      {guna !== "all" && <p className="sub"><span className="deva">{GUNA_INFO[guna].devanagari}</span> — {GUNA_INFO[guna].text}</p>}
      <p className="sub">
        Sattvic siddhis are given with their traditional path. Rajasic and tamasic practices meant to control or harm others are
        described with their sources and dangers only, with a sattvic way to the same need; Brahman does not teach their procedures.
      </p>
      {GROUP_ORDER.map((g) => {
        const items = shown.filter((s) => s.group === g);
        if (!items.length) return null;
        return (
          <section key={g} className="section">
            <h2>{GROUP_TITLES[g]}</h2>
            {g === "yoga-sutra" && <p className="sub">Sutra numbers differ by one between some editions of the Vibhuti Pada.</p>}
            <div className="grid">{items.map((s) => <SiddhiCard key={s.id} s={s} onRitual={onRitual} />)}</div>
          </section>
        );
      })}
      <section className="section">
        <h2>What the scriptures say about siddhis</h2>
        {SIDDHI_VERSES.map((v) => (
          <div key={v.title} className="reading-section">
            <h3>{v.title}</h3>
            <MantraBlock mantra={v} />
          </div>
        ))}
      </section>
    </>
  );
}
