import { Router } from 'express';
import {
	login,
	register,
	currentUser,
	googleLoginRedirect,
	googleCallback,
	githubLoginRedirect,
	githubCallback,
	logout,
	forgotPasswordController,
	resetPasswordController,
	changePasswordController,
	getUserByIdController,
	searchUsersController
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/change-password', authenticate, changePasswordController);
router.get('/google/login', googleLoginRedirect);
router.get('/google/callback', googleCallback);
router.get('/github/login', githubLoginRedirect);
router.get('/github/callback', githubCallback);
router.get('/me', authenticate, currentUser);
router.get('/user/:id', authenticate, getUserByIdController);
router.get('/users/search', authenticate, searchUsersController);

export default router;
