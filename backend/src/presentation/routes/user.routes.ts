import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, requireSuperAdmin, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// User ID validation schema
const userIdSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

// Create user schema — password rules aligned with auth.validators.ts
const createUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;':",.<>\/\\`~])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;':",.<>\/\\`~]{12,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  role: z.nativeEnum(UserRole),
});

// Update user schema
const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

// Query schema for listing users
const userListQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().max(100).optional(),
});

// Activity query schema
const activityQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  action: z.string().max(50).optional(),
});

// Get all users (Admin+)
router.get(
  '/',
  requireAdmin,
  validateQuery(userListQuerySchema),
  userController.getUsers.bind(userController)
);

// Get user by ID (Admin+)
router.get(
  '/:id',
  requireAdmin,
  validateParams(userIdSchema),
  userController.getUserById.bind(userController)
);

// Create user (SUPER_ADMIN only)
router.post(
  '/',
  requireSuperAdmin,
  validateBody(createUserSchema),
  userController.createUser.bind(userController)
);

// Update user (SUPER_ADMIN only)
router.patch(
  '/:id',
  requireSuperAdmin,
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  userController.updateUser.bind(userController)
);

// Delete user (SUPER_ADMIN only)
router.delete(
  '/:id',
  requireSuperAdmin,
  validateParams(userIdSchema),
  userController.deleteUser.bind(userController)
);

// Reset user password (SUPER_ADMIN only)
router.post(
  '/:id/reset-password',
  requireSuperAdmin,
  validateParams(userIdSchema),
  userController.resetPassword.bind(userController)
);

// Get user activity logs (Admin+)
router.get(
  '/:id/activity',
  requireAdmin,
  validateParams(userIdSchema),
  validateQuery(activityQuerySchema),
  userController.getUserActivity.bind(userController)
);

export default router;
