"use client";

import { useEffect, useState } from "react";
import { isStaticBuild } from "@/lib/speech";

/** Whether the server has an optional Claude key configured. The app works fully without it. */
export function useAiAvailable(): boolean {
  const [ai, setAi] = useState(false);
  useEffect(() => {
    if (isStaticBuild()) return;
    fetch("/api/chat")
      .then((r) => (r.ok ? r.json() : { ai: false }))
      .then((d: { ai?: boolean }) => setAi(Boolean(d.ai)))
      .catch(() => setAi(false));
  }, []);
  return ai;
}
