export function googleCalendarUrl({ title, start, end, location, details }:{
  title:string; start:Date; end:Date; location:string; details?:string;
}) {
  const fmt = (d:Date)=> d.toISOString().replace(/[-:]|\.\d{3}/g,""); // YYYYMMDDTHHMMSSZ
  const params = new URLSearchParams({
    action:"TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    location,
    details: details ?? ""
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function icsFile({ title, start, end, location, details }:{
  title:string; start:Date; end:Date; location:string; details?:string;
}) {
  const dt = (d:Date)=> d.toISOString().replace(/[-:]|\.\d{3}/g,"");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SaleTAGr//EN",
    "BEGIN:VEVENT",
    `DTSTART:${dt(start)}`,
    `DTEND:${dt(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(details ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
function escapeText(s:string){return s.replace(/([,;])/g,"\\$1").replace(/\n/g,"\\n");}