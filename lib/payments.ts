// Server-side payments for paid reports, with Razorpay (cards, UPI, netbanking, wallets; international cards when
// enabled on the account). Stateless: a signed ticket ties each order to its report and price, and a signed unlock token
// ties each purchase to one report for one birth chart.
import { createHmac, timingSafeEqual } from "node:crypto";
import { getReport, pricePaise } from "./reports.ts";

export type PayEnv = Record<string, string | undefined> & {
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  REPORT_TOKEN_SECRET?: string;
  /** "1" lets the site owner test the whole flow without charging (never enable on a live site). */
  REPORTS_TEST_MODE?: string;
};

export type PayMode = "razorpay" | "test" | "off";

export function payMode(env: PayEnv = process.env): PayMode {
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) return "razorpay";
  if (env.REPORTS_TEST_MODE === "1" && env.REPORT_TOKEN_SECRET) return "test";
  return "off";
}

const secret = (env: PayEnv) => env.REPORT_TOKEN_SECRET || env.RAZORPAY_KEY_SECRET || "";
const hmac = (key: string, data: string) => createHmac("sha256", key).update(data).digest("hex");
const b64 = (s: string) => Buffer.from(s).toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** A ticket proves the server created this order for this report at this price. */
export function orderTicket(env: PayEnv, orderId: string, reportId: string, amount: number): string {
  return hmac(secret(env), `ticket|${orderId}|${reportId}|${amount}`);
}

export interface OrderResult {
  mode: PayMode;
  orderId: string;
  amount: number;
  currency: "INR";
  keyId?: string;
  ticket: string;
  reportId: string;
}

export async function createOrder(env: PayEnv, reportId: string, fetcher: typeof fetch = fetch): Promise<OrderResult> {
  const report = getReport(reportId);
  if (!report || report.price <= 0) throw new Error("Unknown report.");
  const amount = pricePaise(report);
  const mode = payMode(env);
  if (mode === "off") throw new Error("Payments are not configured.");
  let orderId: string;
  if (mode === "razorpay") {
    const res = await fetcher("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")}` },
      body: JSON.stringify({ amount, currency: "INR", receipt: `brahman_${reportId}_${Date.now()}`.slice(0, 40), notes: { reportId } }),
    });
    if (!res.ok) throw new Error(`Razorpay order failed (${res.status}).`);
    orderId = ((await res.json()) as { id: string }).id;
  } else {
    orderId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return { mode, orderId, amount, currency: "INR", keyId: mode === "razorpay" ? env.RAZORPAY_KEY_ID : undefined, ticket: orderTicket(env, orderId, reportId, amount), reportId };
}

export interface VerifyInput {
  orderId: string;
  reportId: string;
  ticket: string;
  subject: string; // hash of the birth details the report is for
  paymentId?: string;
  signature?: string;
}

/** Verifies the payment (Razorpay signature, or test mode) and returns an unlock token for this report and chart. */
export function verifyPayment(env: PayEnv, input: VerifyInput, now = Date.now()): string {
  const report = getReport(input.reportId);
  if (!report || report.price <= 0) throw new Error("Unknown report.");
  if (!safeEqual(orderTicket(env, input.orderId, input.reportId, pricePaise(report)), input.ticket)) throw new Error("This order does not match the report.");
  const mode = payMode(env);
  if (mode === "razorpay") {
    if (!input.paymentId || !input.signature) throw new Error("Payment details missing.");
    const expected = hmac(env.RAZORPAY_KEY_SECRET!, `${input.orderId}|${input.paymentId}`);
    if (!safeEqual(expected, input.signature)) throw new Error("Payment could not be verified.");
  } else if (mode !== "test" || !input.orderId.startsWith("test_")) {
    throw new Error("Payments are not configured.");
  }
  return issueToken(env, input.reportId, input.subject, now);
}

const TOKEN_DAYS = 365;

export function issueToken(env: PayEnv, reportId: string, subject: string, now = Date.now()): string {
  const body = b64(JSON.stringify({ r: reportId, s: subject, e: now + TOKEN_DAYS * 86400000 }));
  return `${body}.${hmac(secret(env), `token|${body}`)}`;
}

/** Checks an unlock token (used by the server; the browser only stores it). */
export function checkToken(env: PayEnv, token: string, reportId: string, subject: string, now = Date.now()): boolean {
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEqual(hmac(secret(env), `token|${body}`), sig)) return false;
  try {
    const t = JSON.parse(unb64(body)) as { r: string; s: string; e: number };
    return t.r === reportId && t.s === subject && t.e > now;
  } catch {
    return false;
  }
}
