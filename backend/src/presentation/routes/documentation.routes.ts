import { Router } from 'express';
import { documentationController } from '../controllers/documentation.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  categoryIdSchema,
  createPageSchema,
  updatePageSchema,
  pageIdSchema,
  pageSlugSchema,
  pageFiltersSchema,
} from '../validators/documentation.validators.js';

const router = Router();

// ============================================
// PUBLIC ENDPOINTS
// ============================================

// Get category tree (public - shows only published pages)
router.get(
  '/categories',
  validateQuery(pageFiltersSchema),
  documentationController.getCategories.bind(documentationController)
);

// Get page by slug (public)
router.get(
  '/pages/slug/:slug',
  validateParams(pageSlugSchema),
  documentationController.getPageBySlug.bind(documentationController)
);

// ============================================
// ADMIN ENDPOINTS - CATEGORIES
// ============================================

router.use(authenticate);

// Get category by ID (admin)
router.get(
  '/categories/:id',
  requireAdmin,
  validateParams(categoryIdSchema),
  documentationController.getCategoryById.bind(documentationController)
);

// Create category (admin)
router.post(
  '/categories',
  requireAdmin,
  validateBody(createCategorySchema),
  documentationController.createCategory.bind(documentationController)
);

// Update category (admin)
router.patch(
  '/categories/:id',
  requireAdmin,
  validateParams(categoryIdSchema),
  validateBody(updateCategorySchema),
  documentationController.updateCategory.bind(documentationController)
);

// Delete category (admin)
router.delete(
  '/categories/:id',
  requireAdmin,
  validateParams(categoryIdSchema),
  documentationController.deleteCategory.bind(documentationController)
);

// Reorder categories (admin)
router.patch(
  '/categories-reorder',
  requireAdmin,
  validateBody(reorderCategoriesSchema),
  documentationController.reorderCategories.bind(documentationController)
);

// ============================================
// ADMIN ENDPOINTS - PAGES
// ============================================

// Get all pages (admin - can see unpublished)
router.get(
  '/pages',
  requireAdmin,
  validateQuery(pageFiltersSchema),
  documentationController.getPages.bind(documentationController)
);

// Get page by ID (admin)
router.get(
  '/pages/:id',
  requireAdmin,
  validateParams(pageIdSchema),
  documentationController.getPageById.bind(documentationController)
);

// Create page (admin)
router.post(
  '/pages',
  requireAdmin,
  validateBody(createPageSchema),
  documentationController.createPage.bind(documentationController)
);

// Update page (admin)
router.patch(
  '/pages/:id',
  requireAdmin,
  validateParams(pageIdSchema),
  validateBody(updatePageSchema),
  documentationController.updatePage.bind(documentationController)
);

// Delete page (admin)
router.delete(
  '/pages/:id',
  requireAdmin,
  validateParams(pageIdSchema),
  documentationController.deletePage.bind(documentationController)
);

// Duplicate page (admin)
router.post(
  '/pages/:id/duplicate',
  requireAdmin,
  validateParams(pageIdSchema),
  documentationController.duplicatePage.bind(documentationController)
);

export default router;
