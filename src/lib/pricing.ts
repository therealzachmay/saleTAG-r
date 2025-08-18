export const LISTING_PRICE = 799; // cents, 3-day period
export const SUBSCRIPTION_PRICE_MONTHLY = 3599; // cents

export function assertThreeDayWindow(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  const hours = ms / (1000 * 60 * 60);
  if (hours <= 0 || hours > 72) {
    throw new Error("Listing must be within a 3-day (72h) window.");
  }
}

export function isActive(now: Date, start: Date, end: Date) {
  return now >= start && now <= end;
}