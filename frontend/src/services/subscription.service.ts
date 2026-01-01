import { authApi } from './auth-api';
import type { Subscription } from '@/types/subscription.type';

export async function cancelSubscription(): Promise<Subscription> {
  return authApi.post<Subscription>('/subscriptions/cancel');
}
