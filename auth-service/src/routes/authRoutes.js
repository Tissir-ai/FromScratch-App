const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, name } = req.body;
    const result = await authService.register({ email, password, name });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/auth/me - Get current user profile (protected route)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = authService.verifyToken(token);
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
