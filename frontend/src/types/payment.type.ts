export interface CreateCheckoutResult {
  subscription: any;
  checkoutUrl: string;
  sessionId: string;
}

export interface CreateCheckoutPayload {
  planId: string;
  autoRenew?: boolean;
  successUrl?: string;
  cancelUrl?: string;
}
