export const metadata = { title: "Privacy Policy · SaleTAGr" };

export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4 leading-relaxed">
      <h1 className="text-4xl brand-accent">Privacy Policy</h1>
      <p className="text-sm opacity-70">Last updated: November 12, 2026</p>
      <p>SaleTAGr ("we") helps people create QR-code flyers and a public page for their garage sale. This policy explains what we collect and why.</p>
      <h2 className="text-2xl">What we collect</h2>
      <ul className="list-disc pl-6">
        <li><b>Your email address</b>, so we can tie your listing and receipt to you.</li>
        <li><b>Sale details you enter</b>: title, address, and start and end times. These are shown publicly on your sale page and posters, because that's the point of the listing.</li>
        <li><b>Purchase records</b>: an order reference from Google Play or Stripe. We never see or store your card number.</li>
        <li><b>Basic usage analytics</b> (Vercel Analytics): anonymous page views, with no cookies and no personal profile.</li>
      </ul>
      <h2 className="text-2xl">How we use it</h2>
      <p>Only to run your listing, generate your posters, process your payment, prevent fraud, and answer support requests. We don't sell your data or use it for advertising.</p>
      <h2 className="text-2xl">Who we share it with</h2>
      <p>Payment processors (Google Play, Stripe) and our hosting and database providers, only as needed to run the service.</p>
      <h2 className="text-2xl">How long we keep it</h2>
      <p>Your sale page goes offline when the sale ends. We keep listing and purchase records for up to 2 years for accounting, then delete them.</p>
      <h2 className="text-2xl">Deleting your data</h2>
      <p>Email us from the address you used and we'll delete your listings and email within 30 days.</p>
      <h2 className="text-2xl">Contact</h2>
      <p>{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@saletagr.app"}</p>
    </main>
  );
}
