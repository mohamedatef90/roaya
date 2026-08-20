import { Request, Response, NextFunction } from 'express';
import { websiteAnalyticsService } from '../../application/services/website-analytics.service.js';

/**
 * Response Time Tracking Middleware (Feature 3: Health/Metrics)
 *
 * Tracks response times for all requests to calculate average response time metrics.
 * Used by the /health and /metrics endpoints to report performance data.
 */
export function responseTimeTracker(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Track response time when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Only track successful requests (2xx, 3xx status codes)
    if (res.statusCode < 400) {
      websiteAnalyticsService.trackResponseTime(duration);
    }
  });

  next();
}
