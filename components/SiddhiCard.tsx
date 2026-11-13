"use client";

import Link from "next/link";
import { getKriya } from "@/lib/kriyas";
import { GUNA_INFO, type Siddhi } from "@/lib/siddhis";

/** One siddhi: what it is, where it is taught, the path or the warning, and a sattvic alternative. */
export function SiddhiCard({ s, onRitual }: { s: Siddhi; onRitual?: (id: string) => void }) {
  return (
    <div className={`card siddhi guna-${s.guna}`}>
      <h3 style={{ margin: "0 0 4px" }}>
        {s.name} <span className="deva">({s.devanagari})</span> <span className={`rating guna-badge-${s.guna}`}>{GUNA_INFO[s.guna].title}</span>
      </h3>
      <p>{s.meaning}</p>
      {s.path && <p><strong>Path:</strong> {s.path}</p>}
      {s.caution && <p className="sub"><strong>Caution:</strong> {s.caution}</p>}
      {s.instead && <p><strong>Instead:</strong> {s.instead}</p>}
      <p className="sub">Sources: {s.sources.join("; ")}</p>
      {s.rituals && s.rituals.length > 0 && (
        <div className="chips">
          {s.rituals.map((id) => {
            const k = getKriya(id);
            if (!k) return null;
            return onRitual ? (
              <button key={id} type="button" className="chip" onClick={() => onRitual(id)}>{k.title}</button>
            ) : (
              <Link key={id} className="chip" href={`/kriyas/${id}`}>{k.title}</Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
