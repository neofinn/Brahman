"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { computeKundli, formatDegrees, type Kundli } from "@/lib/jyotish";
import { KUNDLI_HANDOFF_KEY } from "@/lib/handoff";
import { PLACES, formatDate, zonedToUtc, type Place } from "@/lib/time";
import { PlacePicker } from "@/components/PlacePicker";
import { KundliReport } from "@/components/KundliReport";
import { useAiAvailable } from "@/components/useAi";

function summarise(k: Kundli, name: string, date: string, time: string, place: Place): string {
  const lines = [
    `Please read my birth chart${name ? ` (name: ${name})` : ""}.`,
    `Birth: ${date} at ${time} (${place.timeZone}), ${place.name} (${place.latitude}, ${place.longitude}).`,
    `Lagna: ${k.lagna.rashi.name} ${formatDegrees(k.lagna.rashi.degree)}, ${k.lagna.nakshatra.name} pada ${k.lagna.nakshatra.pada}.`,
    "Grahas (sidereal, Lahiri; whole-sign houses):",
    ...k.grahas.map(
      (g) => `- ${g.name}: ${g.rashi.name} ${formatDegrees(g.rashi.degree)}, house ${g.house}, ${g.nakshatra.name} pada ${g.nakshatra.pada}${g.retrograde && g.name !== "Rahu" && g.name !== "Ketu" ? ", retrograde" : ""}`,
    ),
    "Vimshottari mahadashas:",
    ...k.dashas.map((d) => `- ${d.lord}: ${formatDate(d.start)} to ${formatDate(d.end)}`),
  ];
  return lines.join("\n");
}

export function KundliView() {
  const router = useRouter();
  const ai = useAiAvailable();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState<Place>(PLACES[1]);
  const [gender, setGender] = useState<"" | "m" | "f">("");
  const [computed, setComputed] = useState<{ date: string; time: string; place: Place; gender?: "m" | "f" } | null>(null);
  const [kundli, setKundli] = useState<Kundli | null>(null);

  const compute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setKundli(computeKundli(zonedToUtc(date, time, place.timeZone), place));
    setComputed({ date, time, place, gender: gender || undefined });
  };

  const askAi = () => {
    if (!kundli) return;
    sessionStorage.setItem(KUNDLI_HANDOFF_KEY, summarise(kundli, name, date, time, place));
    router.push("/chat?mode=kundli");
  };

  return (
    <main>
      <div className="container">
        <h1>Janma Kundli</h1>
        <p className="lede">
          Enter your birth details and search your birthplace. Brahman draws your chart in North or South Indian style and reads it
          in every major system — Parashari (Brihat Parashara Hora Shastra, all 16 divisional charts), Jaimini, KP, Lal Kitab,
          Bhrigu Nandi Nadi, Chaldean numerology and Lo Shu — with predictions, your life so far, final observations from all of
          them together, and a downloadable PDF report. Everything is computed on your device.
        </p>

        <form className="form-row" onSubmit={compute}>
          <label>
            Name (optional)
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun" />
          </label>
          <label>
            Date of birth
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Time of birth
            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <label>
            Gender (for Nadi reading)
            <select value={gender} onChange={(e) => setGender(e.target.value as "" | "m" | "f")}>
              <option value="">Prefer not to say</option>
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </label>
          <PlacePicker value={place} onChange={setPlace} label="Place of birth" />
          <button type="submit" className="btn">Create kundli</button>
        </form>

        {kundli && (
          <>
            <KundliReport
              kundli={kundli}
              name={name}
              birth={computed ?? undefined}
              onRecompute={(t) => {
                if (!computed) return;
                setTime(t);
                setKundli(computeKundli(zonedToUtc(computed.date, t, computed.place.timeZone), computed.place));
                setComputed({ ...computed, time: t });
              }}
            />
            {ai && (
              <p><button className="btn secondary" onClick={askAi}>✨ Ask AI for a conversational reading</button></p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
