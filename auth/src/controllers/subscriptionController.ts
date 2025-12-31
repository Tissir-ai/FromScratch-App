import type { Response, NextFunction } from 'express';
import { listPlans, cancelCurrentSubscription} from '../services/subscriptionService.js';
import {getCurrentUserWithSubscription} from '../services/authService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getPlans(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await listPlans();
    res.status(200).json(plans);
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

export async function getSubscriptionPlanConfigByUserId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const user = await getCurrentUserWithSubscription(userId);
    res.status(200).json(user.plan);
  } catch (err) {
    next(err);
  }
}