"use client";

import { useState } from "react";
import { PLACES, type Place } from "@/lib/time";

const CUSTOM = "__custom__";

export function PlacePicker({ value, onChange, label = "Place" }: { value: Place; onChange: (p: Place) => void; label?: string }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPreset = PLACES.some((p) => p.name === value.name);

  const locate = () => {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }
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
        setError("Could not get your location — choose a city instead.");
      },
    );
  };

  return (
    <>
      <label>
        {label}
        <select
          value={isPreset ? value.name : CUSTOM}
          onChange={(e) => {
            const p = PLACES.find((x) => x.name === e.target.value);
            if (p) onChange(p);
          }}
        >
          {!isPreset && <option value={CUSTOM}>{value.name} ({value.latitude}, {value.longitude})</option>}
          {PLACES.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
      </label>
      <button type="button" className="btn secondary" onClick={locate} disabled={locating}>
        {locating ? "Locating…" : "📍 Use my location"}
      </button>
      {error && <p className="bad" style={{ flexBasis: "100%", margin: 0 }}>{error}</p>}
    </>
  );
}
