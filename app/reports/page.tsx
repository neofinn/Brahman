import type { Metadata } from "next";
import { ReportsView } from "./ReportsView";

export const metadata: Metadata = {
  title: "Vedic Astrology Reports — Kundli, Career, Dhan, Marriage, Gemstone | Brahman",
  description: "Get your personalised Vedic kundli report as a PDF: complete kundli, career, dhan (wealth), marriage, gemstone, health, Lal Kitab, numerology, kundli milan and more — prepared instantly from your birth details.",
};

export default function ReportsPage() {
  return <ReportsView />;
}
