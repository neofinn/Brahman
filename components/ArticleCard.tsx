import { getArticle } from "@/lib/learned";
import { Markdown } from "./Markdown";

export function ArticleCard({ id }: { id: string }) {
  const a = getArticle(id);
  if (!a) return <p>This entry is no longer in Brahman&apos;s knowledge.</p>;
  return (
    <div className="article">
      <span className="tag learned" title="Learned through an AI search and added to Brahman's knowledge">✨ Learned</span>
      {a.devanagari && <span className="deva tag" style={{ marginLeft: 6 }}>{a.devanagari}</span>}
      <h2 style={{ margin: "8px 0 4px" }}>{a.title}</h2>
      {a.summary && <p style={{ marginTop: 0 }}><em>{a.summary}</em></p>}
      <Markdown>{a.body}</Markdown>
      {a.sources.length > 0 && <p className="sub">Sources: {a.sources.join("; ")}</p>}
    </div>
  );
}
