import type { Metadata } from "next";
import { KnowledgeView } from "./KnowledgeView";

export const metadata: Metadata = { title: "Learned Knowledge — Brahman" };

export default function KnowledgePage() {
  return <KnowledgeView />;
}
