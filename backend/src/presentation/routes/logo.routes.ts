import { Router } from 'express';
import { logoController } from '../controllers/logo.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

// ===========================================
// LOGO ROUTES
// ===========================================

// Legacy admin namespace. Public reads use /public/logos; every route in this
// router is authenticated explicitly so security never depends on mount order.
router.use(authenticate);

// Admin list includes inactive records needed by the management UI.
router.get('/logos', logoController.getLogos.bind(logoController));

// Get logo by ID
router.get('/logos/:id', logoController.getLogoById.bind(logoController));

// Create logo - requires ADMIN or higher
router.post(
  '/logos',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.createLogo.bind(logoController)
);

// Update logo - requires ADMIN or higher
router.patch(
  '/logos/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.updateLogo.bind(logoController)
);

// Delete logo - requires ADMIN or higher
router.delete(
  '/logos/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.deleteLogo.bind(logoController)
);

// Reorder logos - requires ADMIN or higher
router.patch(
  '/logos-reorder',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.reorderLogos.bind(logoController)
);

// Toggle logo active status - requires ADMIN or higher
router.patch(
  '/logos/:id/toggle-active',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.toggleLogoActive.bind(logoController)
);

// ===========================================
// EMAIL TEMPLATE ROUTES
// ===========================================

// Get all email templates (admin only)
router.get('/email-templates', logoController.getEmailTemplates.bind(logoController));

// Get email template by ID
router.get('/email-templates/:id', logoController.getEmailTemplateById.bind(logoController));

// Create email template - requires ADMIN or higher
router.post(
  '/email-templates',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.createEmailTemplate.bind(logoController)
);

// Update email template - requires ADMIN or higher
router.patch(
  '/email-templates/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.updateEmailTemplate.bind(logoController)
);

// Delete email template - requires ADMIN or higher
router.delete(
  '/email-templates/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.deleteEmailTemplate.bind(logoController)
);

// Send test email - requires ADMIN or higher
router.post(
  '/email-templates/:id/test',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.sendTestEmail.bind(logoController)
);

// Toggle email template active status - requires ADMIN or higher
router.patch(
  '/email-templates/:id/toggle-active',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  logoController.toggleEmailTemplateActive.bind(logoController)
);

export default router;
