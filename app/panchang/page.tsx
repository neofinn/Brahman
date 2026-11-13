import type { Metadata } from "next";
import { PanchangView } from "./PanchangView";

export const metadata: Metadata = { title: "Panchang — Brahman" };

export default function PanchangPage() {
  return <PanchangView />;
}
