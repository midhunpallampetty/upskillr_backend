import Stripe from 'stripe';
const SECRET_KEY=process.env.STRIPE_ACCESS_KEY ;
export const stripe = new Stripe(SECRET_KEY!, {
  apiVersion: (process.env.STRIPE_API_VERSION as "2025-06-30.basil") ?? "2025-06-30.basil",
});
