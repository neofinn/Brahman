"use client";
// The person's details for sankalpas, kept only in this browser (never sent to the server).
import { useEffect, useState } from "react";
import type { Profile } from "./sankalpa";

const KEY = "brahman:profile";
const EVENT = "brahman-profile";

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile | null): void {
  try {
    if (profile) localStorage.setItem(KEY, JSON.stringify(profile));
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** The saved profile, kept in sync across every component on the page. */
export function useProfile(): [Profile | null, boolean] {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const sync = () => setProfile(loadProfile());
    sync();
    setLoaded(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [profile, loaded];
}
