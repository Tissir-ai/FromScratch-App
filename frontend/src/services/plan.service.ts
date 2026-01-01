import { authApi } from './auth-api';
import type { SubscriptionPlan } from '@/types/plan.type';

export async function getPlans(): Promise<SubscriptionPlan[]> {
  // Path relative to auth base URL - nginx routes /api/auth/subscriptions/* to auth service
  return authApi.get<SubscriptionPlan[]>('/subscriptions/plans');
}
