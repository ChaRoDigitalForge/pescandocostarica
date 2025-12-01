import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  refreshToken,
  changePassword,
  requestPasswordReset,
  logout
} from './controllers/authController.js';
import { authenticateToken } from './middleware/auth.js';
import { validateRequest } from './middleware/validation.js';
import { registerSchema, loginSchema, changePasswordSchema } from './validators/authValidators.js';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/password-reset/request', requestPasswordReset);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/refresh', authenticateToken, refreshToken);
router.post('/logout', authenticateToken, logout);
router.post('/password/change', authenticateToken, validateRequest(changePasswordSchema), changePassword);

export default router;
