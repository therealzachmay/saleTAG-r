import { googleCalendarUrl } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";
import Share from "@/components/Share";

export default async function SalePage({ params }:{ params:{ slug:string }}) {
  const listing = await prisma.listing.findFirst({ where:{ qrSlug: params.slug }});
  if (!listing) return <div className="p-10">Not found.</div>;

  const now = new Date();
  const active = listing.status === "ACTIVE" && now <= listing.endsAt;
  if (!active) return <Ended />;

  const gUrl = googleCalendarUrl({
    title: listing.title, start: listing.startsAt, end: listing.endsAt, location: listing.location
  });
  const icsUrl = `/api/listings/${listing.qrSlug}/ics`;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl brand-accent mb-2">{listing.title}</h1>
      <p className="text-lg">{listing.location}</p>
      <Countdown start={listing.startsAt} end={listing.endsAt} />
      <div className="flex gap-3 mt-4">
        <a className="px-3 py-2 bg-white text-black rounded" href={gUrl} target="_blank">Add to Google</a>
        <a className="px-3 py-2 bg-white text-black rounded" href={icsUrl}>Add to Apple/Outlook</a>
  <Share url={`${process.env.NEXT_PUBLIC_BASE_URL}/s/${params.slug}`} />
      </div>
      <div className="mt-10">
        <a className="underline" href={`https://maps.google.com/?q=${encodeURIComponent(listing.location)}`} target="_blank">Open in Google Maps</a>
      </div>
    </main>
  );
}

function Ended(){ return <main className="p-10 text-center"><h2 className="text-3xl mb-2">Sale Ended</h2><p>Thanks for your interest!</p></main>; }

function LocalShare({ url }:{ url:string }) {
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(url)}`;
  const x  = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Garage Sale!")}`;
  const nd = `https://nextdoor.com/compose/?target=share&url=${encodeURIComponent(url)}`;
  return (
    <div className="flex gap-2">
      <a className="px-3 py-2 bg-white text-black rounded" href={fb} target="_blank">Facebook</a>
      <a className="px-3 py-2 bg-white text-black rounded" href={wa} target="_blank">WhatsApp</a>
      <a className="px-3 py-2 bg-white text-black rounded" href={nd} target="_blank">Nextdoor</a>
      <a className="px-3 py-2 bg-white text-black rounded" href={x} target="_blank">X</a>
      <button
        className="px-3 py-2 bg-white text-black rounded"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            alert("Link copied!");
          } catch (err) {
            alert("Failed to copy link.");
          }
        }}
      >
        Copy Link
      </button>
    </div>
  );
}

function Countdown({ start, end }:{ start:Date, end:Date }) {
  // SSR fallback; client JS can enhance if desired
  const now = new Date();
  const remaining = Math.max(0, end.getTime() - now.getTime());
  const hrs = Math.floor(remaining/3_600_000);
  const mins = Math.floor((remaining%3_600_000)/60_000);
  const secs = Math.floor((remaining%60_000)/1000);
  return <p className="mt-4 text-xl">Ends in {hrs}h {mins}m {secs}s</p>;
}