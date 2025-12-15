import { prisma } from '../db/client.js';
import type { Payment } from '../models/Payment.js';

interface RecordPaymentInput {
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentId?: string;
}

export async function recordPayment(input: RecordPaymentInput): Promise<Payment> {
  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      subscriptionId: input.subscriptionId,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
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
