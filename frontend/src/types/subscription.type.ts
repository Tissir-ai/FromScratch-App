import type { SubscriptionPlan } from './plan.type';


export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startDate: string; // ISO date string
  endDate?: string | null; // ISO date string or null
  autoRenew: boolean;
  paymentId?: string | null; // maps to Payment.id in backend
  plan?: SubscriptionPlan | null;
}
