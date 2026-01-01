import { authApi } from './auth-api';
import type { SubscriptionPlan } from '@/types/plan.type';

export async function getPlans(): Promise<SubscriptionPlan[]> {
  // Path should not be double-prefixed; base URL already includes /api/auth
  return authApi.get<SubscriptionPlan[]>('/subscriptions/plans');
}
