import { getGraha } from "@/lib/grahas";
import { MantraBlock } from "./MantraBlock";

export function GrahaCard({ name, reason }: { name: string; reason?: string }) {
  const g = getGraha(name);
  return (
    <div className="graha">
      <h3 style={{ margin: "0 0 4px" }}>
        {g.sanskrit} <span className="deva">({g.devanagari})</span> — {g.name}
      </h3>
      {reason && <p className="sub" style={{ margin: "0 0 6px" }}>Why: {reason}</p>}
      <p style={{ margin: "0 0 8px" }}>Signifies {g.signifies}.</p>
      <MantraBlock title="Beej mantra" mantra={{ ...g.beej, count: `108 daily; ${g.japaCount.toLocaleString("en-IN")} for a full anushthana` }} />
      <MantraBlock title="Navagraha Stotra verse" mantra={g.stotra} />
      <ul className="samagri" style={{ marginTop: 10 }}>
        <li><strong>Day:</strong> {g.day} · <strong>Colour:</strong> {g.color}</li>
        <li><strong>Worship:</strong> {g.deity}</li>
        <li><strong>Daan:</strong> {g.daan} (on {g.day})</li>
        <li><strong>Grain:</strong> {g.grain} · <strong>Samidha:</strong> {g.samidha}</li>
        <li><strong>Gem:</strong> {g.gem} — only on an experienced jyotishi&apos;s advice</li>
      </ul>
    </div>
  );
}
