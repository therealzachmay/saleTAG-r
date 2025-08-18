import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generatePosterPdf } from "@/lib/posters";

const prisma = new PrismaClient();

export async function POST(req:NextRequest, { params }:{ params:{ id:string }}) {
  const { style } = await req.json() as { style: "MINIMAL"|"BOLD"|"NEWS" };
  const listing = await prisma.listing.findUnique({ where:{ id: params.id }});
  if (!listing) return NextResponse.json({ error: "Not found"}, { status:404 });

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${listing.qrSlug}`;
  const pdfBytes = await generatePosterPdf({
    title: listing.title, location: listing.location, start: listing.startsAt, end: listing.endsAt,
    style, slugUrl: url
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: { "Content-Type":"application/pdf", "Content-Disposition":"attachment; filename=poster.pdf" }
  });
}