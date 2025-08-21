import { NextRequest, NextResponse } from "next/server";
import { generatePosterPdf } from "../../../../../lib/posters";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req:NextRequest, { params }:{ params:{ id:string }}) {
  let style: "MINIMAL"|"BOLD"|"NEWS" = "MINIMAL";
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await req.json();
    style = body.style ?? style;
  } else {
    // handle form submissions
    const form = await req.formData();
    const s = form.get("style");
    if (typeof s === "string") style = s as any;
  }
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