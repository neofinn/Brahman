"use client";

import { useEffect, useRef, useState } from "react";
import type { Mantra } from "@/lib/ritual-common";
import { recite, speechSupported } from "@/lib/speech";

export function MantraBlock({ mantra, title }: { mantra: Mantra; title?: string }) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null); // total repetitions while playing
  const [count, setCount] = useState(0);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setSupported(speechSupported());
    return () => stopRef.current?.();
  }, []);

  const start = (times: number) => {
    stopRef.current?.();
    setCount(0);
    setPlaying(times);
    stopRef.current = recite(mantra.devanagari, times, setCount, () => {
      setPlaying(null);
      stopRef.current = null;
    });
  };

  return (
    <div className="mantra">
      {title && <div className="mantra-title">{title}</div>}
      <div className="deva">{mantra.devanagari}</div>
      <div className="iast">{mantra.iast}</div>
      <div className="meaning">{mantra.meaning}</div>
      {(mantra.source || mantra.count) && (
        <div className="iast">
          {mantra.source && <>— {mantra.source}</>}
          {mantra.source && mantra.count && " · "}
          {mantra.count && <>Recite: {mantra.count}</>}
        </div>
      )}
      {supported && (
        <div className="recite">
          {playing ? (
            <button type="button" className="chip" onClick={() => stopRef.current?.()}>
              ⏹ Stop {playing > 1 ? `(${count}/${playing})` : ""}
            </button>
          ) : (
            <>
              <button type="button" className="chip" onClick={() => start(1)}>🔊 Recite</button>
              <button type="button" className="chip" onClick={() => start(11)}>🔁 Japa ×11</button>
              <button type="button" className="chip" onClick={() => start(108)}>📿 ×108</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
