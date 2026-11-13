import type { Metadata } from "next";
import { SiddhisView } from "./SiddhisView";

export const metadata: Metadata = { title: "Siddhis — Brahman" };

export default function SiddhisPage() {
  return <SiddhisView />;
}
