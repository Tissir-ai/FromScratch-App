import { Router } from 'express';
import authRoutes from './authRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
