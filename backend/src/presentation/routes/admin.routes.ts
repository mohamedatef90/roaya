import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { userIdSchema, updateUserSchema } from '../validators/auth.validators.js';
import { z } from 'zod';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// User management (Super Admin only)
router.get('/users', requireSuperAdmin, adminController.getUsers.bind(adminController));

router.get(
  '/users/:id',
  requireSuperAdmin,
  validateParams(userIdSchema),
  adminController.getUserById.bind(adminController)
);

router.patch(
  '/users/:id',
  requireSuperAdmin,
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  adminController.updateUser.bind(adminController)
);

router.delete(
  '/users/:id',
  requireSuperAdmin,
  validateParams(userIdSchema),
  adminController.deleteUser.bind(adminController)
);

// Tag management (Admin+)
router.get('/tags', requireAdmin, adminController.getTags.bind(adminController));

router.post(
  '/tags',
  requireAdmin,
  validateBody(
    z.object({
      name: z.string().min(1).max(50),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
    })
  ),
  adminController.createTag.bind(adminController)
);

router.delete(
  '/tags/:id',
  requireAdmin,
  validateParams(z.object({ id: z.string().uuid() })),
  adminController.deleteTag.bind(adminController)
);

// System settings (Super Admin only)
router.get('/settings', requireSuperAdmin, adminController.getSettings.bind(adminController));

router.patch(
  '/settings/:key',
  requireSuperAdmin,
  validateParams(z.object({ key: z.string().min(1) })),
  validateBody(z.object({ value: z.unknown() })),
  adminController.updateSetting.bind(adminController)
);

export default router;
