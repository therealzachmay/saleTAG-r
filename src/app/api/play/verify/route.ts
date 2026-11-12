import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LISTING_PRICE } from "@/lib/pricing";
import { consumeProduct, getProductPurchase, tokenKey } from "@/lib/googlePlay";

const LISTING_SKU = process.env.NEXT_PUBLIC_PLAY_LISTING_SKU || "listing_3day";

/** Verifies a Google Play purchase token server-side, activates the listing, then consumes the purchase. */
export async function POST(req: NextRequest) {
  try {
    const { listingId, purchaseToken } = (await req.json()) as { listingId?: string; purchaseToken?: string };
    if (!listingId || !purchaseToken) return NextResponse.json({ error: "listingId and purchaseToken required" }, { status: 400 });

    const key = tokenKey(purchaseToken);
    const existing = await prisma.payment.findUnique({ where: { stripeIntent: key } });
    if (existing) {
      if (existing.listingId !== listingId) return NextResponse.json({ error: "Purchase already used" }, { status: 409 });
      return NextResponse.json({ ok: true, listingId }, { status: 200 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const purchase = await getProductPurchase(LISTING_SKU, purchaseToken);
    if (purchase.purchaseState !== 0) {
      return NextResponse.json({ error: purchase.purchaseState === 2 ? "Payment is pending" : "Purchase not completed" }, { status: 402 });
    }
    if (purchase.consumptionState === 1) return NextResponse.json({ error: "Purchase already used" }, { status: 409 });

    await prisma.$transaction([
      prisma.payment.create({
        data: { listingId, amount: LISTING_PRICE, currency: "usd", type: "LISTING", stripeIntent: key },
      }),
      prisma.listing.update({ where: { id: listingId }, data: { status: "ACTIVE" } }),
      prisma.auditLog.create({
        data: { actor: listing.email, action: "PLAY_PURCHASE", targetId: listingId, meta: { orderId: purchase.orderId ?? null } },
      }),
    ]);

    await consumeProduct(LISTING_SKU, purchaseToken).catch((e) => console.error("consume failed", e));
    return NextResponse.json({ ok: true, listingId }, { status: 200 });
  } catch (err: unknown) {
    console.error("/api/play/verify error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
