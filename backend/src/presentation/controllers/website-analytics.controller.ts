import { Request, Response, NextFunction } from 'express';
import { websiteAnalyticsService } from '../../application/services/website-analytics.service.js';
import { AuthenticatedRequest, ApiResponse } from '../../shared/types/index.js';

export class WebsiteAnalyticsController {
  // ============================================
  // PUBLIC TRACKING ENDPOINTS
  // ============================================

  async trackPageView(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId, path, referrer } = req.body;

      const pageView = await websiteAnalyticsService.trackPageView({
        sessionId,
        path,
        referrer,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        // These would typically be enriched server-side with IP geolocation
        country: req.body.country,
        device: req.body.device,
        browser: req.body.browser,
      });

      res.status(201).json({
        success: true,
        data: { id: pageView.id },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePageViewDuration(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId, path, duration, scrollDepth } = req.body;

      const updated = await websiteAnalyticsService.updatePageViewDuration(
        sessionId,
        path,
        duration,
        scrollDepth
      );

      res.json({
        success: true,
        data: { updated: !!updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async trackClick(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const click = await websiteAnalyticsService.trackClick(req.body);

      res.status(201).json({
        success: true,
        data: { id: click.id },
      });
    } catch (error) {
      next(error);
    }
  }

  async startSession(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check for existing visitor ID in cookie
      const visitorIdFromCookie = req.cookies?.ra_visitor_id;

      // Start session (backend generates visitor ID if cookie doesn't exist)
      const { session, visitorId } = await websiteAnalyticsService.startSession(
        {
          ...req.body,
          userAgent: req.headers['user-agent'],
        },
        visitorIdFromCookie
      );

      // Set httpOnly cookie for visitor ID (1 year expiration)
      res.cookie('ra_visitor_id', visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        path: '/',
      });

      res.status(201).json({
        success: true,
        data: { id: session.id, visitorId },
      });
    } catch (error) {
      next(error);
    }
  }

  async endSession(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId } = req.body;
      await websiteAnalyticsService.endSession(sessionId);

      res.json({
        success: true,
        data: { message: 'Session ended successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async storeRecordingEvents(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const record = await websiteAnalyticsService.storeRecordingEvents(req.body);

      res.status(201).json({
        success: true,
        data: { id: record.id },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ADMIN ANALYTICS ENDPOINTS
  // ============================================

  async getOverview(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      const overview = await websiteAnalyticsService.getOverview({ from, to });

      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopPages(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const pages = await websiteAnalyticsService.getTopPages({ from, to }, limit);

      res.json({
        success: true,
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopCountries(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const countries = await websiteAnalyticsService.getTopCountries({ from, to }, limit);

      res.json({
        success: true,
        data: countries,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceBreakdown(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      const devices = await websiteAnalyticsService.getDeviceBreakdown({ from, to });

      res.json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBrowserBreakdown(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      const browsers = await websiteAnalyticsService.getBrowserBreakdown({ from, to });

      res.json({
        success: true,
        data: browsers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferrerBreakdown(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      const referrers = await websiteAnalyticsService.getReferrerBreakdown({ from, to });

      res.json({
        success: true,
        data: referrers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPageViewsOverTime(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const granularity = (req.query.granularity as 'day' | 'week' | 'month') || 'day';

      const data = await websiteAnalyticsService.getPageViewsOverTime({ from, to }, granularity);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHeatmapData(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { path } = req.params;
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      const clicks = await websiteAnalyticsService.getHeatmapData(path!, { from, to });

      res.json({
        success: true,
        data: clicks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionsList(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        device: req.query.device as string | undefined,
        country: req.query.country as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = await websiteAnalyticsService.getSessionsList(filters) as {
        sessions: unknown[];
        meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
      };

      res.json({
        success: true,
        data: result.sessions,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveVisitors(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await websiteAnalyticsService.getActiveVisitors();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionRecording(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const data = await websiteAnalyticsService.getSessionRecording(sessionId!);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrackingScript(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const script = await websiteAnalyticsService.getTrackingScript();

      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(script);
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // CUSTOM EVENT TRACKING (Feature 2)
  // ============================================

  async trackEvent(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await websiteAnalyticsService.trackEvent(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvents(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        eventName: req.query.eventName as string | undefined,
        eventCategory: req.query.eventCategory as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      };

      const events = await websiteAnalyticsService.getEvents(filters);

      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventsSummary(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();

      const summary = await websiteAnalyticsService.getEventsSummary({ from, to });

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // HEALTH & METRICS (Feature 3)
  // ============================================

  async getHealthMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const metrics = await websiteAnalyticsService.getHealthMetrics();
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  async getPrometheusMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const metrics = await websiteAnalyticsService.getPrometheusMetrics();
      res.setHeader('Content-Type', 'text/plain; version=0.0.4');
      res.send(metrics);
    } catch (error) {
      next(error);
    }
  }
}

export const websiteAnalyticsController = new WebsiteAnalyticsController();
