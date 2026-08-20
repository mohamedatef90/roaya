import { Router } from 'express';
import { leadController } from '../controllers/lead.controller.js';
import { authenticate, requireSalesRep } from '../middleware/auth.js';
import { formRateLimiter } from '../middleware/rate-limiter.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import {
  createLeadSchema,
  updateLeadSchema,
  leadFiltersSchema,
  paginationSchema,
  leadIdSchema,
  addNoteSchema,
  addTagSchema,
  updateNoteSchema,
  noteIdSchema,
  createActivitySchema,
  activityQuerySchema,
} from '../validators/lead.validators.js';
import { z } from 'zod';

const router = Router();

// Public route - submit lead from form (rate limited)
router.post(
  '/submit',
  formRateLimiter,
  validateBody(createLeadSchema),
  leadController.createLead.bind(leadController)
);

// Admin routes - require authentication
router.use(authenticate);

// Get all leads with filters and pagination
router.get(
  '/',
  requireSalesRep,
  validateQuery(leadFiltersSchema.merge(paginationSchema)),
  leadController.getLeads.bind(leadController)
);

// Get dashboard stats
router.get(
  '/stats',
  requireSalesRep,
  leadController.getDashboardStats.bind(leadController)
);

// Get single lead
router.get(
  '/:id',
  requireSalesRep,
  validateParams(leadIdSchema),
  leadController.getLeadById.bind(leadController)
);

// Update lead
router.patch(
  '/:id',
  requireSalesRep,
  validateParams(leadIdSchema),
  validateBody(updateLeadSchema),
  leadController.updateLead.bind(leadController)
);

// Delete lead
router.delete(
  '/:id',
  requireSalesRep,
  validateParams(leadIdSchema),
  leadController.deleteLead.bind(leadController)
);

// Add tag to lead
router.post(
  '/:id/tags',
  requireSalesRep,
  validateParams(leadIdSchema),
  validateBody(addTagSchema),
  leadController.addTag.bind(leadController)
);

// Remove tag from lead
router.delete(
  '/:id/tags/:tagId',
  requireSalesRep,
  validateParams(leadIdSchema.extend({ tagId: z.string().uuid() })),
  leadController.removeTag.bind(leadController)
);

// Add note to lead
router.post(
  '/:id/notes',
  requireSalesRep,
  validateParams(leadIdSchema),
  validateBody(addNoteSchema),
  leadController.addNote.bind(leadController)
);

// Get lead activities (paginated)
router.get(
  '/:id/activities',
  requireSalesRep,
  validateParams(leadIdSchema),
  validateQuery(activityQuerySchema),
  leadController.getActivities.bind(leadController)
);

// Create manual activity (call, email, meeting)
router.post(
  '/:id/activities',
  requireSalesRep,
  validateParams(leadIdSchema),
  validateBody(createActivitySchema),
  leadController.createActivity.bind(leadController)
);

// Update note
router.patch(
  '/notes/:id',
  requireSalesRep,
  validateParams(noteIdSchema),
  validateBody(updateNoteSchema),
  leadController.updateNote.bind(leadController)
);

// Delete note
router.delete(
  '/notes/:id',
  requireSalesRep,
  validateParams(noteIdSchema),
  leadController.deleteNote.bind(leadController)
);

export default router;
