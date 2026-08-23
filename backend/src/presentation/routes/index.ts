import { Router } from 'express';
import leadRoutes from './lead.routes.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';
import analyticsRoutes from './analytics.routes.js';
import contentRoutes from './content.routes.js';
import logoRoutes from './logo.routes.js';
import documentationRoutes from './documentation.routes.js';
import websiteAnalyticsRoutes from './website-analytics.routes.js';
import publicContentRoutes from './public-content.routes.js';
import publicLogoRoutes from './public-logo.routes.js';
import { healthCheck, redisHealthCheck } from '../../config/index.js';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  const dbHealthy = await healthCheck();
  const redisHealthy = await redisHealthCheck();

  const status = dbHealthy && redisHealthy ? 'healthy' : 'unhealthy';
  const statusCode = status === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'up' : 'down',
      redis: redisHealthy ? 'up' : 'down',
    },
  });
});

// API routes
router.use('/leads', leadRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', contentRoutes);
router.use('/admin', logoRoutes);
router.use('/docs', documentationRoutes);
router.use('/content', publicContentRoutes);
router.use('/public', publicLogoRoutes);
router.use('/website-analytics', websiteAnalyticsRoutes);

export default router;
