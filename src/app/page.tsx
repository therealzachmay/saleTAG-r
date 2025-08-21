"use client";
import { useState } from "react";

function isEmail(s: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}

export default function Home() {
  const [mode, setMode] = useState<"LISTING"|"SUBSCRIPTION">("LISTING");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Garage Sale");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setError(null);
    if (!isEmail(email)) return setError("Please enter a valid email");
    if (mode === "LISTING") {
      if (!title || !location || !startsAt || !endsAt) return setError("Please fill all listing fields");
      const s = new Date(startsAt), e = new Date(endsAt);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return setError("Invalid dates");
      if (s >= e) return setError("Start must be before end");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, title, location, startsAt, endsAt, mode })
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError(data?.error || "Failed to create checkout session");
        setLoading(false);
        return;
      }

      // navigate to Stripe Checkout in a new tab as a fallback if window.location fails
      try {
        window.location.href = data.url;
      } catch {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-5xl mb-6 brand-accent">SaleTAGr</h1>
      <div className="bg-white text-black rounded-xl p-6 space-y-4">
        <div className="flex gap-2">
          <button disabled={loading} onClick={() => setMode("LISTING")} className={`px-4 py-2 rounded ${mode === "LISTING" ? "bg-black text-white" : "bg-neutral-200"}`}>3-Day Listing $7.99</button>
          <button disabled={loading} onClick={() => setMode("SUBSCRIPTION")} className={`px-4 py-2 rounded ${mode === "SUBSCRIPTION" ? "bg-black text-white" : "bg-neutral-200"}`}>Subscription $35.99/mo</button>
        </div>
        {mode === "LISTING" && (
          <p className="text-sm">3-day event window enforced. Unlimited posters during the active period.</p>
        )}
        <label className="block">Email<input className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block">Title<input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label className="block">Location<input className="w-full border p-2 rounded" value={location} onChange={e => setLocation(e.target.value)} placeholder="123 Main St, City" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label>Starts At<input type="datetime-local" className="w-full border p-2 rounded" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label>
          <label>Ends At<input type="datetime-local" className="w-full border p-2 rounded" value={endsAt} onChange={e => setEndsAt(e.target.value)} /></label>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <button disabled={loading} onClick={checkout} className="w-full py-3 rounded font-bold uppercase tracking-widest"
          style={{ background: "linear-gradient(90deg,#FF6A00,#2CFF75,#FFF240)" }}>
          {loading ? "Redirecting…" : "Continue to Checkout"}
        </button>
      </div>
    </main>
  );
}