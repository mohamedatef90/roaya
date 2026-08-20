import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../../application/services/analytics.service.js';
import { logger } from '../../shared/utils/logger.js';
import { z } from 'zod';

// Validation schemas
const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const exportSchema = z.object({
  format: z.enum(['csv', 'json']).default('json'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export class AnalyticsController {
  /**
   * GET /api/analytics/overview
   * Get dashboard overview metrics
   */
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = dateRangeSchema.parse(req.query);

      const dateRange = startDate && endDate
        ? { startDate: new Date(startDate), endDate: new Date(endDate) }
        : undefined;

      const overview = await analyticsService.getOverview(dateRange);

      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/conversion-funnel
   * Get conversion funnel data
   */
  async getConversionFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await analyticsService.getConversionFunnel();

      res.json({
        success: true,
        data: funnel,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/sales-cycle
   * Get average time per stage
   */
  async getSalesCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const salesCycle = await analyticsService.getSalesCycle();

      res.json({
        success: true,
        data: salesCycle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/source-performance
   * Get lead quality by source
   */
  async getSourcePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const sourcePerformance = await analyticsService.getSourcePerformance();

      res.json({
        success: true,
        data: sourcePerformance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/team-performance
   * Get sales rep metrics
   */
  async getTeamPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const teamPerformance = await analyticsService.getTeamPerformance();

      res.json({
        success: true,
        data: teamPerformance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/trends
   * Get time-series data
   */
  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = dateRangeSchema.parse(req.query);

      // Default to last 30 days if no date range provided
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      const dateRange = {
        startDate: startDate ? new Date(startDate) : defaultStartDate,
        endDate: endDate ? new Date(endDate) : defaultEndDate,
      };

      const trends = await analyticsService.getTrends(dateRange);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/export
   * Export analytics data as CSV or JSON
   */
  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const { format, startDate, endDate } = exportSchema.parse(req.query);

      const dateRange = startDate && endDate
        ? { startDate: new Date(startDate), endDate: new Date(endDate) }
        : undefined;

      const data = await analyticsService.exportData(format, dateRange);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${new Date().toISOString().split('T')[0]}.json`);
      }

      res.send(data);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
