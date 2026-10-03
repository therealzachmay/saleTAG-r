import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { LISTING_PRICE, assertThreeDayWindow } from "../../../lib/pricing";
import { randomUUID } from "crypto";
import { prisma } from "../../../lib/prisma";

function badRequest(msg = "Bad request") {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, title, location, startsAt, endsAt, mode } = body as {
      email?: string; title?: string; location?: string; startsAt?: string; endsAt?: string; mode?: "LISTING" | "SUBSCRIPTION";
    };

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_BASE_URL required" }, { status: 500 });
    }

    if (!mode || !email) return badRequest("mode and email are required");

    if (mode === "LISTING") {
      if (!startsAt || !endsAt || !title || !location) return badRequest("listing fields missing");

      const start = new Date(startsAt);
      const end = new Date(endsAt);
      // will throw if invalid window
      assertThreeDayWindow(start, end);

      const slug = randomUUID().slice(0, 8);
      const listing = await prisma.listing.create({
        data: { email, title, location, startsAt: start, endsAt: end, qrSlug: slug, status: "DRAFT" }
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [{ price_data: { currency: "usd", product_data: { name: "3-Day Sale Listing" }, unit_amount: LISTING_PRICE }, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?listing=${listing.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
        metadata: { listingId: listing.id, kind: "LISTING" }
      });

      // session.id is the Checkout Session id; for one-off payments prefer payment intent id when present
      // session.payment_intent may be a string (id) or object, handle both
      const intentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? session.id;

      await prisma.payment.create({ data: {
        listingId: listing.id,
        amount: LISTING_PRICE,
        currency: "usd",
        type: "LISTING",
        stripeIntent: String(intentId)
      }});

      return NextResponse.json({ url: session.url }, { status: 200 });
    }

    // SUBSCRIPTION
    // Reuse a price id if configured; creating products/prices every request is expensive and causes clutter
    let priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      const product = await stripe.products.create({ name: "SaleTAGr Monthly" });
      const price = await stripe.prices.create({ currency: "usd", unit_amount: 3599, recurring: { interval: "month" }, product: product.id });
      priceId = price.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: { kind: "SUBSCRIPTION" }
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: unknown) {
    console.error("/api/checkout error:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
