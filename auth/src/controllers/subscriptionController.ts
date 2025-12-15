import type { Response, NextFunction } from 'express';
import { listPlans, subscribe, cancelCurrentSubscription, getCurrentSubscription } from '../services/subscriptionService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getPlans(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await listPlans();
    res.status(200).json(plans);
  } catch (err) {
    next(err);
  }
}

export async function subscribeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { planId, autoRenew } = req.body as { planId: string; autoRenew?: boolean };
    const subscription = await subscribe({ userId, planId, autoRenew });
    res.status(201).json(subscription);
  } catch (err) {
    next(err);
  }
}

export async function cancelSubscriptionHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const subscription = await cancelCurrentSubscription({ userId });
    res.status(200).json(subscription);
  } catch (err) {
    next(err);
  }
}

export async function getCurrentSubscriptionHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const subscription = await getCurrentSubscription(userId);
    res.status(200).json(subscription);
  } catch (err) {
    next(err);
  }
}
