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
      email?: string; title?: string; location?: string; startsAt?: string; endsAt?: string; mode?: "LISTING" | string;
    };

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_BASE_URL required" }, { status: 500 });
    }

    if (!email) return badRequest("email is required");

    // Only support one-off listing payments (flyer unlock)
    if (mode !== "LISTING") return badRequest("Unsupported payment mode. Only LISTING purchases are supported.");

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
  } catch (err: unknown) {
    console.error("/api/checkout error:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
