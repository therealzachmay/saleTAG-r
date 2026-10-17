import { NextRequest, NextResponse } from "next/server";
import { icsFile } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";

export async function GET(_:NextRequest, { params }:{ params: Promise<{ slug:string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findFirst({ where:{ qrSlug: slug, status: "ACTIVE" }});
  if (!listing) return NextResponse.json({ error:"Not found" }, { status:404 });
  const body = icsFile({
    title: listing.title,
    start: listing.startsAt,
    end: listing.endsAt,
    location: listing.location
  });
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`
    }
  });
}
