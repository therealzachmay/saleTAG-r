"use client";
import React, { useState } from "react";

export default function Share({ url }:{ url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <a className="px-3 py-2 bg-white text-black rounded" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank">Facebook</a>
      <a className="px-3 py-2 bg-white text-black rounded" href={`https://wa.me/?text=${encodeURIComponent(url)}`} target="_blank">WhatsApp</a>
      <a className="px-3 py-2 bg-white text-black rounded" href={`https://nextdoor.com/compose/?target=share&url=${encodeURIComponent(url)}`} target="_blank">Nextdoor</a>
      <a className="px-3 py-2 bg-white text-black rounded" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("Garage Sale!")}`} target="_blank">X</a>
      <button
        className="px-3 py-2 bg-white text-black rounded"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (error) {
            alert("Failed to copy link. Please try manually.");
          }
        }}
      >
        {copied ? "Copied" : "Copy Link"}
      </button>
    </div>
  );
}
