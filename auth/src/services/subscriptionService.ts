import { prisma } from '../db/client.js';
import { AppError } from '../utils/AppError.js';
import type { SubscriptionPlan } from '../models/SubscriptionPlan.js';
import type { Subscription } from '../models/Subscription.js';

interface SubscribeInput {
  userId: string;
  planId: string;
  autoRenew?: boolean;
  paymentId?: string;
  endDate?: Date;
}

interface CancelInput {
  userId: string;
}

export async function listPlans(): Promise<Array<Omit<SubscriptionPlan, 'config'>>> {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      oldPrice: true,
      billingPeriod: true,
      description: true,
      isActive: true,
      isPopular: true,
      config: true,
    },
    orderBy: { price: 'asc' },
  }) as unknown as Array<Omit<SubscriptionPlan, 'config'>>;
}
export async function getPlanById(planId: string): Promise<SubscriptionPlan | null> {
  return prisma.subscriptionPlan.findUnique({ where: { id: planId } });
}
export async function subscribe({ userId, planId, paymentId , endDate ,autoRenew = true }: SubscribeInput): Promise<Subscription & { plan: SubscriptionPlan }> {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new AppError('Subscription plan not found', 404);
  }
  const now = new Date();

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId,
      paymentId: paymentId ?? null,
      status: 'active',
      startDate: now,
      endDate: endDate,
      autoRenew,
    },
    create: {
      userId,
      planId,
      paymentId: paymentId ?? null,
      status: 'active',
      startDate: now,
      endDate: endDate,
      autoRenew,
    },
    include: {
      plan: true,
    },
  });

  return subscription;
}

export async function cancelCurrentSubscription({ userId }: CancelInput): Promise<Subscription & { plan: SubscriptionPlan } > {
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

  // Find a free plan to revert to (prefer name "Starter")
  const freePlan = await prisma.subscriptionPlan.findFirst({
    where: {
      OR: [
        { name: 'Starter' },
        { price: 0 },
      ],
    },
    orderBy: { price: 'asc' },
  });

  const now = new Date();

  if (!freePlan) {
    // If no free plan configured, just cancel the current subscription
    const canceled = await prisma.subscription.update({
      where: { id: current.id },
      data: {
        status: 'canceled',
        autoRenew: false,
        endDate: now,
      },
      include: { plan: true },
    });
    return canceled as Subscription & { plan: SubscriptionPlan };
  }

  // If current subscription is already on the free plan, return it as-is
  if (current.planId === freePlan.id) {
    const existing = await prisma.subscription.update({
      where: { id: current.id },
      data: {
        status: 'active',
        autoRenew: false,
      },
      include: { plan: true },
    });
    return existing as Subscription & { plan: SubscriptionPlan };
  }

  // Revert the current subscription record to the free plan
  const updated = await prisma.subscription.update({
    where: { id: current.id },
    data: {
      planId: freePlan.id,
      paymentId: null,
      status: 'active',
      startDate: now,
      endDate: null,
      autoRenew: false,
    },
    include: { plan: true },
  });

  return updated as Subscription & { plan: SubscriptionPlan };
}

export async function getCurrentSubscription(userId: string): Promise<(Subscription & { plan: SubscriptionPlan }) | null> {
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
