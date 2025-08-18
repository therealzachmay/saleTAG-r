import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { icsFile } from "@/lib/calendar";

const prisma = new PrismaClient();

export async function GET(_:NextRequest, { params }:{ params:{ slug:string }}) {
  const listing = await prisma.listing.findFirst({ where:{ qrSlug: params.slug, status: "ACTIVE" }});
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
      "Content-Disposition": `attachment; filename="${params.slug}.ics"`
    }
  });
}