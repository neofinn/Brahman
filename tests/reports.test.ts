import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { FREE_REPORT, getReport, REPORTS } from "../lib/reports.ts";
import { checkToken, createOrder, payMode, verifyPayment } from "../lib/payments.ts";
import { respond } from "../lib/finder.ts";

test("report catalogue is complete and consistent", () => {
  assert.ok(REPORTS.length >= 15);
  assert.equal(new Set(REPORTS.map((r) => r.id)).size, REPORTS.length);
  for (const id of ["complete", "astrology", "career", "dhan", "gemstone", "marriage", "milan"]) assert.ok(getReport(id), id);
  for (const r of REPORTS) {
    assert.ok(r.price > 0 && r.includes.length >= 3 && r.tagline, r.id);
    if (r.mrp) assert.ok(r.mrp > r.price, r.id);
    if (r.kind === "kundli") assert.ok(r.sections.length > 0, r.id);
  }
  assert.equal(FREE_REPORT.price, 0);
  assert.equal(getReport("basic"), FREE_REPORT);
});

test("payments: modes, order tickets, signature check and unlock tokens", async () => {
  assert.equal(payMode({}), "off");
  assert.equal(payMode({ REPORTS_TEST_MODE: "1" }), "off"); // test mode needs a token secret
  assert.equal(payMode({ REPORTS_TEST_MODE: "1", REPORT_TOKEN_SECRET: "s" }), "test");
  const env = { RAZORPAY_KEY_ID: "rzp_test_x", RAZORPAY_KEY_SECRET: "secret", REPORT_TOKEN_SECRET: "tok" };
  assert.equal(payMode(env), "razorpay");
  let sent: { url: string; body: { amount: number; currency: string } } | undefined;
  const fakeFetch = (async (url: string, init: { body: string }) => {
    sent = { url, body: JSON.parse(init.body) };
    return new Response(JSON.stringify({ id: "order_123" }), { status: 200 });
  }) as unknown as typeof fetch;
  const order = await createOrder(env, "career", fakeFetch);
  assert.equal(sent!.url, "https://api.razorpay.com/v1/orders");
  assert.equal(sent!.body.amount, getReport("career")!.price * 100);
  assert.equal(order.orderId, "order_123");
  assert.equal(order.keyId, "rzp_test_x");
  await assert.rejects(createOrder(env, "basic", fakeFetch)); // free reports have no order
  await assert.rejects(createOrder({}, "career", fakeFetch));

  const signature = createHmac("sha256", "secret").update("order_123|pay_9").digest("hex");
  const input = { orderId: "order_123", reportId: "career", ticket: order.ticket, subject: "abc", paymentId: "pay_9", signature };
  const token = verifyPayment(env, input);
  assert.ok(checkToken(env, token, "career", "abc"));
  assert.ok(!checkToken(env, token, "complete", "abc")); // a token unlocks one report…
  assert.ok(!checkToken(env, token, "career", "other")); // …for one chart
  assert.ok(!checkToken(env, token, "career", "abc", Date.now() + 400 * 86400000)); // and expires
  assert.throws(() => verifyPayment(env, { ...input, signature: "0".repeat(64) }));
  // A ticket for a cheap report cannot unlock a dearer one.
  assert.throws(() => verifyPayment(env, { ...input, reportId: "complete" }));
  // Test-mode order ids are refused when real payments are on.
  assert.throws(() => verifyPayment(env, { ...input, orderId: "test_1", paymentId: undefined, signature: undefined }));
});

test("finder: asking for a report opens the store", () => {
  assert.ok(respond("mujhe career report chahiye").cards.some((c) => c.type === "reports"));
  assert.ok(respond("kundli pdf report").cards.some((c) => c.type === "reports"));
});
