"use client";

import { ABROAD_PRINCIPLES, FIRE_SAFETY, GITA_9_26, MANASA_PUJA, RIVERS_INVOCATION, SUBSTITUTES, substitutesFor } from "@/lib/abroad";
import type { Kriya } from "@/lib/ritual-common";
import { MantraBlock } from "./MantraBlock";

const needsFire = (k: Kriya) => k.samagri.some((s) => /havan kund|samidha|homa/i.test(s)) || k.steps.some((s) => /ahuti|havan|homa/i.test(s.title));

/** Substitutes and guidance for performing a rite abroad or on a small budget. */
export function AbroadBlock({ kriya, open = false }: { kriya?: Kriya; open?: boolean }) {
  const subs = kriya ? substitutesFor(kriya.samagri) : SUBSTITUTES;
  const fire = !kriya || needsFire(kriya);
  return (
    <details className="abroad" open={open}>
      <summary><strong>🌍 Abroad, or can&apos;t find an item?</strong> Substitutes that keep the puja valid</summary>
      <ul className="factors">{ABROAD_PRINCIPLES.map((p) => <li key={p}>{p}</li>)}</ul>
      {subs.length > 0 && (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>If you can&apos;t find</th><th>Use</th></tr></thead>
            <tbody>{subs.map((s) => <tr key={s.item}><td>{s.item}</td><td>{s.use}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      <h4>Making any water fit for puja</h4>
      <MantraBlock mantra={RIVERS_INVOCATION} />
      <h4>When nothing is available — manasa puja</h4>
      <MantraBlock mantra={MANASA_PUJA} />
      <MantraBlock mantra={GITA_9_26} />
      {fire && (
        <>
          <h4>Fire safety for a hawan at home</h4>
          <ul className="factors">{FIRE_SAFETY.map((f) => <li key={f}>{f}</li>)}</ul>
        </>
      )}
    </details>
  );
}
