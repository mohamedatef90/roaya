import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Overview metrics - accessible by all authenticated users
router.get('/overview', analyticsController.getOverview.bind(analyticsController));

// Conversion funnel - accessible by all authenticated users
router.get('/conversion-funnel', analyticsController.getConversionFunnel.bind(analyticsController));

// Sales cycle analysis - accessible by all authenticated users
router.get('/sales-cycle', analyticsController.getSalesCycle.bind(analyticsController));

// Source performance - accessible by all authenticated users
router.get('/source-performance', analyticsController.getSourcePerformance.bind(analyticsController));

// Team performance - requires at least SALES_MANAGER role
router.get(
  '/team-performance',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_MANAGER),
  analyticsController.getTeamPerformance.bind(analyticsController)
);

// Trends - accessible by all authenticated users
router.get('/trends', analyticsController.getTrends.bind(analyticsController));

// Export - requires at least ADMIN role
router.get(
  '/export',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  analyticsController.exportData.bind(analyticsController)
);

export default router;
