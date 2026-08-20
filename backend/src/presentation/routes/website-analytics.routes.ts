import { Router, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { websiteAnalyticsController } from '../controllers/website-analytics.controller.js';
import { authenticate, requireSalesRep } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';
import { apiRateLimiter } from '../middleware/rate-limiter.js';
import rateLimit from 'express-rate-limit';
import { logger } from '../../shared/utils/logger.js';
import {
  trackPageViewSchema,
  trackClickSchema,
  startSessionSchema,
  endSessionSchema,
  updatePageViewDurationSchema,
  dateRangeSchema,
  heatmapPathSchema,
  sessionFiltersSchema,
  storeRecordingEventsSchema,
  trackEventSchema,
  eventFiltersSchema,
} from '../validators/website-analytics.validators.js';

const router = Router();

// ============================================
// HEALTH CHECK & METRICS (No Auth Required) - Feature 3
// ============================================

// Enhanced health check endpoint with metrics
router.get('/health', websiteAnalyticsController.getHealthMetrics.bind(websiteAnalyticsController));

// Prometheus metrics endpoint
router.get('/metrics', websiteAnalyticsController.getPrometheusMetrics.bind(websiteAnalyticsController));

// ============================================
// CORS CONFIGURATION FOR TRACKING ENDPOINTS
// ============================================

const allowedOrigins = [
  'https://www.roaya.co',
  'https://roaya.co',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:4200', 'http://localhost:3000'] : []),
];

const trackingCorsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, sendBeacon, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('[CORS] Blocked tracking request from unauthorized origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Content-Encoding', 'X-Original-Content-Type'],
};

// Apply CORS to all tracking endpoints
router.use('/tracking', cors(trackingCorsOptions));

// ============================================
// PUBLIC TRACKING ENDPOINTS (Rate Limited)
// ============================================

// Optimization 5: Separate rate limiters for different tracking endpoint types

// Session start: 5 requests per minute per IP (prevent session flooding)
const sessionStartLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: {
      code: 'SESSION_RATE_LIMIT_EXCEEDED',
      message: 'Too many session start requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Page view: 30 requests per minute per IP
const pageViewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: {
      code: 'PAGEVIEW_RATE_LIMIT_EXCEEDED',
      message: 'Too many page view requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Click tracking: 60 requests per minute per IP
const clickLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: {
      code: 'CLICK_RATE_LIMIT_EXCEEDED',
      message: 'Too many click tracking requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Recording events: 20 requests per minute per IP
const recordingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    error: {
      code: 'RECORDING_RATE_LIMIT_EXCEEDED',
      message: 'Too many recording requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General tracking limiter for other endpoints
const generalTrackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: {
      code: 'TRACKING_RATE_LIMIT_EXCEEDED',
      message: 'Too many tracking requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Track page view
router.post(
  '/tracking/pageview',
  pageViewLimiter,
  validateBody(trackPageViewSchema),
  websiteAnalyticsController.trackPageView.bind(websiteAnalyticsController)
);

// Update page view duration and scroll depth
router.post(
  '/tracking/pageview/duration',
  pageViewLimiter,
  validateBody(updatePageViewDurationSchema),
  websiteAnalyticsController.updatePageViewDuration.bind(websiteAnalyticsController)
);

// Track click for heatmap
router.post(
  '/tracking/click',
  clickLimiter,
  validateBody(trackClickSchema),
  websiteAnalyticsController.trackClick.bind(websiteAnalyticsController)
);

// Start session
router.post(
  '/tracking/session/start',
  sessionStartLimiter,
  validateBody(startSessionSchema),
  websiteAnalyticsController.startSession.bind(websiteAnalyticsController)
);

// End session
router.post(
  '/tracking/session/end',
  generalTrackingLimiter,
  validateBody(endSessionSchema),
  websiteAnalyticsController.endSession.bind(websiteAnalyticsController)
);

// Store session recording events
router.post(
  '/tracking/recording',
  recordingLimiter,
  validateBody(storeRecordingEventsSchema),
  websiteAnalyticsController.storeRecordingEvents.bind(websiteAnalyticsController)
);

// Get tracking script (public, cached)
router.get(
  '/tracking/script',
  websiteAnalyticsController.getTrackingScript.bind(websiteAnalyticsController)
);

// Track custom event (Feature 2)
router.post(
  '/tracking/event',
  generalTrackingLimiter,
  validateBody(trackEventSchema),
  websiteAnalyticsController.trackEvent.bind(websiteAnalyticsController)
);

// ============================================
// ADMIN ANALYTICS ENDPOINTS
// ============================================

router.use(authenticate);
router.use(requireSalesRep);

// Get overview dashboard
router.get(
  '/overview',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getOverview.bind(websiteAnalyticsController)
);

// Get top pages
router.get(
  '/top-pages',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getTopPages.bind(websiteAnalyticsController)
);

// Get top countries
router.get(
  '/countries',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getTopCountries.bind(websiteAnalyticsController)
);

// Get device breakdown
router.get(
  '/devices',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getDeviceBreakdown.bind(websiteAnalyticsController)
);

// Get browser breakdown
router.get(
  '/browsers',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getBrowserBreakdown.bind(websiteAnalyticsController)
);

// Get referrer breakdown
router.get(
  '/referrers',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getReferrerBreakdown.bind(websiteAnalyticsController)
);

// Get page views over time
router.get(
  '/page-views',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getPageViewsOverTime.bind(websiteAnalyticsController)
);

// Get heatmap data for specific path
router.get(
  '/heatmap/:path(*)',
  apiRateLimiter,
  validateParams(heatmapPathSchema),
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getHeatmapData.bind(websiteAnalyticsController)
);

// Get sessions list
router.get(
  '/sessions',
  apiRateLimiter,
  validateQuery(sessionFiltersSchema),
  websiteAnalyticsController.getSessionsList.bind(websiteAnalyticsController)
);

// Get active visitors (real-time)
router.get(
  '/active',
  apiRateLimiter,
  websiteAnalyticsController.getActiveVisitors.bind(websiteAnalyticsController)
);

// Get session recording events
router.get(
  '/sessions/:sessionId/recording',
  apiRateLimiter,
  websiteAnalyticsController.getSessionRecording.bind(websiteAnalyticsController)
);

// Custom Events endpoints (Feature 2)
router.get(
  '/events',
  apiRateLimiter,
  validateQuery(eventFiltersSchema),
  websiteAnalyticsController.getEvents.bind(websiteAnalyticsController)
);

router.get(
  '/events/summary',
  apiRateLimiter,
  validateQuery(dateRangeSchema),
  websiteAnalyticsController.getEventsSummary.bind(websiteAnalyticsController)
);

export default router;
