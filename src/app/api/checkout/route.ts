import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";
import { LISTING_PRICE, assertThreeDayWindow } from "@/lib/pricing";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, title, location, startsAt, endsAt, mode } = body as {
    email: string; title: string; location: string; startsAt: string; endsAt: string; mode: "LISTING" | "SUBSCRIPTION";
  };

  if (mode === "LISTING") {
    const start = new Date(startsAt), end = new Date(endsAt);
    assertThreeDayWindow(start, end);

    const slug = randomUUID().slice(0,8);
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

    await prisma.payment.create({ data: {
      listingId: listing.id, amount: LISTING_PRICE, currency: "usd", type: "LISTING",
      stripeIntent: session.id
    }});

    return NextResponse.json({ url: session.url }, { status: 200 });
  }

  // SUBSCRIPTION
  const product = await stripe.products.create({ name: "SaleTAGr Monthly" });
  const price = await stripe.prices.create({ currency: "usd", unit_amount: 3599, recurring: { interval: "month" }, product: product.id });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    metadata: { kind: "SUBSCRIPTION" }
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}