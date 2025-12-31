import { prisma } from '../db/client.js';
import type { Payment } from '../models/Payment.js';

interface RecordPaymentInput {
  userId: string;
  amount: number;
  currency: string;
  stripePaymentId?: string;
}

export async function recordPayment(input: RecordPaymentInput): Promise<Payment> {
  // If a stripePaymentId is provided, attempt to find an existing payment to avoid duplicates
  if (input.stripePaymentId) {
    const existing = await prisma.payment.findFirst({ where: { stripePaymentId: input.stripePaymentId } });
    if (existing) return existing;
  }

  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
      stripePaymentId: input.stripePaymentId ?? null,
    },
  });

  return payment;
}

export async function listUserPayments(userId: string): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
