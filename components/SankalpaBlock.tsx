"use client";

import { useMemo, useState } from "react";
import { useProfile } from "@/lib/profile";
import { buildSankalpa, tarpanMantras, todaysPanchang } from "@/lib/sankalpa";
import { MantraBlock } from "./MantraBlock";
import { ProfileForm } from "./ProfileForm";

/** The person's own sankalpa for a rite — or a prompt to add their details. */
export function SankalpaBlock({ ritualId }: { ritualId: string }) {
  const [profile, loaded] = useProfile();
  const [editing, setEditing] = useState(false);
  const mantra = useMemo(() => (profile ? buildSankalpa(profile, ritualId, todaysPanchang(profile.place)) : null), [profile, ritualId]);
  if (!loaded) return null;
  if (!profile || editing) {
    return (
      <div className="sankalpa-setup">
        <div className="mantra-title">🙏 Your personal sankalpa</div>
        <p className="sub">Give your name, gotra and father&apos;s name once, and Brahman will write your full Sanskrit sankalpa for every rite — with today&apos;s samvat, masa, paksha, tithi, vara and nakshatra.</p>
        <ProfileForm initial={profile} onSaved={() => setEditing(false)} />
      </div>
    );
  }
  return (
    <div>
      <MantraBlock title={`Your sankalpa — ${profile.name}`} mantra={mantra!} />
      <button type="button" className="chip" onClick={() => setEditing(true)}>✏️ Edit my details</button>
    </div>
  );
}

export function TarpanBlock() {
  const [profile, loaded] = useProfile();
  if (!loaded || !profile) return null;
  const mantras = tarpanMantras(profile);
  if (!mantras.length) {
    return <p className="sub">Add your departed ancestors&apos; names under ✏️ Edit my details to get a tarpan mantra naming each of them.</p>;
  }
  return (
    <div>
      {mantras.map((m) => <MantraBlock key={m.title} title={m.title} mantra={m} />)}
    </div>
  );
}
