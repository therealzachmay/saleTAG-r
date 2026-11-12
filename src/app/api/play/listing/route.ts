import { NextRequest, NextResponse } from "next/server";
import { createDraftListing, ListingInput } from "@/lib/listings";

/** Creates a DRAFT listing before the Google Play purchase sheet opens (Android app only). */
export async function POST(req: NextRequest) {
  try {
    const listing = await createDraftListing((await req.json()) as ListingInput);
    return NextResponse.json({ listingId: listing.id }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Bad request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
