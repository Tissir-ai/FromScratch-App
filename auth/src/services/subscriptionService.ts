import { prisma } from '../db/client.js';
import { AppError } from '../utils/AppError.js';
import type { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import type { Subscription } from '../models/Subscription.js';

interface SubscribeInput {
  userId: string;
  planId: string;
  autoRenew?: boolean;
}

interface CancelInput {
  userId: string;
}

export async function listPlans(): Promise<SubscriptionPlan[]> {
  return prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' },
  });
}

export async function subscribe({ userId, planId, autoRenew = true }: SubscribeInput): Promise<Subscription> {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }

  const now = new Date();

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      startDate: now,
      endDate: null,
      autoRenew,
    },
    include: {
      plan: true,
    },
  });

  return subscription;
}

export async function cancelCurrentSubscription({ userId }: CancelInput): Promise<Subscription> {
  const current = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { startDate: 'desc' },
  });

  if (!current) {
    throw new AppError('No active subscription', 404);
  }

  const now = new Date();

  const updated = await prisma.subscription.update({
    where: { id: current.id },
    data: {
      status: 'canceled',
      autoRenew: false,
      endDate: now,
    },
  });

  return updated;
}

export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
  const current = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { startDate: 'desc' },
    include: {
      plan: true,
    },
  });

  return current;
}
