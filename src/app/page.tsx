"use client";
import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"LISTING"|"SUBSCRIPTION">("LISTING");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Garage Sale");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  async function checkout() {
    const res = await fetch("/api/checkout", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, title, location, startsAt, endsAt, mode })
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-5xl mb-6 brand-accent">SaleTAGr</h1>
      <div className="bg-white text-black rounded-xl p-6 space-y-4">
        <div className="flex gap-2">
          <button onClick={()=>setMode("LISTING")} className={`px-4 py-2 rounded ${mode==="LISTING"?"bg-black text-white":"bg-neutral-200"}`}>3-Day Listing $7.99</button>
          <button onClick={()=>setMode("SUBSCRIPTION")} className={`px-4 py-2 rounded ${mode==="SUBSCRIPTION"?"bg-black text-white":"bg-neutral-200"}`}>Subscription $35.99/mo</button>
        </div>
        {mode==="LISTING" && (
          <p className="text-sm">3-day event window enforced. Unlimited posters during the active period.</p>
        )}
        <label className="block">Email<input className="w-full border p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label className="block">Title<input className="w-full border p-2 rounded" value={title} onChange={e=>setTitle(e.target.value)} /></label>
        <label className="block">Location<input className="w-full border p-2 rounded" value={location} onChange={e=>setLocation(e.target.value)} placeholder="123 Main St, City" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label>Starts At<input type="datetime-local" className="w-full border p-2 rounded" value={startsAt} onChange={e=>setStartsAt(e.target.value)} /></label>
          <label>Ends At<input type="datetime-local" className="w-full border p-2 rounded" value={endsAt} onChange={e=>setEndsAt(e.target.value)} /></label>
        </div>

        <button onClick={checkout} className="w-full py-3 rounded font-bold uppercase tracking-widest"
          style={{ background:"linear-gradient(90deg,#FF6A00,#2CFF75,#FFF240)" }}>
          Continue to Checkout
        </button>
      </div>
    </main>
  );
}