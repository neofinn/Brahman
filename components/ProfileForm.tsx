"use client";

import { useState } from "react";
import { GOTRAS, UNKNOWN_GOTRA_NOTE, type Ancestors, type Profile } from "@/lib/sankalpa";
import { nameToDevanagari } from "@/lib/sanskrit";
import { PLACES, type Place } from "@/lib/time";
import { saveProfile } from "@/lib/profile";
import { PlacePicker } from "./PlacePicker";

// Devanagari names of preset cities, for the sankalpa's "<city>नगरे".
const CITY_DEVA: Record<string, string> = {
  Varanasi: "वाराणसी", "New Delhi": "दिल्ली", Ujjain: "उज्जयिनी", Mumbai: "मुम्बई", Kolkata: "कोलकाता", Chennai: "चेन्नई",
  Bengaluru: "बेङ्गलूरु", Hyderabad: "हैदराबाद", Ahmedabad: "अहमदाबाद", Jaipur: "जयपुर", Haridwar: "हरिद्वार", Puri: "पुरी",
  Kathmandu: "काठमाण्डू", Colombo: "कोलम्बो", Singapore: "सिंगापुर", Dubai: "दुबई", London: "लन्दन", "New York": "न्यूयॉर्क",
  Toronto: "टोरोंटो", "San Francisco": "सैन फ्रांसिस्को", Sydney: "सिडनी", "Port Louis": "पोर्ट लुई",
};

const ANCESTORS: [keyof Ancestors, string][] = [
  ["father", "Father"], ["grandfather", "Grandfather (father's father)"], ["greatGrandfather", "Great-grandfather"],
  ["mother", "Mother"], ["grandmother", "Grandmother (father's mother)"], ["greatGrandmother", "Great-grandmother"],
];

function NameField({ label, latin, deva, onLatin, onDeva, placeholder }: {
  label: string; latin: string; deva: string; onLatin: (v: string) => void; onDeva: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="name-field">
      <label>
        {label}
        <input value={latin} placeholder={placeholder} onChange={(e) => { onLatin(e.target.value); onDeva(nameToDevanagari(e.target.value)); }} />
      </label>
      <label>
        In Devanagari (check and correct)
        <input className="deva" value={deva} onChange={(e) => onDeva(e.target.value)} placeholder="देवनागरी" />
      </label>
    </div>
  );
}

export function ProfileForm({ initial, onSaved }: { initial: Profile | null; onSaved?: (p: Profile) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [nameDeva, setNameDeva] = useState(initial?.nameDeva ?? "");
  const [gender, setGender] = useState<Profile["gender"]>(initial?.gender ?? "m");
  const [gotra, setGotra] = useState(initial?.gotra ?? "kashyap");
  const [customGotra, setCustomGotra] = useState(initial?.gotra === "other" ? initial.gotraDeva : "");
  const [father, setFather] = useState(initial?.father ?? "");
  const [fatherDeva, setFatherDeva] = useState(initial?.fatherDeva ?? "");
  const [place, setPlace] = useState<Place>(initial?.place ?? PLACES[1]);
  const [placeDeva, setPlaceDeva] = useState(initial?.placeDeva ?? CITY_DEVA[PLACES[1].name]);
  const [monthSystem, setMonthSystem] = useState<Profile["monthSystem"]>(initial?.monthSystem ?? "purnimanta");
  const [ancestors, setAncestors] = useState<Ancestors>(initial?.ancestors ?? {});
  const [showAncestors, setShowAncestors] = useState(Object.values(initial?.ancestors ?? {}).some(Boolean));

  const ready = name.trim() && nameDeva.trim() && father.trim() && fatherDeva.trim() && placeDeva.trim() && (gotra !== "other" || customGotra.trim());

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const profile: Profile = {
      name: name.trim(), nameDeva: nameDeva.trim(), gender,
      gotra, gotraDeva: gotra === "other" ? nameToDevanagari(customGotra) : GOTRAS.find((g) => g.key === gotra)!.deva,
      father: father.trim(), fatherDeva: fatherDeva.trim(),
      place, placeDeva: placeDeva.trim(), monthSystem,
      ancestors: Object.fromEntries(Object.entries(ancestors).filter(([, v]) => v?.trim()).map(([k, v]) => [k, v!.trim()])),
    };
    saveProfile(profile);
    onSaved?.(profile);
  };

  return (
    <form className="profile-form" onSubmit={save}>
      <NameField label="Your name" latin={name} deva={nameDeva} onLatin={setName} onDeva={setNameDeva} placeholder="e.g. Ramesh Sharma" />
      <div className="form-row">
        <label>
          You are
          <select value={gender} onChange={(e) => setGender(e.target.value as Profile["gender"])}>
            <option value="m">Male (… पुत्रः, … नामाहं)</option>
            <option value="f">Female (… पुत्री, … नाम्नी अहं)</option>
          </select>
        </label>
        <label>
          Gotra
          <select value={gotra} onChange={(e) => setGotra(e.target.value)}>
            {GOTRAS.filter((g) => g.deva).map((g) => <option key={g.key} value={g.key}>{g.name} — {g.deva}</option>)}
            <option value="other">Other — I will type it</option>
          </select>
        </label>
        {gotra === "other" && (
          <label>
            Your gotra
            <input value={customGotra} onChange={(e) => setCustomGotra(e.target.value)} placeholder="e.g. Kashyap or काश्यप" />
          </label>
        )}
      </div>
      <p className="sub" style={{ marginTop: -8 }}>{UNKNOWN_GOTRA_NOTE}</p>
      <NameField label="Father's name" latin={father} deva={fatherDeva} onLatin={setFather} onDeva={setFatherDeva} placeholder="e.g. Ramprasad Sharma" />
      <div className="form-row">
        <PlacePicker value={place} onChange={(p) => { setPlace(p); setPlaceDeva(CITY_DEVA[p.name] ?? (p.name === "My location" ? "" : nameToDevanagari(p.name))); }} label="Where you perform the rite" />
        <label>
          City in Devanagari
          <input className="deva" value={placeDeva} onChange={(e) => setPlaceDeva(e.target.value)} placeholder="e.g. वाराणसी" />
        </label>
        <label>
          Month system
          <select value={monthSystem} onChange={(e) => setMonthSystem(e.target.value as Profile["monthSystem"])}>
            <option value="purnimanta">Purnimanta (North India)</option>
            <option value="amanta">Amanta (Maharashtra, Gujarat, South India)</option>
          </select>
        </label>
      </div>
      <button type="button" className="chip" onClick={() => setShowAncestors(!showAncestors)}>
        {showAncestors ? "▾" : "▸"} Departed ancestors (for tarpan and shraddha — optional)
      </button>
      {showAncestors && (
        <div className="ancestors">
          <p className="sub">Enter names only of those who have passed away, in Devanagari if you can. Tarpan names each of them.</p>
          {ANCESTORS.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={ancestors[key] ?? ""}
                onChange={(e) => setAncestors({ ...ancestors, [key]: e.target.value })}
                onBlur={(e) => e.target.value && setAncestors({ ...ancestors, [key]: nameToDevanagari(e.target.value) })}
                placeholder="नाम"
              />
            </label>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
        <button type="submit" className="btn" disabled={!ready}>Save my details</button>
        <span className="sub">🔒 Saved only on this device — never sent anywhere.</span>
      </div>
    </form>
  );
}
