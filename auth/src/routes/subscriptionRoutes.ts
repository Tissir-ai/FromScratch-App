import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getPlans,
  cancelSubscriptionHandler,
  getSubscriptionPlanConfigByUserId
} from '../controllers/subscriptionController.js';

const router = Router();

// GET /plans
router.get('/plans', getPlans);

// POST /cancel
router.post('/cancel', authenticate, cancelSubscriptionHandler);

// GET /plan/user/:userId
router.get('/plan/user/:userId',authenticate, getSubscriptionPlanConfigByUserId);


export default router;
