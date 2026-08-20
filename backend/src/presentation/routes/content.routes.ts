import { Router } from 'express';
import { contentController } from '../controllers/content.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All content routes require authentication
router.use(authenticate);

// ===========================================
// CONTENT ITEMS ROUTES
// ===========================================

// Get all content items
router.get('/content', contentController.getContents.bind(contentController));

// Get content by ID
router.get('/content/:id', contentController.getContentById.bind(contentController));

// Create content - requires ADMIN or higher
router.post(
  '/content',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.createContent.bind(contentController)
);

// Update content - requires ADMIN or higher
router.patch(
  '/content/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.updateContent.bind(contentController)
);

// Delete content - requires ADMIN or higher
router.delete(
  '/content/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.deleteContent.bind(contentController)
);

// Publish/Unpublish content - requires ADMIN or higher
router.post(
  '/content/:id/publish',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.publishContent.bind(contentController)
);

router.post(
  '/content/:id/unpublish',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.unpublishContent.bind(contentController)
);

// ===========================================
// PACKAGES ROUTES
// ===========================================

router.get('/packages', contentController.getPackages.bind(contentController));
router.get('/packages/:id', contentController.getPackageById.bind(contentController));

router.post(
  '/packages',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.createPackage.bind(contentController)
);

router.patch(
  '/packages/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.updatePackage.bind(contentController)
);

router.delete(
  '/packages/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.deletePackage.bind(contentController)
);

router.patch(
  '/packages/reorder',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.reorderPackages.bind(contentController)
);

// ===========================================
// TEAM ROUTES
// ===========================================

router.get('/team', contentController.getTeamMembers.bind(contentController));
router.get('/team/departments', contentController.getDepartments.bind(contentController));
router.get('/team/:id', contentController.getTeamMemberById.bind(contentController));

router.post(
  '/team',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.createTeamMember.bind(contentController)
);

router.patch(
  '/team/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.updateTeamMember.bind(contentController)
);

router.delete(
  '/team/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.deleteTeamMember.bind(contentController)
);

router.patch(
  '/team/reorder',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.reorderTeamMembers.bind(contentController)
);

// ===========================================
// TESTIMONIALS ROUTES
// ===========================================

router.get('/testimonials', contentController.getTestimonials.bind(contentController));
router.get('/testimonials/:id', contentController.getTestimonialById.bind(contentController));

router.post(
  '/testimonials',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.createTestimonial.bind(contentController)
);

router.patch(
  '/testimonials/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.updateTestimonial.bind(contentController)
);

router.delete(
  '/testimonials/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.deleteTestimonial.bind(contentController)
);

router.patch(
  '/testimonials/reorder',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.reorderTestimonials.bind(contentController)
);

router.patch(
  '/testimonials/:id/toggle-featured',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  contentController.toggleTestimonialFeatured.bind(contentController)
);

export default router;
