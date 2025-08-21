import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
	// Fail fast with a helpful error — this will show up in server logs when the module is imported
	throw new Error('Missing required environment variable STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });