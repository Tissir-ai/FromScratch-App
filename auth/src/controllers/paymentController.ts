import type { Request, Response, NextFunction } from 'express';
import {getPlanById , subscribe} from '../services/subscriptionService.js';
import { createCheckoutSessionForSubscription} from '../services/stripeService.js';
import stripe from '../services/stripeService.js';
import {recordPayment } from '../services/paymentService.js';
import { AppError } from '../utils/AppError.js';



export async function stripeSessionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { planId, successUrl, cancelUrl, months } = req.body as { planId: string; successUrl?: string; cancelUrl?: string; months: number };

    if (!successUrl || !cancelUrl) {
      res.status(400).json({ message: 'Please provide `successUrl` and `cancelUrl` from the frontend' });
      return ;
    }
    const plan = await getPlanById(planId);
    if (!plan) {
      res.status(404).json({ message: 'Subscription plan not found' });
      return;
    }
    if (plan.price.toNumber() === 0) {
        const subscription = await subscribe({
          userId,
          planId,
          paymentId: undefined,
          endDate: undefined,
          autoRenew: true,
        });
        if (!subscription) throw new AppError('Failed to create subscription from Stripe session', 500);
        res.status(201).json({checkoutUrl: successUrl, sessionId: null });
        return;
    }
    const session = await createCheckoutSessionForSubscription(userId, plan , successUrl, cancelUrl, months);

    res.status(201).json({checkoutUrl: session.url, sessionId: session.id });
    return
  } catch (err) {
    next(err);
  }
}

async function processCheckoutSession(session: any) {
  const userId = session.metadata?.userId as string;
  const planId = session.metadata?.planId as string;

  if (!userId || !planId) {
    throw new AppError('Missing metadata in Stripe session', 400);
  }

  const amountMajor = (session.amount_total as number ?? 0) / 100;
  const payment = await recordPayment({
    userId,
    amount: amountMajor,
    currency: session.currency as string,
    stripePaymentId: session.id as string,
  });

  if (!payment) throw new AppError('Failed to record payment from Stripe', 500);

  const subscription = await subscribe({
    userId,
    planId,
    paymentId: payment.id,
    endDate : new Date(session.metadata.endDate),
    autoRenew: true,
  });

  if (!subscription) throw new AppError('Failed to create subscription from Stripe session', 500);

  return { payment, subscription };
}

export async function stripeWebhookHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.body as { sessionId: string };
    if (!sessionId) {
    res.status(400).json({ message: 'Missing sessionId' });
    return ;
  }
    const session = await stripe.checkout.sessions.retrieve(sessionId as string, { expand: ['payment_intent'] });
    const result = await processCheckoutSession(session);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    next(err);
  }
}


export default { stripeSessionHandler, stripeWebhookHandler };
