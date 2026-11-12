import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { LISTING_PRICE } from "../../../lib/pricing";
import { prisma } from "../../../lib/prisma";
import { createDraftListing } from "../../../lib/listings";

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

    let listing;
    try {
      listing = await createDraftListing({ email, title, location, startsAt, endsAt });
    } catch (e: unknown) {
      return badRequest(e instanceof Error ? e.message : "Bad request");
    }

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
