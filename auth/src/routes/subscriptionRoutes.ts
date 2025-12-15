import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getPlans,
  subscribeHandler,
  cancelSubscriptionHandler,
  getCurrentSubscriptionHandler,
} from '../controllers/subscriptionController.js';

const router = Router();

// GET /plans
router.get('/plans', getPlans);

// POST /subscribe
router.post('/subscribe', authenticate, subscribeHandler);

// POST /cancel
router.post('/cancel', authenticate, cancelSubscriptionHandler);

// GET /subscription/current
router.get('/subscription/current', authenticate, getCurrentSubscriptionHandler);

export default router;
