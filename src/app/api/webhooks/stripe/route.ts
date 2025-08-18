import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const buf = await req.arrayBuffer();
  let evt;
  try {
    evt = stripe.webhooks.constructEvent(Buffer.from(buf), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  switch (evt.type) {
    case "checkout.session.completed": {
      const session = evt.data.object as any;
      const kind = session.metadata?.kind;
      const email = session.customer_details?.email;
      if (kind === "LISTING") {
        const listingId = session.metadata.listingId;
        await prisma.listing.update({ where:{ id: listingId }, data:{ status: "ACTIVE" }});
      } else if (kind === "SUBSCRIPTION") {
        const subId = session.subscription as string;
        // upsert user and subscription
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email: email! }
        });
        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeSubId: subId,
            status: "active",
            currentPeriodEnd: new Date(Date.now()+30*24*60*60*1000)
          }
        });
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const sub = evt.data.object as any;
      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end*1000)
        }
      });
      break;
    }
  }
  return NextResponse.json({ received: true }, { status: 200 });
}