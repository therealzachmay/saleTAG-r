"use client";
import { useEffect, useState } from "react";
import { buyListing, getListingPrice, getPlayService } from "@/lib/playBilling";

function isEmail(s: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Garage Sale");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // In the Play-installed Android app, purchases must go through Google Play billing.
  const [inPlayApp, setInPlayApp] = useState(false);
  const [price, setPrice] = useState("$7.99");

  useEffect(() => {
    getPlayService().then(async (service) => {
      if (!service) return;
      setInPlayApp(true);
      const p = await getListingPrice(service);
      if (p) setPrice(p);
    });
  }, []);

  function validate(): string | null {
    if (!isEmail(email)) return "Please enter a valid email";
    if (!title || !location || !startsAt || !endsAt) return "Please fill all listing fields";
    const s = new Date(startsAt), e = new Date(endsAt);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Invalid dates";
    if (s >= e) return "Start must be before end";
    if (e.getTime() - s.getTime() > 72 * 3600 * 1000) return "A listing can cover up to 3 days";
    return null;
  }

  const payload = () => ({ email, title, location, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() });

  async function checkoutWithPlay() {
    const draft = await fetch("/api/play/listing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
    const d = await draft.json();
    if (!draft.ok || !d?.listingId) throw new Error(d?.error || "Could not create listing");

    let token: string;
    try {
      token = await buyListing();
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") throw new Error("Purchase cancelled");
      throw e;
    }

    const v = await fetch("/api/play/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: d.listingId, purchaseToken: token }) });
    const vd = await v.json();
    if (!v.ok) throw new Error(vd?.error || "Could not verify purchase");
    window.location.href = `/success?listing=${d.listingId}`;
  }

  async function checkoutWithStripe() {
    const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload(), mode: "LISTING" }) });
    const data = await res.json();
    if (!res.ok || !data?.url) throw new Error(data?.error || "Failed to create checkout session");
    window.location.href = data.url;
  }

  async function checkout() {
    setError(null);
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      if (inPlayApp) await checkoutWithPlay();
      else await checkoutWithStripe();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-5xl mb-2 brand-accent">SaleTAGr</h1>
      <p className="mb-6 opacity-80">QR flyers for your garage sale. Shoppers scan, get directions, and add it to their calendar.</p>
      <div className="bg-white text-black rounded-xl p-6 space-y-4">
        <p className="font-semibold">3-Day Listing · {price}</p>
        <p className="text-sm">Covers a sale up to 3 days long. Unlimited printable posters while it's active.</p>
        <label className="block">Email<input type="email" inputMode="email" autoComplete="email" className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block">Title<input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label className="block">Location<input className="w-full border p-2 rounded" value={location} onChange={e => setLocation(e.target.value)} placeholder="123 Main St, City" /></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label>Starts At<input type="datetime-local" className="w-full border p-2 rounded" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label>
          <label>Ends At<input type="datetime-local" className="w-full border p-2 rounded" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></label>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <button disabled={loading} onClick={checkout} className="w-full py-3 rounded font-bold uppercase tracking-widest"
          style={{ background: "linear-gradient(90deg,#FF6A00,#2CFF75,#FFF240)" }}>
          {loading ? "Working…" : inPlayApp ? `Buy listing · ${price}` : "Continue to Checkout"}
        </button>
      </div>
      <footer className="mt-8 text-sm opacity-70"><a className="underline" href="/privacy">Privacy policy</a></footer>
    </main>
  );
}
