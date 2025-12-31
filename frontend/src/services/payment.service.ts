import { authApi } from './auth-api';
import type { CreateCheckoutResult } from '@/types/payment.type';

export async function createCheckoutSession(
  planId: string,
  successUrl: string,
  cancelUrl: string,
  months: number,
): Promise<CreateCheckoutResult> {
  const res = await authApi.post<CreateCheckoutResult>('/payments/create-checkout-session', {
    planId,
    successUrl:  successUrl,
    cancelUrl: cancelUrl,
    months,
  });

  return res;
}

export async function redirectToCheckout(planId: string, successUrl: string, cancelUrl: string, months: number): Promise<void> {
  const { checkoutUrl } = await createCheckoutSession(planId, successUrl, cancelUrl, months);
  if (!checkoutUrl) throw new Error('No checkout URL returned from server');
  // Redirect the browser to Stripe Checkout
  if (typeof window !== 'undefined') {
    window.location.href = checkoutUrl;
  }
}

export async function confirmCheckout(sessionId: string) {
  if (!sessionId) throw new Error('Missing sessionId');
  const res = await authApi.post('/payments/stripe-confirm', { sessionId });
  return res;
}

export default {
  createCheckoutSession,
  redirectToCheckout,
};
