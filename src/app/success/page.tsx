"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Success() {
  const sp = useSearchParams();
  const listingId = sp.get("listing");
  const [style,setStyle] = useState<"MINIMAL"|"BOLD"|"NEWS">("MINIMAL");

  const dl = ()=> window.open(`/api/listings/${listingId}/posters`, "_blank"); // defaults MINIMAL if you prefer

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