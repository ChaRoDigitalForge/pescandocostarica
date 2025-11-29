import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  refreshToken,
  changePassword,
  requestPasswordReset
} from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/password-reset/request', requestPasswordReset);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.post('/refresh', authenticate, refreshToken);
router.post('/password/change', authenticate, changePassword);

export default router;
