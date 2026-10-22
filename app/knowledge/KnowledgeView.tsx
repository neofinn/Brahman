"use client";

import { useEffect, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { RitualGuide } from "@/components/RitualGuide";
import { setLearnedKnowledge } from "@/lib/finder";
import { getKriya } from "@/lib/kriyas";
import type { LearnedEntry } from "@/lib/learned";
import { formatDate } from "@/lib/time";

export function KnowledgeView() {
  const [entries, setEntries] = useState<LearnedEntry[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then((d: { entries: LearnedEntry[] }) => {
        setLearnedKnowledge(d.entries);
        setEntries([...d.entries].reverse());
      })
      .catch(() => setEntries([]));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    setError(null);
    const res = await fetch(`/api/knowledge?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { "x-admin-token": token } });
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Could not remove the entry.");
    else load();
  };

  return (
    <main>
      <div className="container">
        <h1>Learned Knowledge</h1>
        <p className="lede">
          When someone asks Brahman something its built-in granth does not cover, it searches with AI and adds the answer
          here. From then on every user gets that answer instantly, offline. Learned entries are marked ✨ — verify them
          with your purohit, and remove any that are wrong.
        </p>
        <div className="form-row">
          <label>
            Admin token (needed to remove entries)
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="BRAHMAN_ADMIN_TOKEN" />
          </label>
        </div>
        {error && <p className="bad">{error}</p>}
        {entries === null ? (
          <p>Loading…</p>
        ) : entries.length === 0 ? (
          <p>Nothing learned yet. Ask Brahman a question its granth does not cover.</p>
        ) : (
          <div className="timeline">
            {entries.map((e) => (
              <div key={e.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <span className="tag learned">{e.kind === "ritual" ? "Vidhi" : "Article"}</span>{" "}
                    <strong>{e.title}</strong>
                    <div className="sub">Asked: “{e.question}” · {formatDate(new Date(e.createdAt))}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="chip" onClick={() => setOpen(open === e.id ? null : e.id)}>{open === e.id ? "Hide" : "View"}</button>
                    <button type="button" className="chip" disabled={!token} onClick={() => remove(e.id)}>Remove</button>
                  </div>
                </div>
                {open === e.id && (
                  <div style={{ marginTop: 12 }}>
                    {e.kind === "ritual" ? (getKriya(e.id) && <RitualGuide kriya={getKriya(e.id)!} compact />) : <ArticleCard id={e.id} />}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
