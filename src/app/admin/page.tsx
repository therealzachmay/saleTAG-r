import { format } from "date-fns";
import { prisma } from "../../lib/prisma";

export default async function Admin() {
  const [listings, subs, payments] = await Promise.all([
    prisma.listing.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.subscription.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  interface Listing {
    id: string;
    title: string;
    location: string;
    status: string;
    startsAt: Date;
    endsAt: Date;
    createdAt: Date;
    qrSlug: string;
  }

  interface User {
    id: string;
    email: string;
  }

  interface Subscription {
    id: string;
    stripeSubId: string;
    status: string;
    currentPeriodEnd: Date;
    createdAt: Date;
    user: User;
  }

  interface Payment {
    id: string;
    type: string;
    amount: number;
    stripeIntent: string;
    createdAt: Date;
  }

  const revenue = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
  const activeListings = (listings as Listing[]).filter((l: Listing) => l.status === "ACTIVE").length;
  const expiringSoon = (listings as Listing[]).filter((l: Listing) => l.status === "ACTIVE" && (l.endsAt.getTime() - Date.now()) < 24*60*60*1000).length;

  return (
    <main>
      <h1 className="text-4xl mb-6 brand-accent">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card title="Total Revenue">${(revenue/100).toFixed(2)}</Card>
        <Card title="Active Listings">{activeListings}</Card>
        <Card title="Expiring <24h">{expiringSoon}</Card>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl mb-2">Listings</h2>
        <table className="w-full text-sm bg-white text-black rounded overflow-hidden">
          <thead className="bg-neutral-200"><tr><Th>Title</Th><Th>Location</Th><Th>Status</Th><Th>Start</Th><Th>End</Th><Th>QR</Th><Th>Actions</Th></tr></thead>
          <tbody>
            {listings.map((l: Listing) => (
              <tr key={l.id} className="border-b">
                <Td>{l.title}</Td>
                <Td>{l.location}</Td>
                <Td>{l.status}</Td>
                <Td>{format(l.startsAt,"PPp")}</Td>
                <Td>{format(l.endsAt,"PPp")}</Td>
                <Td><a className="underline" href={`/s/${l.qrSlug}`} target="_blank">/s/{l.qrSlug}</a></Td>
                <Td className="space-x-2">
                  <form action={`/admin/actions/expire?id=${l.id}`} method="post"><button className="px-2 py-1 bg-black text-white rounded">Expire</button></form>
                  <form action={`/admin/actions/extend?id=${l.id}`} method="post"><button className="px-2 py-1 bg-black text-white rounded">Extend 3d</button></form>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl mb-2">Subscriptions</h2>
        <table className="w-full text-sm bg-white text-black rounded overflow-hidden">
          <thead className="bg-neutral-200"><tr><Th>User</Th><Th>Stripe</Th><Th>Status</Th><Th>Period End</Th></tr></thead>
          <tbody>
            {(subs as Subscription[]).map((s: Subscription): JSX.Element => (
              <tr key={s.id} className="border-b">
              <Td>{s.user.email}</Td>
              <Td>{s.stripeSubId}</Td>
              <Td>{s.status}</Td>
              <Td>{format(s.currentPeriodEnd,"PPp")}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl mb-2">Payments</h2>
        <table className="w-full text-sm bg-white text-black rounded overflow-hidden">
          <thead className="bg-neutral-200"><tr><Th>Type</Th><Th>Amount</Th><Th>Stripe</Th><Th>Date</Th></tr></thead>
          <tbody>
            {payments.map((p: Payment): JSX.Element => (
              <tr key={p.id} className="border-b">
              <Td>{p.type}</Td>
              <Td>${(p.amount/100).toFixed(2)}</Td>
              <Td>{p.stripeIntent}</Td>
              <Td>{format(p.createdAt, "PPp")}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
function Card({ title, children }:{ title:string; children:any }) { return <div className="p-4 bg-white text-black rounded"><div className="text-sm opacity-70">{title}</div><div className="text-2xl font-bold">{children}</div></div>; }
function Th({children}:{children:any}){return <th className="text-left p-2">{children}</th>}
function Td({children, className}:{children:any; className?:string}){return <td className={`p-2 ${className ?? ""}`}>{children}</td>}