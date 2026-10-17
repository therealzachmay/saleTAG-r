"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Success() {
  return (
    <Suspense fallback={<main className="max-w-xl mx-auto p-6">Loading checkout details…</main>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const sp = useSearchParams();
  const listingId = sp.get("listing");
  const [style,setStyle] = useState<"MINIMAL"|"BOLD"|"NEWS">("MINIMAL");

  if (!listingId) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-4xl brand-accent mb-4">Checkout complete</h1>
        <p className="mb-4">No listing was included in this checkout link.</p>
        <a className="underline" href="/">Return home</a>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl brand-accent mb-4">You're set!</h1>
      <p className="mb-4">Download printable posters (PDF). Unlimited prints.</p>
      <div className="flex gap-2 mb-4">
        {["MINIMAL","BOLD","NEWS"].map(s=>(
          <button key={s} onClick={()=>setStyle(s as any)} className={`px-3 py-2 rounded ${style===s?"bg-white text-black":"bg-neutral-700"}`}>{s}</button>
        ))}
      </div>
      <form method="post" action={`/api/listings/${listingId}/posters`}>
        <input type="hidden" name="style" value={style}/>
        <button type="submit" className="w-full py-3 rounded font-bold uppercase tracking-widest"
          style={{ background:"linear-gradient(90deg,#FF6A00,#2CFF75,#FFF240)" }}>
          Download {style} Poster (PDF)
        </button>
      </form>
      <p className="text-sm opacity-80 mt-4">Tip: Print multiple copies and post around the neighborhood.</p>
    </main>
  );
}
