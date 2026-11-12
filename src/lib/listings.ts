import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { assertThreeDayWindow } from "./pricing";

export type ListingInput = {
  email?: string;
  title?: string;
  location?: string;
  startsAt?: string;
  endsAt?: string;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Validates input and creates a DRAFT listing. Throws Error with a user-facing message on bad input. */
export async function createDraftListing(input: ListingInput) {
  const { email, title, location, startsAt, endsAt } = input;
  if (!email || !EMAIL_RE.test(email)) throw new Error("A valid email is required");
  if (!title || !location || !startsAt || !endsAt) throw new Error("listing fields missing");
  if (title.length > 120 || location.length > 300) throw new Error("Title or location is too long");

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Invalid dates");
  assertThreeDayWindow(start, end);

  return prisma.listing.create({
    data: {
      email,
      title: title.trim(),
      location: location.trim(),
      startsAt: start,
      endsAt: end,
      qrSlug: randomUUID().slice(0, 8),
      status: "DRAFT",
    },
  });
}
