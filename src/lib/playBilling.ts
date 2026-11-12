"use client";
/**
 * Google Play Billing inside the Trusted Web Activity, via the Digital Goods API
 * + Payment Request API. Only available when the site runs inside the Play-installed
 * Android app (Bubblewrap TWA with playBilling enabled).
 */

export const PLAY_BILLING_METHOD = "https://play.google.com/billing";
export const LISTING_SKU = process.env.NEXT_PUBLIC_PLAY_LISTING_SKU || "listing_3day";

type ItemDetails = { itemId: string; title: string; price: { currency: string; value: string } };
type DigitalGoodsService = {
  getDetails(ids: string[]): Promise<ItemDetails[]>;
};

declare global {
  interface Window {
    getDigitalGoodsService?: (method: string) => Promise<DigitalGoodsService>;
  }
}

export async function getPlayService(): Promise<DigitalGoodsService | null> {
  if (typeof window === "undefined" || !window.getDigitalGoodsService) return null;
  try {
    return await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
  } catch {
    return null;
  }
}

export async function getListingPrice(service: DigitalGoodsService): Promise<string | null> {
  try {
    const [item] = await service.getDetails([LISTING_SKU]);
    if (!item) return null;
    return new Intl.NumberFormat(undefined, { style: "currency", currency: item.price.currency }).format(
      Number(item.price.value),
    );
  } catch {
    return null;
  }
}

/** Opens the Play purchase sheet. Resolves with the purchase token, or throws if cancelled/failed. */
export async function buyListing(): Promise<string> {
  const request = new PaymentRequest(
    [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: LISTING_SKU } }],
    { total: { label: "Total", amount: { currency: "USD", value: "0" } } },
  );
  const response = await request.show();
  const token = (response.details as { purchaseToken?: string }).purchaseToken;
  await response.complete(token ? "success" : "fail");
  if (!token) throw new Error("Purchase did not return a token");
  return token;
}
