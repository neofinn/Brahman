"use client";

import { useEffect, useId, useRef, useState } from "react";
import { placeLabel, searchPlaces, searchPlacesOnline, TIME_ZONES, type PlaceResult } from "@/lib/places";
import { isStaticBuild } from "@/lib/speech";
import type { Place } from "@/lib/time";

/** Search any town or city; fills latitude, longitude and time zone. Coordinates can also be entered by hand. */
export function PlacePicker({ value, onChange, label = "Place" }: { value: Place; onChange: (p: Place) => void; label?: string }) {
  const id = useId();
  const [query, setQuery] = useState(placeLabel(value));
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [active, setActive] = useState(0);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [manual, setManual] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => setOnline(!isStaticBuild()), []);
  useEffect(() => setQuery(placeLabel(value)), [value]);

  const search = (q: string) => {
    setQuery(q);
    setOpen(true);
    setActive(0);
    const local = searchPlaces(q);
    setResults(local);
    abortRef.current?.abort();
    if (!online || q.trim().length < 3) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setSearchingOnline(true);
    window.setTimeout(() => {
      if (controller.signal.aborted) return;
      searchPlacesOnline(q, controller.signal)
        .then((more) => {
          if (controller.signal.aborted) return;
          const seen = new Set(local.map((p) => `${p.name}|${p.latitude.toFixed(1)}|${p.longitude.toFixed(1)}`));
          setResults([...local, ...more.filter((p) => !seen.has(`${p.name}|${p.latitude.toFixed(1)}|${p.longitude.toFixed(1)}`))].slice(0, 10));
        })
        .catch(() => undefined)
        .finally(() => !controller.signal.aborted && setSearchingOnline(false));
    }, 350);
  };

  const choose = (p: PlaceResult) => {
    onChange({ name: p.name, region: p.region, latitude: p.latitude, longitude: p.longitude, timeZone: p.timeZone });
    setOpen(false);
    setError(null);
  };

  const locate = () => {
    if (!navigator.geolocation) return setError("Location is not available in this browser — search for your town instead.");
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({
          name: "My location",
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      },
      () => {
        setLocating(false);
        setError("Could not get your location — search for your town instead.");
      },
    );
  };

  return (
    <div className="place-search">
      <label htmlFor={`${id}-q`}>{label}</label>
      <div className="combo">
        <input
          id={`${id}-q`}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder="Type a town or city…"
          onFocus={(e) => e.target.select()}
          onChange={(e) => search(e.target.value)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (!open || !results.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
            else if (e.key === "Enter") { e.preventDefault(); choose(results[active]); }
            else if (e.key === "Escape") setOpen(false);
          }}
        />
        {open && query.trim().length >= 2 && (
          <ul id={`${id}-list`} role="listbox" className="combo-list">
            {results.map((p, i) => (
              <li
                key={`${p.name}-${p.latitude}-${p.longitude}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : ""}
                onMouseDown={(e) => { e.preventDefault(); choose(p); }}
                onMouseEnter={() => setActive(i)}
              >
                <strong>{p.name}</strong> <span className="sub">{p.region}</span>
              </li>
            ))}
            {!results.length && !searchingOnline && (
              <li className="empty">No match. Try a nearby larger town, or enter the coordinates.</li>
            )}
            {searchingOnline && <li className="empty">Searching online…</li>}
          </ul>
        )}
      </div>
      <div className="place-meta">
        <span className="sub">
          {Math.abs(value.latitude).toFixed(2)}°{value.latitude >= 0 ? "N" : "S"}, {Math.abs(value.longitude).toFixed(2)}°{value.longitude >= 0 ? "E" : "W"} · {value.timeZone}
        </span>
        {online && (
          <button type="button" className="chip" onClick={locate} disabled={locating}>{locating ? "Locating…" : "📍 My location"}</button>
        )}
        <button type="button" className="chip" onClick={() => setManual(!manual)}>{manual ? "Hide coordinates" : "Enter coordinates"}</button>
      </div>
      {manual && (
        <div className="manual-coords">
          <label>
            Latitude
            <input type="number" step="0.0001" min={-90} max={90} value={value.latitude}
              onChange={(e) => e.target.value !== "" && onChange({ ...value, name: value.name === "My location" ? value.name : "Custom place", region: undefined, latitude: Number(e.target.value) })} />
          </label>
          <label>
            Longitude
            <input type="number" step="0.0001" min={-180} max={180} value={value.longitude}
              onChange={(e) => e.target.value !== "" && onChange({ ...value, name: value.name === "My location" ? value.name : "Custom place", region: undefined, longitude: Number(e.target.value) })} />
          </label>
          <label>
            Time zone
            <select value={value.timeZone} onChange={(e) => onChange({ ...value, timeZone: e.target.value })}>
              {[...new Set([value.timeZone, ...TIME_ZONES])].sort().map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </label>
        </div>
      )}
      {error && <p className="bad" style={{ margin: 0 }}>{error}</p>}
    </div>
  );
}
