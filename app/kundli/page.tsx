import type { Metadata } from "next";
import { KundliView } from "./KundliView";

export const metadata: Metadata = { title: "Janma Kundli — Brahman" };

export default function KundliPage() {
  return <KundliView />;
}
