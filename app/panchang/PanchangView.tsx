"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { computePanchang } from "@/lib/jyotish";
import { PLACES, formatDateTime, formatTime, todayIn, weekdayOf, zonedToUtc, type Place } from "@/lib/time";
import { PlacePicker } from "@/components/PlacePicker";

// Which ritual guide to open for each monthly observance.
const OBSERVANCE_RITUALS: [string, string][] = [
  ["Ekadashi", "ekadashi"],
  ["Purnima", "satyanarayan"],
  ["Amavasya", "tarpan"],
  ["Chaturthi", "ganesh-puja"],
  ["Pradosh", "rudrabhishek"],
  ["Shivaratri", "rudrabhishek"],
  ["Ashtami", "navratri"],
];

export function PanchangView() {
  return (
    <main>
      <div className="container">
        <h1>Panchang</h1>
        <p className="lede">
          The five limbs of the day — vara, tithi, nakshatra, yoga and karana — computed astronomically (Lahiri ayanamsa)
          for your place, with sunrise-based reckoning.
        </p>
        <PanchangPanel />
      </div>
    </main>
  );
}

/** The interactive panchang, also embedded in the Ask Brahman chat. */
export function PanchangPanel() {
  const [place, setPlace] = useState<Place>(PLACES[0]);
  const [date, setDate] = useState<string>("");

  // Today's date depends on the viewer's clock, so set it after mount.
  useEffect(() => setDate(todayIn(place.timeZone)), []);

  const panchang = useMemo(() => {
    if (!date) return null;
    return computePanchang(zonedToUtc(date, "00:00", place.timeZone), weekdayOf(date), place);
  }, [date, place]);

  const tz = place.timeZone;

  return (
    <>
        <div className="form-row">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </label>
          <PlacePicker value={place} onChange={setPlace} />
        </div>

        {panchang && (
          <>
            <div className="limbs">
              <div className="card limb">
                <div className="label">Vara</div>
                <div className="value">{panchang.vaara}</div>
              </div>
              <div className="card limb">
                <div className="label">Tithi</div>
                <div className="value">{panchang.tithi.paksha} {panchang.tithi.name}</div>
                <div className="sub">until {formatDateTime(panchang.tithi.endsAt, tz)}</div>
              </div>
              <div className="card limb">
                <div className="label">Nakshatra</div>
                <div className="value">{panchang.nakshatra.name}</div>
                <div className="sub">pada {panchang.nakshatra.pada} · lord {panchang.nakshatra.lord} · until {formatDateTime(panchang.nakshatra.endsAt, tz)}</div>
              </div>
              <div className="card limb">
                <div className="label">Yoga</div>
                <div className="value">{panchang.yoga.name}</div>
                <div className="sub">until {formatDateTime(panchang.yoga.endsAt, tz)}</div>
              </div>
              <div className="card limb">
                <div className="label">Karana</div>
                <div className="value">{panchang.karana.name}</div>
                <div className="sub">until {formatDateTime(panchang.karana.endsAt, tz)}</div>
              </div>
              <div className="card limb">
                <div className="label">Masa</div>
                <div className="value">{panchang.lunarMonth ? `${panchang.lunarMonth.adhik ? "Adhik " : ""}${panchang.lunarMonth.amanta}` : "—"}</div>
                <div className="sub">
                  amanta{panchang.lunarMonth && panchang.lunarMonth.purnimanta !== panchang.lunarMonth.amanta ? ` · ${panchang.lunarMonth.purnimanta} (purnimanta)` : ""}
                </div>
              </div>
              <div className="card limb">
                <div className="label">Samvat</div>
                <div className="value">Vikram {panchang.vikramSamvat ?? "—"}</div>
                <div className="sub">Shaka {panchang.shakaSamvat ?? "—"}</div>
              </div>
              <div className="card limb">
                <div className="label">Sun · Moon rashi</div>
                <div className="value">{panchang.sunRashi} · {panchang.moonRashi}</div>
              </div>
            </div>

            <div className="two-col">
              <div className="card">
                <h3>Timings</h3>
                <div className="timeline">
                  <div className="row"><span>🌅 Sunrise</span><span>{formatTime(panchang.sunrise, tz)}</span></div>
                  <div className="row"><span>🌇 Sunset</span><span>{formatTime(panchang.sunset, tz)}</span></div>
                  <div className="row"><span>🌙 Moonrise</span><span>{formatTime(panchang.moonrise, tz)}</span></div>
                  <div className="row"><span>Moonset</span><span>{formatTime(panchang.moonset, tz)}</span></div>
                  {panchang.muhurtas.map((m) => (
                    <div className="row" key={m.name}>
                      <span className={m.auspicious ? "good" : "bad"}>{m.auspicious ? "✓" : "✕"} {m.name}</span>
                      <span>{formatTime(m.start, tz)} – {formatTime(m.end, tz)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
                <div className="card">
                  <h3>Observances</h3>
                  {panchang.observances.length ? (
                    <ul className="samagri">
                      {panchang.observances.map((o) => {
                        const id = OBSERVANCE_RITUALS.find(([word]) => o.includes(word))?.[1];
                        return <li key={o}>{id ? <Link href={`/kriyas/${id}`}>{o}</Link> : o}</li>;
                      })}
                    </ul>
                  ) : (
                    <p>No major monthly vrata on this tithi. Ask Brahman about festivals today.</p>
                  )}
                </div>
                <Link className="btn" href="/kriyas">🙏 Find a puja or hawan</Link>
              </div>
            </div>
            <p className="disclaimer" style={{ marginTop: 20, textAlign: "left" }}>
              Times shown in {tz}. Panchangas differ slightly by tradition (drik vs. surya siddhanta, amanta vs.
              purnimanta); for vrata dates follow your sampradaya or local temple.
            </p>
          </>
        )}
    </>
  );
}
