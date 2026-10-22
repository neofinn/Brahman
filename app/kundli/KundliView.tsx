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
  const [kundli, setKundli] = useState<Kundli | null>(null);

  const compute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    setKundli(computeKundli(zonedToUtc(date, time, place.timeZone), place));
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
          Enter your birth details and Brahman prepares your sidereal birth chart with a full reading — lagna, rashi,
          nakshatra, yogas, doshas, dashas and remedies. Everything is computed on your device.
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
          <PlacePicker value={place} onChange={setPlace} label="Place of birth" />
          <button type="submit" className="btn">Create kundli</button>
        </form>

        {kundli && (
          <>
            <KundliReport kundli={kundli} name={name} />
            {ai && (
              <p><button className="btn secondary" onClick={askAi}>✨ Ask AI for a conversational reading</button></p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
