"use client";

import { useEffect, useMemo, useState } from "react";
import { computeKundli, type Kundli } from "@/lib/jyotish";
import { FREE_REPORT, REPORTS, type ReportDef } from "@/lib/reports";
import { isStaticBuild } from "@/lib/speech";
import { PLACES, zonedToUtc, type Place } from "@/lib/time";
import { buildKundliPdf, reportFilename, saveFile } from "./KundliPdf";
import { buildMilanPdf, type PersonBirth } from "./MilanPdf";
import { PlacePicker } from "./PlacePicker";
import type { BirthInfo } from "./KundliReport";

type Mode = "razorpay" | "test" | "off" | "static" | "loading";
const PURCHASES_KEY = "brahman:purchases";

interface Person {
  name: string;
  date: string;
  time: string;
  place: Place;
  gender: "" | "m" | "f";
}
const blank = (): Person => ({ name: "", date: "", time: "", place: PLACES[1], gender: "" });
const complete = (p: Person) => Boolean(p.date && p.time);

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const personKey = (p: { name: string; date: string; time: string; place: Place }) => `${p.name.trim().toLowerCase()}|${p.date}|${p.time}|${p.place.latitude.toFixed(3)}|${p.place.longitude.toFixed(3)}`;

function loadPurchases(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PURCHASES_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function savePurchase(key: string, token: string) {
  try {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify({ ...loadPurchases(), [key]: token }));
  } catch {}
}

interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
type RazorpayCtor = new (o: Record<string, unknown>) => { open: () => void; on: (e: string, f: (r: { error?: { description?: string } }) => void) => void };

function loadRazorpay(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay did not load.")));
    s.onerror = () => reject(new Error("Could not reach the payment page. Check your connection."));
    document.body.appendChild(s);
  });
}

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function PersonFields({ legend, value, onChange, gender = true }: { legend: string; value: Person; onChange: (p: Person) => void; gender?: boolean }) {
  return (
    <fieldset className="store-person">
      <legend>{legend}</legend>
      <label>Name<input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="Full name" /></label>
      <label>Date of birth<input type="date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} /></label>
      <label>Time of birth<input type="time" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} /></label>
      {gender && (
        <label>Gender
          <select value={value.gender} onChange={(e) => onChange({ ...value, gender: e.target.value as Person["gender"] })}>
            <option value="">Prefer not to say</option><option value="m">Male</option><option value="f">Female</option>
          </select>
        </label>
      )}
      <PlacePicker value={value.place} onChange={(place) => onChange({ ...value, place })} label="Place of birth" />
    </fieldset>
  );
}

/**
 * The report store: every paid report with its price, bought through Razorpay and generated on the device.
 * With `kundli` and `birth` it is prefilled (inside a kundli); otherwise it asks for birth details.
 * `free` (inside the Brahman app, and in the single-file beta) makes every report a free download; only the
 * website's /reports sales page charges.
 */
export function ReportStore({ kundli, birth, name: givenName, free = false }: { kundli?: Kundli; birth?: BirthInfo; name?: string; free?: boolean }) {
  const [mode, setMode] = useState<Mode>("loading");
  const [person, setPerson] = useState<Person>(() => (birth ? { name: givenName ?? "", date: birth.date, time: birth.time, place: birth.place, gender: birth.gender ?? "" } : blank()));
  const [partner, setPartner] = useState<Person>(blank);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; text: string; ok?: boolean } | null>(null);
  const [owned, setOwned] = useState<Record<string, string>>({});
  const [subjects, setSubjects] = useState<{ one: string; two: string }>({ one: "", two: "" });

  useEffect(() => {
    setOwned(loadPurchases());
    if (free || isStaticBuild()) return setMode("static");
    fetch("/api/pay/config").then((r) => r.json()).then((j: { mode: Mode }) => setMode(j.mode)).catch(() => setMode("off"));
  }, []);
  useEffect(() => {
    (async () => setSubjects({ one: complete(person) ? await sha256(personKey(person)) : "", two: complete(person) && complete(partner) ? await sha256(`${personKey(person)}#${personKey(partner)}`) : "" }))();
  }, [person, partner]);

  const k = useMemo(() => (kundli && birth ? kundli : complete(person) ? computeKundli(zonedToUtc(person.date, person.time, person.place.timeZone), person.place) : null), [kundli, birth, person]);
  const birthInfo: BirthInfo | null = complete(person) ? { date: person.date, time: person.time, place: person.place, gender: person.gender || undefined } : null;

  const generate = async (r: ReportDef) => {
    if (r.kind === "milan") {
      const toP = (p: Person): PersonBirth => ({ name: p.name, date: p.date, time: p.time, place: p.place });
      const blob = await buildMilanPdf(toP(person), toP(partner));
      await saveFile(blob, reportFilename(r.title, `${person.name || "Boy"}-${partner.name || "Girl"}`, person.date));
    } else {
      const blob = await buildKundliPdf(k!, person.name || undefined, birthInfo!, r.id);
      await saveFile(blob, reportFilename(r.title, person.name, person.date));
    }
  };

  const buy = async (r: ReportDef) => {
    setMessage(null);
    const subject = r.kind === "milan" ? subjects.two : subjects.one;
    if (!subject || (r.kind === "milan" && !complete(partner))) {
      setMessage({ id: r.id, text: r.kind === "milan" ? "Enter the birth details of both partners above first." : "Enter the birth date and time above first." });
      document.getElementById("store-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const key = `${r.id}:${subject}`;
    setBusy(r.id);
    try {
      if (gratis || r.price === 0 || owned[key]) {
        await generate(r);
        setMessage({ id: r.id, text: "✓ Your report is downloading.", ok: true });
        return;
      }
      const order = await fetch("/api/pay/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId: r.id }) }).then(async (res) => {
        const j = await res.json();
        if (!res.ok) throw new Error(j.error ?? "Could not start the payment.");
        return j as { mode: Mode; orderId: string; amount: number; currency: string; keyId?: string; ticket: string };
      });
      const verify = async (paymentId?: string, signature?: string) => {
        const res = await fetch("/api/pay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.orderId, reportId: r.id, ticket: order.ticket, subject, paymentId, signature }) });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error ?? "Payment could not be verified.");
        savePurchase(key, j.token);
        setOwned(loadPurchases());
        await generate(r);
        setMessage({ id: r.id, text: "✓ Payment received — your report is downloading. You can download it again here any time on this device.", ok: true });
      };
      if (order.mode === "test") {
        await verify();
        return;
      }
      const Razorpay = await loadRazorpay();
      await new Promise<void>((resolve, reject) => {
        const rz = new Razorpay({
          key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
          name: "Brahman", description: r.title, prefill: { name: person.name }, notes: { report: r.id },
          theme: { color: "#e8730c" },
          handler: (resp: RazorpayResponse) => verify(resp.razorpay_payment_id, resp.razorpay_signature).then(resolve, reject),
          modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
        });
        rz.on("payment.failed", (e) => reject(new Error(e.error?.description ?? "Payment failed.")));
        rz.open();
      });
    } catch (e) {
      setMessage({ id: r.id, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const gratis = free || mode === "static";
  const needsPartner = true;
  const card = (r: ReportDef) => {
    const subject = r.kind === "milan" ? subjects.two : subjects.one;
    const has = Boolean(owned[`${r.id}:${subject}`]);
    const canPay = mode === "razorpay" || mode === "test";
    return (
      <div key={r.id} className={`card report-card${r.popular ? " popular" : ""}`}>
        {r.popular && <span className="report-badge">Popular</span>}
        <h3>{r.title}</h3>
        <p className="deva sub" style={{ marginTop: 0 }}>{r.hindi}</p>
        <p>{r.tagline}</p>
        <ul className="factors">{r.includes.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className="report-price">{gratis || r.price === 0 ? "Free" : rupees(r.price)} {!gratis && r.mrp && <s className="sub">{rupees(r.mrp)}</s>}</p>
        {gratis || r.price === 0 || has ? (
          <button type="button" className="btn" disabled={busy !== null} onClick={() => buy(r)}>{busy === r.id ? "Preparing…" : has && !gratis ? "⬇ Download again" : "⬇ Download free"}</button>
        ) : canPay ? (
          <button type="button" className="btn" disabled={busy !== null} onClick={() => buy(r)}>{busy === r.id ? "Processing…" : `Buy & download — ${rupees(r.price)}`}</button>
        ) : (
          <button type="button" className="btn secondary" disabled>{mode === "loading" ? "…" : "Coming soon"}</button>
        )}
        {message?.id === r.id && <p className={message.ok ? "good" : "bad"}>{message.text}</p>}
      </div>
    );
  };

  return (
    <div className="report-store">
      {!(kundli && birth) && (
        <section id="store-details" className="section" style={{ marginTop: 0 }}>
          <h2>Your birth details</h2>
          <div className="milan-forms">
            <PersonFields legend="You" value={person} onChange={setPerson} />
            {needsPartner && <PersonFields legend="Partner (only for Kundli Milan)" value={partner} onChange={setPartner} gender={false} />}
          </div>
          <p className="sub">Reports are prepared on your device from your exact birth time and place. Your details are not stored on our server.</p>
        </section>
      )}
      {kundli && birth && (
        <div id="store-details">
          <p className="sub">For {givenName || "this chart"} · {birth.date}, {birth.time}, {birth.place.name}. For the Kundli Milan report, open Reports in the menu.</p>
        </div>
      )}
      {mode === "test" && <p className="sub" style={{ color: "var(--gold)" }}>Test mode: purchases complete without charging. Turn REPORTS_TEST_MODE off before going live.</p>}
      {mode === "off" && <p className="sub">Online payment is being set up. The free basic kundli is available now.</p>}
      <div className="grid report-grid">
        {card(FREE_REPORT)}
        {REPORTS.filter((r) => !(kundli && birth && r.kind === "milan")).map(card)}
      </div>
      <p className="sub">
        {gratis
          ? "Every report is free in the Brahman app. Jyotisha describes tendencies, not fate."
          : "Payments are processed securely by Razorpay (UPI, cards, netbanking, wallets). A purchased report can be downloaded again on the same device. Jyotisha describes tendencies, not fate."}
      </p>
    </div>
  );
}
