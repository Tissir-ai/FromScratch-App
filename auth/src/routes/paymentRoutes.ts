import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {stripeSessionHandler, stripeWebhookHandler} from '../controllers/paymentController.js';

const router = Router();

// POST /create-checkout-session
router.post('/create-checkout-session', authenticate, stripeSessionHandler);

// POST /confirm - retrieve Checkout session and process
router.post('/stripe-confirm', authenticate, stripeWebhookHandler);



export default router;
