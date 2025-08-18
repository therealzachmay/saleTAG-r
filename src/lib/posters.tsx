import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { qrDataUrl } from "./qr";

type PosterInput = {
  title: string;
  location: string;
  start: Date;
  end: Date;
  style: "MINIMAL" | "BOLD" | "NEWS";
  slugUrl: string;
};

export async function generatePosterPdf(input: PosterInput) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Brand palette
  const neonOrange = rgb(1, 0.45, 0.0);
  const neonGreen  = rgb(0.18, 1, 0.35);
  const neonYellow = rgb(1, 0.95, 0.2);
  const black      = rgb(0,0,0);
  const white      = rgb(1,1,1);

  const qr = await pdf.embedPng(await (await fetch(await qrDataUrl(input.slugUrl))).arrayBuffer());
  const qrSize = 220;

  // Background/style
  if (input.style === "BOLD") {
    page.drawRectangle({ x:0, y:0, width, height, color: black });
    page.drawRectangle({ x:0, y:height*0.6, width, height: height*0.4, color: neonOrange });
  } else if (input.style === "NEWS") {
    page.drawRectangle({ x:0, y:0, width, height, color: white });
    page.drawRectangle({ x:0, y:height-90, width, height: 90, color: black });
  } else {
    // Minimal: white with subtle neon accent line
    page.drawRectangle({ x:0, y:0, width, height, color: white });
    page.drawRectangle({ x:0, y:height-12, width, height: 12, color: neonGreen });
  }

  // Title
  const title = input.title.toUpperCase();
  page.drawText(title, {
    x: 40, y: height-140, size: 44, font, color: input.style==="BOLD" ? white : black
  });

  // Location & time
  const when = formatWhen(input.start, input.end);
  page.drawText(input.location, { x: 40, y: height-200, size: 24, font, color: black });
  page.drawText(when,           { x: 40, y: height-235, size: 24, font, color: black });

  // QR
  page.drawImage(qr, { x: width-qrSize-40, y: 70, width: qrSize, height: qrSize });
  page.drawText("SCAN FOR DETAILS", { x: width-qrSize-30, y: 50, size: 12, font, color: black });

  // Footer brand
  page.drawText("saleTAGr", { x: 40, y: 40, size: 12, font, color: black });

  return await pdf.save();
}

function formatWhen(start:Date, end:Date) {
  const opts: Intl.DateTimeFormatOptions = { weekday:"short", month:"short", day:"numeric", hour:"numeric", minute:"2-digit" };
  const s = start.toLocaleString(undefined, opts);
  const sameDay = start.toDateString() === end.toDateString();
  const e = end.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" });
  return sameDay ? `${s} – ${e}` : `${s} → ${end.toLocaleString(undefined, opts)}`;
}