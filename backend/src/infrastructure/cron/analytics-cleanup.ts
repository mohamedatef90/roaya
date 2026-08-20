/**
 * Analytics Data Retention & Daily Summary Cron Job
 *
 * This module provides automated data cleanup and daily aggregation for analytics data.
 *
 * Features:
 * - Runs daily at 03:00 UTC
 * - Aggregates daily summary before cleanup
 * - Batch deletion to avoid long locks
 * - Configurable retention periods via environment variables
 * - Comprehensive logging and error handling
 *
 * Retention Policies (configurable via env vars):
 * - session_recording_events: 30 days (RECORDING_RETENTION_DAYS)
 * - heatmap_clicks: 90 days (DATA_RETENTION_DAYS)
 * - page_views: 90 days (DATA_RETENTION_DAYS)
 * - analytics_sessions: 180 days (SESSION_RETENTION_DAYS)
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';

// ============================================
// CONFIGURATION
// ============================================

interface RetentionConfig {
  recordingRetentionDays: number;
  dataRetentionDays: number;
  sessionRetentionDays: number;
  batchSize: number;
  cronTime: string;
}

const config: RetentionConfig = {
  recordingRetentionDays: parseInt(process.env.RECORDING_RETENTION_DAYS || '30', 10),
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '90', 10),
  sessionRetentionDays: parseInt(process.env.SESSION_RETENTION_DAYS || '180', 10),
  batchSize: 1000,
  cronTime: '03:00', // UTC time in HH:mm format
};

// ============================================
// DAILY SUMMARY AGGREGATION
// ============================================

/**
 * Compute and store daily analytics summary for a specific date
 * This runs before cleanup to ensure we have aggregated data before deleting raw events
 */
async function computeDailySummary(summaryDate: Date): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting daily summary computation', { summaryDate: summaryDate.toISOString() });

  try {
    // Check if summary already exists
    const existingSummary = await prisma.analyticsDailySummary.findUnique({
      where: { summaryDate },
    });

    if (existingSummary) {
      logger.info('Daily summary already exists, skipping', { summaryDate: summaryDate.toISOString() });
      return;
    }

    // Calculate date range (00:00:00 to 23:59:59.999 UTC)
    const startOfDay = new Date(summaryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(summaryDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 1. Total sessions and unique visitors
    const sessionStats = await prisma.analyticsSession.aggregate({
      where: {
        startedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isBot: false,
      },
      _count: {
        id: true,
      },
    });

    const totalSessions = sessionStats._count.id;

    const uniqueVisitors = await prisma.analyticsSession.groupBy({
      by: ['visitorId'],
      where: {
        startedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isBot: false,
      },
      _count: {
        visitorId: true,
      },
    });

    const uniqueVisitorsCount = uniqueVisitors.length;

    // 2. Total page views
    const pageViewStats = await prisma.pageView.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalPageViews = pageViewStats._count.id;

    // 3. Average session duration (calculate from sessions with endedAt)
    const sessionsWithDuration = await prisma.$queryRaw<Array<{ avg_duration: number }>>`
      SELECT
        COALESCE(AVG(EXTRACT(EPOCH FROM (ended_at - started_at))), 0) as avg_duration
      FROM analytics_sessions
      WHERE started_at >= ${startOfDay}
        AND started_at <= ${endOfDay}
        AND ended_at IS NOT NULL
        AND is_bot = false
    `;

    const avgSessionDuration = sessionsWithDuration[0]?.avg_duration || 0;

    // 4. Bounce count (sessions with exactly 1 page view)
    const bounceCountResult = await prisma.$queryRaw<Array<{ bounce_count: bigint }>>`
      SELECT COUNT(*) as bounce_count
      FROM analytics_sessions
      WHERE started_at >= ${startOfDay}
        AND started_at <= ${endOfDay}
        AND page_count = 1
        AND is_bot = false
    `;

    const bounceCount = Number(bounceCountResult[0]?.bounce_count || 0);

    // 5. Top 10 pages by views
    const topPagesData = await prisma.$queryRaw<Array<{ path: string; view_count: bigint }>>`
      SELECT
        path,
        COUNT(*) as view_count
      FROM page_views
      WHERE created_at >= ${startOfDay}
        AND created_at <= ${endOfDay}
      GROUP BY path
      ORDER BY view_count DESC
      LIMIT 10
    `;

    const topPages = topPagesData.map(row => ({
      path: row.path,
      views: Number(row.view_count),
    }));

    // 6. Device breakdown
    const deviceData = await prisma.$queryRaw<Array<{ device: string | null; count: bigint }>>`
      SELECT
        device,
        COUNT(*) as count
      FROM analytics_sessions
      WHERE started_at >= ${startOfDay}
        AND started_at <= ${endOfDay}
        AND is_bot = false
      GROUP BY device
    `;

    const deviceBreakdown: Record<string, number> = {};
    deviceData.forEach(row => {
      const device = row.device || 'unknown';
      deviceBreakdown[device] = Number(row.count);
    });

    // 7. Country breakdown
    const countryData = await prisma.$queryRaw<Array<{ country: string | null; count: bigint }>>`
      SELECT
        country,
        COUNT(*) as count
      FROM analytics_sessions
      WHERE started_at >= ${startOfDay}
        AND started_at <= ${endOfDay}
        AND is_bot = false
      GROUP BY country
    `;

    const countryBreakdown: Record<string, number> = {};
    countryData.forEach(row => {
      const country = row.country || 'unknown';
      countryBreakdown[country] = Number(row.count);
    });

    // 8. Browser breakdown
    const browserData = await prisma.$queryRaw<Array<{ browser: string | null; count: bigint }>>`
      SELECT
        browser,
        COUNT(*) as count
      FROM analytics_sessions
      WHERE started_at >= ${startOfDay}
        AND started_at <= ${endOfDay}
        AND is_bot = false
      GROUP BY browser
    `;

    const browserBreakdown: Record<string, number> = {};
    browserData.forEach(row => {
      const browser = row.browser || 'unknown';
      browserBreakdown[browser] = Number(row.count);
    });

    // 9. Referrer breakdown
    const referrerData = await prisma.$queryRaw<Array<{ referrer: string | null; count: bigint }>>`
      SELECT
        referrer,
        COUNT(*) as count
      FROM analytics_sessions
      WHERE started_at >= ${startOfDay}
        AND started_at <= ${endOfDay}
        AND is_bot = false
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 20
    `;

    const referrerBreakdown: Record<string, number> = {};
    referrerData.forEach(row => {
      const referrer = row.referrer || 'direct';
      referrerBreakdown[referrer] = Number(row.count);
    });

    // Upsert daily summary
    await prisma.analyticsDailySummary.upsert({
      where: { summaryDate },
      create: {
        summaryDate,
        totalSessions,
        uniqueVisitors: uniqueVisitorsCount,
        totalPageViews,
        avgSessionDuration: new Prisma.Decimal(avgSessionDuration.toFixed(2)),
        bounceCount,
        topPages: topPages as Prisma.InputJsonValue,
        deviceBreakdown: deviceBreakdown as Prisma.InputJsonValue,
        countryBreakdown: countryBreakdown as Prisma.InputJsonValue,
        browserBreakdown: browserBreakdown as Prisma.InputJsonValue,
        referrerBreakdown: referrerBreakdown as Prisma.InputJsonValue,
      },
      update: {
        totalSessions,
        uniqueVisitors: uniqueVisitorsCount,
        totalPageViews,
        avgSessionDuration: new Prisma.Decimal(avgSessionDuration.toFixed(2)),
        bounceCount,
        topPages: topPages as Prisma.InputJsonValue,
        deviceBreakdown: deviceBreakdown as Prisma.InputJsonValue,
        countryBreakdown: countryBreakdown as Prisma.InputJsonValue,
        browserBreakdown: browserBreakdown as Prisma.InputJsonValue,
        referrerBreakdown: referrerBreakdown as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
    });

    const duration = Date.now() - startTime;
    logger.info('Daily summary computation completed', {
      summaryDate: summaryDate.toISOString(),
      totalSessions,
      uniqueVisitors: uniqueVisitorsCount,
      totalPageViews,
      durationMs: duration,
    });
  } catch (error) {
    logger.error('Failed to compute daily summary', {
      summaryDate: summaryDate.toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// ============================================
// STALE SESSION CLEANUP
// ============================================

/**
 * Auto-close sessions that have been open for more than 4 hours.
 * These are likely from users who left without triggering beforeunload.
 */
async function autoCloseStaleSessions(): Promise<number> {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  try {
    const result = await prisma.analyticsSession.updateMany({
      where: {
        startedAt: { lte: fourHoursAgo },
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });

    if (result.count > 0) {
      logger.info('Auto-closed stale sessions', { count: result.count });
    }

    return result.count;
  } catch (error) {
    logger.error('Failed to auto-close stale sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 0;
  }
}

// ============================================
// DATA CLEANUP FUNCTIONS
// ============================================

/**
 * Delete rows in batches to avoid long table locks
 */
async function batchDelete(
  tableName: string,
  retentionDays: number,
  dateColumn: string = 'created_at'
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - retentionDays);

  let totalDeleted = 0;
  let hasMore = true;

  logger.info(`Starting batch deletion for ${tableName}`, {
    cutoffDate: cutoffDate.toISOString(),
    retentionDays,
  });

  while (hasMore) {
    try {
      // Use raw SQL for better performance
      const result = await prisma.$executeRawUnsafe(`
        DELETE FROM ${tableName}
        WHERE id IN (
          SELECT id
          FROM ${tableName}
          WHERE ${dateColumn} < $1
          LIMIT $2
        )
      `, cutoffDate, config.batchSize);

      totalDeleted += result;
      hasMore = result >= config.batchSize;

      if (hasMore) {
        // Small delay between batches to reduce DB load
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      logger.error(`Batch deletion failed for ${tableName}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  logger.info(`Batch deletion completed for ${tableName}`, {
    totalDeleted,
    cutoffDate: cutoffDate.toISOString(),
  });

  return totalDeleted;
}

/**
 * Clean up session recording events (oldest data, largest storage)
 */
async function cleanupSessionRecordings(): Promise<number> {
  return batchDelete(
    'session_recording_events',
    config.recordingRetentionDays,
    'created_at'
  );
}

/**
 * Clean up heatmap click data
 */
async function cleanupHeatmapClicks(): Promise<number> {
  return batchDelete(
    'heatmap_clicks',
    config.dataRetentionDays,
    'created_at'
  );
}

/**
 * Clean up page view data
 */
async function cleanupPageViews(): Promise<number> {
  return batchDelete(
    'page_views',
    config.dataRetentionDays,
    'created_at'
  );
}

/**
 * Clean up analytics sessions (keep longest due to foreign key relationships)
 */
async function cleanupAnalyticsSessions(): Promise<number> {
  return batchDelete(
    'analytics_sessions',
    config.sessionRetentionDays,
    'started_at'
  );
}

// ============================================
// MAIN CLEANUP ORCHESTRATOR
// ============================================

/**
 * Main cleanup function that orchestrates all cleanup tasks
 */
export async function runAnalyticsCleanup(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting analytics data cleanup job', {
    config: {
      recordingRetentionDays: config.recordingRetentionDays,
      dataRetentionDays: config.dataRetentionDays,
      sessionRetentionDays: config.sessionRetentionDays,
      batchSize: config.batchSize,
    },
  });

  try {
    // Step 1: Compute yesterday's daily summary (if not already exists)
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);

    await computeDailySummary(yesterday);

    // Step 2: Auto-close stale sessions (4+ hours open without endedAt)
    await autoCloseStaleSessions();

    // Step 3: Run cleanup tasks (order matters - clean children before parents)
    const results = {
      sessionRecordings: 0,
      heatmapClicks: 0,
      pageViews: 0,
      analyticsSessions: 0,
    };

    // Clean session recordings first (child of sessions)
    results.sessionRecordings = await cleanupSessionRecordings();

    // Clean heatmap clicks (child of sessions)
    results.heatmapClicks = await cleanupHeatmapClicks();

    // Clean page views (child of sessions)
    results.pageViews = await cleanupPageViews();

    // Finally clean sessions (parent table)
    results.analyticsSessions = await cleanupAnalyticsSessions();

    const duration = Date.now() - startTime;
    const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);

    logger.info('Analytics cleanup completed successfully', {
      results,
      totalDeleted,
      durationMs: duration,
      durationMinutes: (duration / 1000 / 60).toFixed(2),
    });
  } catch (error) {
    logger.error('Analytics cleanup failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

// ============================================
// SCHEDULER
// ============================================

let cleanupInterval: NodeJS.Timeout | null = null;
let lastRunDate: string | null = null;

/**
 * Check if it's time to run the cleanup job (03:00 UTC)
 */
function shouldRunCleanup(): boolean {
  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  // Parse configured cron time
  const [targetHour, targetMinute] = config.cronTime.split(':').map(Number);

  // Check if we're in the target hour and haven't run today yet
  const isTargetTime = currentHour === targetHour && currentMinute === targetMinute;
  const hasNotRunToday = lastRunDate !== currentDateStr;

  return isTargetTime && hasNotRunToday;
}

/**
 * Scheduler tick function (runs every minute)
 */
async function schedulerTick(): Promise<void> {
  try {
    if (shouldRunCleanup()) {
      const currentDateStr = new Date().toISOString().split('T')[0] ?? null;
      logger.info('Triggering scheduled analytics cleanup');

      await runAnalyticsCleanup();

      lastRunDate = currentDateStr;
      logger.info('Scheduled cleanup completed', { date: currentDateStr });
    }
  } catch (error) {
    logger.error('Scheduled cleanup failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Start the analytics cleanup scheduler
 */
export function startAnalyticsCleanupScheduler(): void {
  if (cleanupInterval) {
    logger.warn('Analytics cleanup scheduler is already running');
    return;
  }

  logger.info('Starting analytics cleanup scheduler', {
    cronTime: `${config.cronTime} UTC`,
    retentionPolicies: {
      recordings: `${config.recordingRetentionDays} days`,
      data: `${config.dataRetentionDays} days`,
      sessions: `${config.sessionRetentionDays} days`,
    },
  });

  // Check every minute
  cleanupInterval = setInterval(schedulerTick, 60 * 1000);

  // Run initial check immediately (in case we're starting at the right time)
  schedulerTick().catch(error => {
    logger.error('Initial scheduler tick failed', { error });
  });
}

/**
 * Stop the analytics cleanup scheduler
 */
export function stopAnalyticsCleanupScheduler(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    lastRunDate = null;
    logger.info('Analytics cleanup scheduler stopped');
  }
}

// ============================================
// MANUAL TRIGGER (for testing/admin)
// ============================================

/**
 * Manually trigger cleanup (useful for testing or admin panel)
 */
export async function triggerManualCleanup(): Promise<{
  success: boolean;
  results?: {
    sessionRecordings: number;
    heatmapClicks: number;
    pageViews: number;
    analyticsSessions: number;
  };
  error?: string;
}> {
  try {
    await runAnalyticsCleanup();
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get cleanup status
 */
export function getCleanupStatus(): {
  isRunning: boolean;
  lastRunDate: string | null;
  nextRunTime: string;
  config: RetentionConfig;
} {
  return {
    isRunning: cleanupInterval !== null,
    lastRunDate,
    nextRunTime: `Daily at ${config.cronTime} UTC`,
    config,
  };
}
