"use client";

import { ReportStore } from "@/components/ReportStore";
import { REPORTS } from "@/lib/reports";

const FAQ: [string, string][] = [
  ["How do I get my report?", "Enter your date, time and place of birth, choose a report and pay. The PDF is prepared on your device in about 20 seconds and downloads immediately."],
  ["Which systems are used?", "Parashari (Brihat Parashara Hora Shastra) with Lahiri ayanamsa, Jaimini, KP, Lal Kitab, Bhrigu Nandi Nadi, Chaldean numerology and Lo Shu. The complete report combines all of them."],
  ["I don't know my exact birth time.", "Give your best estimate. The Life So Far report lets you check the chart against your past, and the Brahman app can test your birth time against events you remember."],
  ["Can I download it again?", "Yes — on the same device, a purchased report shows “Download again” for the same birth details."],
  ["Is my data safe?", "Your birth details stay on your device; the report is generated in your browser. Payments are handled by Razorpay — we never see your card or UPI details."],
  ["Are predictions guaranteed?", "No. Jyotisha describes tendencies, not fate. Reports apply classical rules; for major decisions also consult an experienced jyotishi."],
];

export function ReportsView() {
  return (
    <main>
      <div className="container">
        <section className="reports-hero">
          <span className="deva tag">वैदिक ज्योतिष रिपोर्ट</span>
          <h1>Get your Vedic astrology report</h1>
          <p className="lede">
            Personalised PDF reports from your kundli — in plain words, with dates and ages. Career, dhan, marriage, gemstones,
            health, doshas and remedies, or everything in one complete report. {REPORTS.length} reports, ready in seconds.
          </p>
          <div className="reports-points">
            <span>✓ Instant PDF download</span><span>✓ Seven systems cross-checked</span><span>✓ Remedies, deities and gemstones</span><span>✓ Free basic kundli</span>
          </div>
        </section>
        <ReportStore />
        <section className="section">
          <h2>Questions</h2>
          {FAQ.map(([q, a]) => <details key={q} className="faq"><summary><strong>{q}</strong></summary><p>{a}</p></details>)}
        </section>
      </div>
    </main>
  );
}
