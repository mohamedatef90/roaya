import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rate-limiter.js';
import { validateBody } from '../middleware/validation.js';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/auth.validators.js';

const router = Router();

// Public routes

// CSRF token endpoint - must be before CSRF protection
router.get('/csrf-token', authController.getCsrfToken.bind(authController));

router.post(
  '/login',
  loginRateLimiter,
  validateBody(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  authController.refresh.bind(authController)
);

// Protected routes
router.use(authenticate);

router.post('/logout', authController.logout.bind(authController));

router.get('/profile', authController.getProfile.bind(authController));

router.post(
  '/change-password',
  validateBody(changePasswordSchema),
  authController.changePassword.bind(authController)
);

// WebSocket token endpoint
router.get('/ws-token', authController.getWebSocketToken.bind(authController));

// Admin only - register new users
router.post(
  '/register',
  requireSuperAdmin,
  validateBody(registerSchema),
  authController.register.bind(authController)
);

export default router;
