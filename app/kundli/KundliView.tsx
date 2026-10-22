"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { computeKundli, formatDegrees, RASHIS, RASHIS_DEVANAGARI, type Kundli } from "@/lib/jyotish";
import { KUNDLI_HANDOFF_KEY } from "@/lib/handoff";
import { PLACES, formatDate, zonedToUtc, type Place } from "@/lib/time";
import { PlacePicker } from "@/components/PlacePicker";

// South Indian chart: signs are fixed around the edge of a 4×4 grid, starting with Meena at top-left.
const SIGN_CELLS: Record<number, [row: number, col: number]> = {
  11: [1, 1], 0: [1, 2], 1: [1, 3], 2: [1, 4],
  10: [2, 1], 3: [2, 4],
  9: [3, 1], 4: [3, 4],
  8: [4, 1], 7: [4, 2], 6: [4, 3], 5: [4, 4],
};

const ABBR: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

function summarise(k: Kundli, name: string, date: string, time: string, place: Place): string {
  const now = Date.now();
  const current = k.dashas.find((d) => d.start.getTime() <= now && now < d.end.getTime());
  const lines = [
    `Please read my birth chart${name ? ` (name: ${name})` : ""}.`,
    `Birth: ${date} at ${time} (${place.timeZone}), ${place.name} (${place.latitude}, ${place.longitude}).`,
    `Lagna: ${k.lagna.rashi.name} ${formatDegrees(k.lagna.rashi.degree)}, ${k.lagna.nakshatra.name} pada ${k.lagna.nakshatra.pada}.`,
    "Grahas (sidereal, Lahiri; whole-sign houses):",
    ...k.grahas.map(
      (g) => `- ${g.name} (${g.sanskrit}): ${g.rashi.name} ${formatDegrees(g.rashi.degree)}, house ${g.house}, ${g.nakshatra.name} pada ${g.nakshatra.pada}${g.retrograde && g.name !== "Rahu" && g.name !== "Ketu" ? ", retrograde" : ""}`,
    ),
    "Vimshottari mahadashas:",
    ...k.dashas.map((d) => `- ${d.lord}: ${formatDate(d.start)} to ${formatDate(d.end)}`),
    current ? `Current mahadasha: ${current.lord}.` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export function KundliView() {
  const router = useRouter();
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

  const askBrahman = () => {
    if (!kundli) return;
    sessionStorage.setItem(KUNDLI_HANDOFF_KEY, summarise(kundli, name, date, time, place));
    router.push("/chat?mode=kundli");
  };

  const now = Date.now();
  const bySign = new Map<number, string[]>();
  kundli?.grahas.forEach((g) => {
    const list = bySign.get(g.rashi.index) ?? [];
    list.push(`${ABBR[g.name]}${g.retrograde && g.name !== "Rahu" && g.name !== "Ketu" ? "ᴿ" : ""} ${Math.floor(g.rashi.degree)}°`);
    bySign.set(g.rashi.index, list);
  });

  return (
    <main>
      <div className="container">
        <h1>Janma Kundli</h1>
        <p className="lede">
          Your sidereal birth chart (Lahiri ayanamsa, whole-sign houses) with nakshatras and Vimshottari dasha. Your
          birth details stay in your browser unless you ask Brahman for a reading.
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
            <div className="two-col">
              <div className="chart" role="img" aria-label="South Indian style rashi chart">
                {Object.entries(SIGN_CELLS).map(([sign, [row, col]]) => {
                  const idx = Number(sign);
                  return (
                    <div
                      key={sign}
                      className={`cell${idx === kundli.lagna.rashi.index ? " lagna" : ""}`}
                      style={{ gridRow: row, gridColumn: col }}
                    >
                      <div className="sign">{RASHIS[idx]} <span className="deva">{RASHIS_DEVANAGARI[idx]}</span></div>
                      {(bySign.get(idx) ?? []).map((p) => <span key={p} className="planet">{p}</span>)}
                    </div>
                  );
                })}
                <div className="center">
                  <div>
                    <div className="deva" style={{ fontSize: "1.4rem" }}>राशि चक्र</div>
                    <div>{name || "Rashi chart"}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Lagna {kundli.lagna.rashi.name}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
                <div className="card">
                  <h3>Key points</h3>
                  <p>Lagna: <strong>{kundli.lagna.rashi.name}</strong> {formatDegrees(kundli.lagna.rashi.degree)}</p>
                  <p>Moon sign (rashi): <strong>{kundli.grahas[1].rashi.name}</strong></p>
                  <p>Janma nakshatra: <strong>{kundli.grahas[1].nakshatra.name}</strong> pada {kundli.grahas[1].nakshatra.pada}</p>
                  <p>Sun sign (sidereal): <strong>{kundli.grahas[0].rashi.name}</strong></p>
                  <p style={{ fontSize: "0.8rem" }}>Ayanamsa {formatDegrees(kundli.ayanamsa)}</p>
                </div>
                <button className="btn" onClick={askBrahman}>🙏 Ask Brahman for a reading</button>
              </div>
            </div>

            <section className="section">
              <h2>Graha positions</h2>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>House</th><th>Nakshatra</th><th>Pada</th></tr>
                  </thead>
                  <tbody>
                    {kundli.grahas.map((g) => (
                      <tr key={g.name}>
                        <td>{g.name} <span className="deva">({g.sanskrit})</span>{g.retrograde && g.name !== "Rahu" && g.name !== "Ketu" ? " ᴿ" : ""}</td>
                        <td>{g.rashi.name}</td>
                        <td>{formatDegrees(g.rashi.degree)}</td>
                        <td>{g.house}</td>
                        <td>{g.nakshatra.name}</td>
                        <td>{g.nakshatra.pada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="section">
              <h2>Vimshottari mahadasha</h2>
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Lord</th><th>From</th><th>To</th></tr></thead>
                  <tbody>
                    {kundli.dashas.map((d) => {
                      const current = d.start.getTime() <= now && now < d.end.getTime();
                      return (
                        <tr key={d.lord} style={current ? { fontWeight: 700, color: "var(--saffron-strong)" } : undefined}>
                          <td>{d.lord}{current ? " (current)" : ""}</td>
                          <td>{formatDate(d.start)}</td>
                          <td>{formatDate(d.end)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
