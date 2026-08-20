import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { NotFoundError } from '../../domain/exceptions/index.js';
import crypto from 'crypto';

interface TrackPageViewDTO {
  sessionId: string;
  path: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  device?: string;
  browser?: string;
  duration?: number;
}

interface TrackClickDTO {
  sessionId: string;
  path: string;
  x: number;
  y: number;
  elementTag?: string;
  elementId?: string;
  elementClass?: string;
}

interface StartSessionDTO {
  visitorId?: string; // Optional - backend generates if missing
  country?: string;
  device?: string;
  browser?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface TrackEventDTO {
  sessionId: string;
  eventName: string;
  eventCategory: string;
  eventData?: Record<string, unknown>;
  pagePath: string;
}

interface EventFilters {
  startDate?: Date;
  endDate?: Date;
  eventName?: string;
  eventCategory?: string;
  limit?: number;
  offset?: number;
}

interface SessionFilters {
  startDate?: Date;
  endDate?: Date;
  device?: string;
  country?: string;
  page?: number;
  limit?: number;
}

// In-memory cache for analytics endpoints (Optimization 2)
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class WebsiteAnalyticsService {
  // In-memory cache with 30-second TTL
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  // Bot detection patterns
  private readonly BOT_PATTERNS = [
    'googlebot',
    'bingbot',
    'yandex',
    'baidu',
    'duckduckbot',
    'slurp',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'curl',
    'wget',
    'python-requests',
    'node-fetch',
    'postman',
    'httpie',
  ];

  // Cache helper methods
  private getCacheKey(prefix: string, params: Record<string, any>): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL,
    });
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Bot detection helper
  private isBot(userAgent?: string): boolean {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return this.BOT_PATTERNS.some(pattern => ua.includes(pattern));
  }

  // PII Stripping helper for error messages
  private stripPII(message: string): string {
    let sanitized = message;

    // Strip emails
    sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');

    // Strip JWT tokens
    sanitized = sanitized.replace(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g, '[TOKEN_REDACTED]');

    // Strip Bearer tokens
    sanitized = sanitized.replace(/Bearer\s+[\w.-]+/gi, 'Bearer [TOKEN_REDACTED]');

    // Strip IPv4 addresses
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');

    // Strip passwords
    sanitized = sanitized.replace(/password[=:]\s*[^\s&]+/gi, 'password=[REDACTED]');

    // Strip API keys
    sanitized = sanitized.replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=[REDACTED]');

    return sanitized;
  }

  // Strip PII from object
  private stripPIIFromObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.stripPII(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.stripPIIFromObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Log error with structured metadata and PII stripping
  private logError(method: string, error: any, context?: Record<string, any>): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const sanitizedMessage = this.stripPII(errorMessage);
    const sanitizedContext = context ? this.stripPIIFromObject(context) : {};

    logger.error(sanitizedMessage, {
      service: 'website-analytics',
      method,
      error: sanitizedMessage,
      stack: error instanceof Error ? this.stripPII(error.stack || '') : undefined,
      ...sanitizedContext,
    });
  }

  // IP Anonymization helper (GDPR Article 32 compliance)
  private anonymizeIp(ip?: string): string | undefined {
    if (!ip) return undefined;

    // Handle IPv4 (e.g., 192.168.1.123 → 192.168.1.0)
    if (ip.includes('.') && !ip.includes(':')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        parts[3] = '0';
        return parts.join('.');
      }
    }

    // Handle IPv6 (e.g., 2001:db8::1234:5678 → 2001:db8::0000:0000)
    if (ip.includes(':')) {
      const parts = ip.split(':');
      // Zero out last 2 segments
      if (parts.length >= 2) {
        parts[parts.length - 1] = '0000';
        parts[parts.length - 2] = '0000';
        return parts.join(':');
      }
    }

    // If format is unrecognized, return undefined for safety
    return undefined;
  }

  // Response time tracking for metrics
  private responseTimes: number[] = [];
  private readonly MAX_RESPONSE_TIMES = 100;

  trackResponseTime(durationMs: number): void {
    this.responseTimes.push(durationMs);
    if (this.responseTimes.length > this.MAX_RESPONSE_TIMES) {
      this.responseTimes.shift();
    }
  }

  getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / this.responseTimes.length);
  }

  getCacheHitRate(): number {
    // Simple calculation based on cache size vs total cache operations
    const cacheSize = this.cache.size;
    if (cacheSize === 0) return 0;
    // Estimate hit rate (this is a simplified metric)
    return Math.min(0.95, cacheSize / this.MAX_RESPONSE_TIMES);
  }

  constructor() {
    // Clean up expired cache entries every minute
    setInterval(() => this.clearExpiredCache(), 60 * 1000);
  }
  // ============================================
  // PUBLIC TRACKING ENDPOINTS
  // ============================================

  async trackPageView(data: TrackPageViewDTO) {
    const pageView = await prisma.pageView.create({
      data: {
        sessionId: data.sessionId,
        path: data.path,
        referrer: data.referrer,
        userAgent: data.userAgent,
        ipAddress: this.anonymizeIp(data.ipAddress),
        country: data.country,
        device: data.device,
        browser: data.browser,
        duration: data.duration,
      },
    });

    // Update session page count
    await prisma.analyticsSession.update({
      where: { id: data.sessionId },
      data: {
        pageCount: { increment: 1 },
      },
    });

    logger.debug('Page view tracked', {
      sessionId: data.sessionId,
      path: data.path,
      pageViewId: pageView.id
    });

    return pageView;
  }

  async updatePageViewDuration(
    sessionId: string,
    path: string,
    duration: number,
    scrollDepth?: number
  ) {
    // Find the most recent page_view for this sessionId + path
    const pageView = await prisma.pageView.findFirst({
      where: {
        sessionId,
        path,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!pageView) {
      logger.warn('Page view not found for duration update', {
        sessionId,
        path,
      });
      return null;
    }

    // Update duration (and scroll depth if column exists)
    const updateData: any = {
      duration,
    };

    // Try to update scroll_depth if provided and column exists
    if (scrollDepth !== undefined) {
      try {
        updateData.scrollDepth = scrollDepth;
      } catch {
        // Column doesn't exist yet - silently skip
        logger.debug('Scroll depth column not available');
      }
    }

    const updated = await prisma.pageView.update({
      where: { id: pageView.id },
      data: updateData,
    });

    logger.debug('Page view duration updated', {
      pageViewId: pageView.id,
      sessionId,
      path,
      duration,
      scrollDepth,
    });

    return updated;
  }

  async trackClick(data: TrackClickDTO) {
    const click = await prisma.heatmapClick.create({
      data: {
        sessionId: data.sessionId,
        path: data.path,
        x: data.x,
        y: data.y,
        elementTag: data.elementTag,
        elementId: data.elementId,
        elementClass: data.elementClass,
      },
    });

    logger.debug('Click tracked', {
      sessionId: data.sessionId,
      path: data.path,
      clickId: click.id
    });

    return click;
  }

  async startSession(data: StartSessionDTO, visitorIdFromCookie?: string) {
    // Optimization 4: Bot detection
    const isBot = this.isBot(data.userAgent);

    // Use visitor ID from cookie, or generate new one if not provided
    const visitorId = visitorIdFromCookie || crypto.randomUUID();

    const session = await prisma.analyticsSession.create({
      data: {
        visitorId,
        country: data.country,
        device: data.device,
        browser: data.browser,
        referrer: data.referrer,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        pageCount: 0,
        isBot,
      },
    });

    logger.info('Session started', {
      sessionId: session.id,
      visitorId,
      isBot,
    });

    return { session, visitorId };
  }

  async endSession(sessionId: string) {
    const session = await prisma.analyticsSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundError(`Session with id ${sessionId} not found`);
    }

    const updatedSession = await prisma.analyticsSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    logger.info('Session ended', { sessionId });
    return updatedSession;
  }

  // ============================================
  // ANALYTICS REPORTING
  // ============================================

  async getOverview(dateRange: DateRange) {
    const { from, to } = dateRange;

    // Optimization 2: Check cache first
    const cacheKey = this.getCacheKey('overview', { from: from.toISOString(), to: to.toISOString() });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.debug('Returning cached overview data');
      return cached;
    }

    // Optimization 1: Read from daily_summary table for historical data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Split date range: historical (from daily_summary) + today (from raw tables)
    const isHistoricalOnly = to < today;
    const includesHistorical = from < today;
    const includesToday = to >= today;

    let totalPageViews = 0;
    let totalSessions = 0;
    let uniqueVisitors = 0;
    let avgSessionDuration = 0;
    let bounceCount = 0;
    let topPagesMap = new Map<string, number>();

    // Get historical data from daily_summary table
    if (includesHistorical) {
      const historicalEnd = includesToday ? new Date(today.getTime() - 1) : to;

      const dailySummaries = await prisma.analyticsDailySummary.findMany({
        where: {
          summaryDate: {
            gte: from,
            lte: historicalEnd,
          },
        },
      });

      for (const summary of dailySummaries) {
        totalPageViews += summary.totalPageViews;
        totalSessions += summary.totalSessions;
        uniqueVisitors += summary.uniqueVisitors;
        avgSessionDuration += Number(summary.avgSessionDuration) * summary.totalSessions;
        bounceCount += summary.bounceCount;

        // Merge top pages
        const pages = summary.topPages as Array<{ path: string; views: number }>;
        for (const page of pages) {
          topPagesMap.set(page.path, (topPagesMap.get(page.path) || 0) + page.views);
        }
      }
    }

    // Get today's live data (not yet summarized) - filter out bots
    if (includesToday) {
      const [
        todayPageViews,
        todaySessions,
        todayVisitors,
        todayAvgDuration,
        todayTopPages,
      ] = await Promise.all([
        // Total page views (exclude bot sessions)
        prisma.pageView.count({
          where: {
            createdAt: { gte: today, lte: to },
            session: { isBot: false },
          },
        }),

        // Total sessions (exclude bots)
        prisma.analyticsSession.count({
          where: {
            startedAt: { gte: today, lte: to },
            isBot: false,
          },
        }),

        // Unique visitors (exclude bots)
        prisma.analyticsSession.groupBy({
          by: ['visitorId'],
          where: {
            startedAt: { gte: today, lte: to },
            isBot: false,
          },
          _count: true,
        }),

        // Average session duration (exclude bots)
        prisma.$queryRaw<Array<{ avg_duration: number }>>`
          SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
          FROM analytics_sessions
          WHERE started_at >= ${today}
            AND started_at <= ${to}
            AND ended_at IS NOT NULL
            AND is_bot = false
        `,

        // Top pages today (exclude bot sessions)
        prisma.pageView.groupBy({
          by: ['path'],
          where: {
            createdAt: { gte: today, lte: to },
            session: { isBot: false },
          },
          _count: true,
          orderBy: {
            _count: {
              path: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      // Get today's bounce count
      const todayBounceCount = await prisma.analyticsSession.count({
        where: {
          startedAt: { gte: today, lte: to },
          pageCount: 1,
          isBot: false,
        },
      });

      totalPageViews += todayPageViews;
      totalSessions += todaySessions;
      uniqueVisitors += todayVisitors.length;
      avgSessionDuration += (todayAvgDuration[0]?.avg_duration ?? 0) * todaySessions;
      bounceCount += todayBounceCount;

      // Merge today's top pages
      for (const page of todayTopPages) {
        topPagesMap.set(page.path, (topPagesMap.get(page.path) || 0) + page._count);
      }
    }

    // Calculate final average session duration
    const finalAvgDuration = totalSessions > 0
      ? Math.round(avgSessionDuration / totalSessions)
      : 0;

    // Calculate bounce rate
    const bounceRate = totalSessions > 0
      ? (bounceCount / totalSessions) * 100
      : 0;

    // Sort and get top 5 pages
    const topPages = Array.from(topPagesMap.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const result = {
      totalPageViews,
      totalSessions,
      uniqueVisitors,
      avgSessionDuration: finalAvgDuration,
      bounceRate: Math.round(bounceRate * 100) / 100,
      topPages,
    };

    // Cache the result
    this.setCache(cacheKey, result);

    return result;
  }

  async getTopPages(dateRange: DateRange, limit = 10) {
    const { from, to } = dateRange;

    // Optimization 4: Filter out bot sessions
    const pages = await prisma.pageView.groupBy({
      by: ['path'],
      where: {
        createdAt: { gte: from, lte: to },
        session: { isBot: false },
      },
      _count: true,
      _avg: {
        duration: true,
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: limit,
    });

    return pages.map((page) => ({
      path: page.path,
      views: page._count,
      avgDuration: Math.round(page._avg.duration ?? 0),
    }));
  }

  async getTopCountries(dateRange: DateRange, limit = 10) {
    const { from, to } = dateRange;

    // Optimization 4: Filter out bot sessions
    const countries = await prisma.analyticsSession.groupBy({
      by: ['country'],
      where: {
        startedAt: { gte: from, lte: to },
        country: { not: null },
        isBot: false,
      },
      _count: true,
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: limit,
    });

    return countries.map((c) => ({
      country: c.country,
      sessions: c._count,
    }));
  }

  async getDeviceBreakdown(dateRange: DateRange) {
    const { from, to } = dateRange;

    // Optimization 4: Filter out bot sessions
    const devices = await prisma.analyticsSession.groupBy({
      by: ['device'],
      where: {
        startedAt: { gte: from, lte: to },
        device: { not: null },
        isBot: false,
      },
      _count: true,
    });

    const total = devices.reduce((sum, d) => sum + d._count, 0);

    return devices.map((d) => ({
      device: d.device,
      count: d._count,
      percentage: total > 0 ? Math.round((d._count / total) * 10000) / 100 : 0,
    }));
  }

  async getBrowserBreakdown(dateRange: DateRange) {
    const { from, to } = dateRange;

    // Optimization 4: Filter out bot sessions
    const browsers = await prisma.analyticsSession.groupBy({
      by: ['browser'],
      where: {
        startedAt: { gte: from, lte: to },
        browser: { not: null },
        isBot: false,
      },
      _count: true,
      orderBy: {
        _count: {
          browser: 'desc',
        },
      },
    });

    const total = browsers.reduce((sum, b) => sum + b._count, 0);

    return browsers.map((b) => ({
      browser: b.browser,
      count: b._count,
      percentage: total > 0 ? Math.round((b._count / total) * 10000) / 100 : 0,
    }));
  }

  async getReferrerBreakdown(dateRange: DateRange) {
    const { from, to } = dateRange;

    // Optimization 4: Filter out bot sessions
    const referrers = await prisma.analyticsSession.groupBy({
      by: ['referrer'],
      where: {
        startedAt: { gte: from, lte: to },
        referrer: { not: null },
        isBot: false,
      },
      _count: true,
      orderBy: {
        _count: {
          referrer: 'desc',
        },
      },
      take: 10,
    });

    return referrers.map((r) => ({
      referrer: r.referrer,
      sessions: r._count,
    }));
  }

  async getPageViewsOverTime(
    dateRange: DateRange,
    granularity: 'day' | 'week' | 'month' = 'day'
  ) {
    const { from, to } = dateRange;

    let truncateFormat: string;
    switch (granularity) {
      case 'week':
        truncateFormat = 'week';
        break;
      case 'month':
        truncateFormat = 'month';
        break;
      default:
        truncateFormat = 'day';
    }

    // Optimization 4: Filter out bot sessions
    const data = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE_TRUNC(${truncateFormat}, pv.created_at) as date,
        COUNT(*)::bigint as count
      FROM page_views pv
      JOIN analytics_sessions s ON s.id = pv.session_id
      WHERE pv.created_at >= ${from}
        AND pv.created_at <= ${to}
        AND s.is_bot = false
      GROUP BY DATE_TRUNC(${truncateFormat}, pv.created_at)
      ORDER BY date ASC
    `;

    return data.map((d) => ({
      date: d.date,
      views: Number(d.count),
    }));
  }

  async getHeatmapData(path: string, dateRange: DateRange) {
    const { from, to } = dateRange;

    // Optimization 2: Check cache first
    const cacheKey = this.getCacheKey('heatmap', {
      path,
      from: from.toISOString(),
      to: to.toISOString(),
    });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.debug('Returning cached heatmap data', { path });
      return cached;
    }

    // Exclude bot sessions from heatmap data
    const clicks = await prisma.heatmapClick.findMany({
      where: {
        path,
        createdAt: { gte: from, lte: to },
        session: { isBot: false },
      },
      select: {
        x: true,
        y: true,
        elementTag: true,
        elementId: true,
        elementClass: true,
      },
    });

    logger.info('Retrieved heatmap data', { path, clickCount: clicks.length });

    // Cache the result
    this.setCache(cacheKey, clicks);

    return clicks;
  }

  async getSessionsList(filters: SessionFilters) {
    // Optimization 2: Check cache first
    const cacheKey = this.getCacheKey('sessions', filters);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.debug('Returning cached sessions list');
      return cached;
    }

    const where: any = {
      // Optimization 4: Filter out bot sessions by default
      isBot: false,
    };

    if (filters.startDate || filters.endDate) {
      where.startedAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    if (filters.device) {
      where.device = filters.device;
    }

    if (filters.country) {
      where.country = filters.country;
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.analyticsSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
      }),
      prisma.analyticsSession.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const result = {
      sessions,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    // Cache the result
    this.setCache(cacheKey, result);

    return result;
  }

  async getActiveVisitors() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Optimization 4: Exclude bot sessions from active visitor count
    const recentPageViews = await prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: { gte: fiveMinutesAgo },
        session: { isBot: false },
      },
      _count: true,
    });

    logger.debug('Active visitors count', { count: recentPageViews.length });
    return { activeVisitors: recentPageViews.length };
  }

  // ============================================
  // SESSION RECORDING
  // ============================================

  async storeRecordingEvents(data: {
    sessionId: string;
    events: Record<string, unknown>[];
    sequence: number;
  }) {
    // Optimization 3: Calculate byte size of events JSON
    const eventsJson = JSON.stringify(data.events);
    const byteSize = Buffer.byteLength(eventsJson, 'utf8');

    const record = await prisma.sessionRecordingEvent.create({
      data: {
        sessionId: data.sessionId,
        events: data.events as any,
        sequence: data.sequence,
        byteSize,
      },
    });

    logger.debug('Recording events stored', {
      sessionId: data.sessionId,
      sequence: data.sequence,
      eventCount: data.events.length,
      byteSize,
    });

    return record;
  }

  async getSessionRecording(sessionId: string) {
    const batches = await prisma.sessionRecordingEvent.findMany({
      where: { sessionId },
      orderBy: { sequence: 'asc' },
      select: { events: true, sequence: true },
    });

    if (batches.length === 0) {
      return { sessionId, events: [] };
    }

    // Flatten all event batches into a single array
    const events = batches.flatMap((b) => b.events as Record<string, unknown>[]);

    logger.info('Retrieved session recording', {
      sessionId,
      batchCount: batches.length,
      totalEvents: events.length,
    });

    return { sessionId, events };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async getTrackingScript() {
    // Sanitize API_BASE_URL to prevent XSS injection
    const rawApiBase = process.env.API_BASE_URL || 'http://localhost:3000';
    let sanitizedApiBase: string;
    try {
      const parsed = new URL(rawApiBase);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol in API_BASE_URL');
      }
      sanitizedApiBase = `${parsed.protocol}//${parsed.host}`;
    } catch {
      logger.error('Invalid API_BASE_URL, falling back to localhost', { rawApiBase });
      sanitizedApiBase = 'http://localhost:3000';
    }

    const script = `
(function() {
  const API_BASE = ${JSON.stringify(sanitizedApiBase + '/api/v1')};
  const RECORDING_SAMPLE_RATE = 0.4; // 40% of sessions will be recorded

  // Check consent before any tracking
  function hasConsent() {
    return localStorage.getItem('ra_analytics_consent') === 'accepted';
  }

  // Check if this session should be recorded (sampling)
  function shouldRecord() {
    let shouldRec = sessionStorage.getItem('ra_should_record');
    if (shouldRec === null) {
      shouldRec = Math.random() < RECORDING_SAMPLE_RATE ? 'true' : 'false';
      sessionStorage.setItem('ra_should_record', shouldRec);
    }
    return shouldRec === 'true';
  }

  // Detect device type
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Detect browser
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Other';
  }

  // Start session (visitor ID now managed by backend via httpOnly cookie)
  async function startSession() {
    try {
      const urlParams = new URLSearchParams(window.location.search);

      const response = await fetch(API_BASE + '/tracking/session/start', {
        method: 'POST',
        credentials: 'include', // Send/receive cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: getDeviceType(),
          browser: getBrowser(),
          referrer: document.referrer || undefined,
          utmSource: urlParams.get('utm_source') || undefined,
          utmMedium: urlParams.get('utm_medium') || undefined,
          utmCampaign: urlParams.get('utm_campaign') || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session: ' + response.status);
      }

      const data = await response.json();
      return data.data.id;
    } catch (error) {
      console.error('[Roaya Analytics] Error starting session:', error);
      throw error;
    }
  }

  // Track last page to prevent duplicate tracking in SPAs
  let lastTrackedPath = '';

  // Track page view
  async function trackPageView(sessionId, path) {
    // Prevent duplicate tracking of same path
    if (path === lastTrackedPath) {
      return;
    }
    lastTrackedPath = path;

    try {
      await fetch(API_BASE + '/tracking/pageview', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          path,
          referrer: document.referrer || undefined,
        }),
      });
    } catch (error) {
      console.error('[Roaya Analytics] Error tracking page view:', error);
    }
  }

  // Track click
  async function trackClick(sessionId, event) {
    if (!shouldRecord()) return;

    try {
      const rect = document.body.getBoundingClientRect();
      const x = Math.round((event.clientX / rect.width) * 100);
      const y = Math.round((event.clientY / rect.height) * 100);

      await fetch(API_BASE + '/tracking/click', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          path: window.location.pathname,
          x,
          y,
          elementTag: event.target.tagName,
          elementId: event.target.id || undefined,
          elementClass: event.target.className || undefined,
        }),
      });
    } catch (error) {
      console.error('[Roaya Analytics] Error tracking click:', error);
    }
  }

  // Safe beacon sending (no sync XHR fallback)
  function sendEndSession(sessionId) {
    const payload = JSON.stringify({ sessionId });
    const blob = new Blob([payload], { type: 'application/json' });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(API_BASE + '/tracking/session/end', blob);
    } else {
      // Fallback to fetch with keepalive (no sync XHR)
      fetch(API_BASE + '/tracking/session/end', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently fail - page is unloading anyway
      });
    }
  }

  // Initialize tracking
  (async function() {
    // Check consent first
    if (!hasConsent()) {
      console.log('[Roaya Analytics] Tracking disabled - no consent');
      return;
    }

    try {
      const sessionId = await startSession();
      sessionStorage.setItem('ra_session_id', sessionId);

      await trackPageView(sessionId, window.location.pathname);

      // Track clicks (only if recording this session)
      if (shouldRecord()) {
        document.addEventListener('click', (e) => trackClick(sessionId, e), { passive: true });
      }

      // Handle SPA navigation
      let lastPath = window.location.pathname;
      setInterval(() => {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPath) {
          lastPath = currentPath;
          trackPageView(sessionId, currentPath);
        }
      }, 1000);

      // End session on page unload
      window.addEventListener('beforeunload', () => {
        sendEndSession(sessionId);
      });

      // Also handle visibility change (mobile browsers)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          sendEndSession(sessionId);
        }
      });

    } catch (error) {
      console.error('[Roaya Analytics] Initialization error:', error);
    }
  })();
})();
`;

    return script;
  }

  // ============================================
  // CUSTOM EVENT TRACKING (Feature 2)
  // ============================================

  async trackEvent(data: TrackEventDTO) {
    try {
      // Check if custom_analytics_events table exists
      const event = await prisma.$executeRaw`
        INSERT INTO custom_analytics_events (id, session_id, event_name, event_category, event_data, page_path, created_at)
        VALUES (gen_random_uuid(), ${data.sessionId}, ${data.eventName}, ${data.eventCategory}, ${JSON.stringify(data.eventData || {})}::jsonb, ${data.pagePath}, NOW())
        RETURNING id
      `;

      logger.debug('Custom event tracked', {
        sessionId: data.sessionId,
        eventName: data.eventName,
        eventCategory: data.eventCategory,
      });

      return { success: true, eventId: event };
    } catch (error) {
      this.logError('trackEvent', error, {
        sessionId: data.sessionId,
        eventName: data.eventName,
        eventCategory: data.eventCategory,
      });
      throw error;
    }
  }

  async getEvents(filters: EventFilters) {
    const {
      startDate,
      endDate,
      eventName,
      eventCategory,
      limit = 100,
      offset = 0,
    } = filters;

    try {
      // Build WHERE conditions using Prisma.sql tagged templates (SQL-injection safe)
      const conditions: Prisma.Sql[] = [];

      if (startDate) {
        conditions.push(Prisma.sql`created_at >= ${startDate}`);
      }

      if (endDate) {
        conditions.push(Prisma.sql`created_at <= ${endDate}`);
      }

      if (eventName) {
        conditions.push(Prisma.sql`event_name = ${eventName}`);
      }

      if (eventCategory) {
        conditions.push(Prisma.sql`event_category = ${eventCategory}`);
      }

      const whereClause = conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

      // Get aggregated event counts (safe parameterized query)
      const eventCounts = await prisma.$queryRaw<
        Array<{ event_name: string; event_category: string; count: bigint }>
      >`
        SELECT event_name, event_category, COUNT(*) as count
        FROM custom_analytics_events
        ${whereClause}
        GROUP BY event_name, event_category
        ORDER BY count DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      return eventCounts.map((e) => ({
        eventName: e.event_name,
        eventCategory: e.event_category,
        count: Number(e.count),
      }));
    } catch (error) {
      // Table might not exist yet - log as warning, not error
      this.logError('getEvents', error, {
        filters: JSON.stringify(filters),
        level: 'warn',
      });
      return [];
    }
  }

  async getEventsSummary(dateRange: DateRange) {
    const { from, to } = dateRange;

    try {
      // Top 10 events by count
      const topEvents = await prisma.$queryRaw<
        Array<{ event_name: string; count: bigint }>
      >`
        SELECT event_name, COUNT(*) as count
        FROM custom_analytics_events
        WHERE created_at >= ${from} AND created_at <= ${to}
        GROUP BY event_name
        ORDER BY count DESC
        LIMIT 10
      `;

      // Events by category
      const categoryBreakdown = await prisma.$queryRaw<
        Array<{ event_category: string; count: bigint }>
      >`
        SELECT event_category, COUNT(*) as count
        FROM custom_analytics_events
        WHERE created_at >= ${from} AND created_at <= ${to}
        GROUP BY event_category
        ORDER BY count DESC
      `;

      // Events over time (daily)
      const eventsOverTime = await prisma.$queryRaw<
        Array<{ date: Date; count: bigint }>
      >`
        SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
        FROM custom_analytics_events
        WHERE created_at >= ${from} AND created_at <= ${to}
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date ASC
      `;

      return {
        topEvents: topEvents.map((e) => ({
          eventName: e.event_name,
          count: Number(e.count),
        })),
        categoryBreakdown: categoryBreakdown.map((c) => ({
          category: c.event_category,
          count: Number(c.count),
        })),
        eventsOverTime: eventsOverTime.map((e) => ({
          date: e.date,
          count: Number(e.count),
        })),
      };
    } catch (error) {
      this.logError('getEventsSummary', error, {
        dateRange: JSON.stringify(dateRange),
        level: 'warn',
      });
      return {
        topEvents: [],
        categoryBreakdown: [],
        eventsOverTime: [],
      };
    }
  }

  // ============================================
  // HEALTH & METRICS (Feature 3)
  // ============================================

  async getHealthMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      // Active sessions (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeSessions = await prisma.pageView.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: fiveMinutesAgo },
          session: { isBot: false },
        },
      });

      // Total page views today
      const pageViewsToday = await prisma.pageView.count({
        where: {
          createdAt: { gte: todayStart },
          session: { isBot: false },
        },
      });

      return {
        status: 'ok',
        service: 'website-analytics',
        timestamp: now.toISOString(),
        metrics: {
          uptime: process.uptime(),
          activeSessions: activeSessions.length,
          totalPageViewsToday: pageViewsToday,
          cacheHitRate: this.getCacheHitRate(),
          avgResponseTime: this.getAverageResponseTime(),
        },
      };
    } catch (error) {
      this.logError('getHealthMetrics', error, {
        timestamp: now.toISOString(),
      });
      return {
        status: 'error',
        service: 'website-analytics',
        timestamp: now.toISOString(),
        error: 'Failed to retrieve metrics',
      };
    }
  }

  async getPrometheusMetrics() {
    const metrics = await this.getHealthMetrics();

    if (metrics.status === 'error') {
      return `# Error retrieving metrics\n`;
    }

    const m = metrics.metrics as {
      activeSessions: number;
      totalPageViewsToday: number;
      cacheHitRate: number;
      avgResponseTime: number;
      uptime: number;
    } | undefined;

    if (!m) {
      return `# Error: metrics unavailable\n`;
    }

    return `# HELP analytics_active_sessions Current active sessions
# TYPE analytics_active_sessions gauge
analytics_active_sessions ${m.activeSessions}

# HELP analytics_page_views_total Total page views today
# TYPE analytics_page_views_total counter
analytics_page_views_total ${m.totalPageViewsToday}

# HELP analytics_cache_hit_rate Cache hit percentage
# TYPE analytics_cache_hit_rate gauge
analytics_cache_hit_rate ${m.cacheHitRate.toFixed(2)}

# HELP analytics_avg_response_time_ms Average response time in milliseconds
# TYPE analytics_avg_response_time_ms gauge
analytics_avg_response_time_ms ${m.avgResponseTime}

# HELP analytics_uptime_seconds Service uptime in seconds
# TYPE analytics_uptime_seconds counter
analytics_uptime_seconds ${Math.floor(m.uptime)}
`;
  }
}

export const websiteAnalyticsService = new WebsiteAnalyticsService();
