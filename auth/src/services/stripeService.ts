import Stripe from 'stripe';
import dotenv from 'dotenv';
import type { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import { AppError } from '../utils/AppError.js';
dotenv.config();

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET
} = process.env;
if (!STRIPE_SECRET_KEY) {
  console.warn('[stripeService] STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
export async function createCheckoutSessionForSubscription(
  userId: string,
  plan: SubscriptionPlan,
  successUrl: string,
  cancelUrl: string,
  months: number,
): Promise<{ url: string; id: string }>
{
  if (!STRIPE_SECRET_KEY) {
    throw new AppError('Stripe is not configured on the server. Set STRIPE_SECRET_KEY in environment.', 500);
  }
  
  const price = Math.round(Number(plan.price ?? 0) * 100); // cents

  // create a one-time Checkout session (payment) or subscription-based flow depending on billingPeriod
  const paragraph1 = `${(price / 100).toFixed(2)}$ /${plan.billingPeriod}`;
  const paragraph2 = Array.isArray(plan.description) ? plan.description.join(' - ') : (plan.description ?? '');
  const productDescription = `${paragraph1}\n\n${paragraph2}`;

  let session;
  try {
    session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: productDescription ?? undefined,
          },
          unit_amount: price * months,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl + `&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId: plan.id,
      endDate:  new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),

    },
  });
  } catch (err: any) {
    throw new AppError(`Stripe error: ${err?.message ?? 'failed to create session'}`, 502);
  }

  return { url: session.url ?? '', id: session.id };
}

export function constructEvent(payload: Buffer, sig: string | undefined, webhookSecret?: string) {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new AppError('Stripe webhook secret not configured', 500);
  }

  return stripe.webhooks.constructEvent(payload, sig || '',STRIPE_WEBHOOK_SECRET);
}

export default stripe;
