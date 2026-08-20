import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ─── Response types ────────────────────────────────────

export interface AnalyticsOverview {
  totalPageViews: number;
  totalSessions: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: { path: string; views: number }[];
}

export interface TopPage {
  path: string;
  views: number;
  avgDuration: number;
}

export interface CountryData {
  country: string | null;
  sessions: number;
}

export interface DeviceData {
  device: string | null;
  count: number;
  percentage: number;
}

export interface BrowserData {
  browser: string | null;
  count: number;
  percentage: number;
}

export interface ReferrerData {
  referrer: string | null;
  sessions: number;
}

export interface PageViewTimeSeries {
  date: string;
  views: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  elementTag?: string | null;
  elementId?: string | null;
  elementClass?: string | null;
}

export interface SessionRecord {
  id: string;
  visitorId: string;
  startedAt: string;
  endedAt: string | null;
  pageCount: number;
  country: string | null;
  device: string | null;
  browser: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SessionsResponse {
  sessions: SessionRecord[];
  meta: PaginationMeta;
}

export interface SessionRecordingData {
  sessionId: string;
  events: Record<string, unknown>[];
}

export interface DateRange {
  from?: string;
  to?: string;
}

export interface SessionFilters extends DateRange {
  device?: string;
  country?: string;
  page?: number;
  limit?: number;
}

// ─── Envelope wrapper ──────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

/**
 * WebsiteAnalyticsService
 * HTTP service for admin analytics reporting endpoints.
 * Maps 1:1 to the backend website-analytics admin routes.
 * All methods return Observable<T> with catchError returning safe defaults.
 */
@Injectable({ providedIn: 'root' })
export class WebsiteAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/website-analytics`;

  /** GET /overview */
  getOverview(range?: DateRange): Observable<AnalyticsOverview> {
    return this.http
      .get<ApiResponse<AnalyticsOverview>>(`${this.baseUrl}/overview`, {
        params: this.buildDateParams(range),
      })
      .pipe(
        map((r) => r.data),
        catchError(() =>
          of({
            totalPageViews: 0,
            totalSessions: 0,
            uniqueVisitors: 0,
            avgSessionDuration: 0,
            bounceRate: 0,
            topPages: [],
          }),
        ),
      );
  }

  /** GET /top-pages */
  getTopPages(range?: DateRange, limit?: number): Observable<TopPage[]> {
    let params = this.buildDateParams(range);
    if (limit) params = params.set('limit', limit.toString());

    return this.http
      .get<ApiResponse<TopPage[]>>(`${this.baseUrl}/top-pages`, { params })
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      );
  }

  /** GET /countries */
  getCountries(range?: DateRange): Observable<CountryData[]> {
    return this.http
      .get<ApiResponse<CountryData[]>>(`${this.baseUrl}/countries`, {
        params: this.buildDateParams(range),
      })
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      );
  }

  /** GET /devices */
  getDevices(range?: DateRange): Observable<DeviceData[]> {
    return this.http
      .get<ApiResponse<DeviceData[]>>(`${this.baseUrl}/devices`, {
        params: this.buildDateParams(range),
      })
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      );
  }

  /** GET /browsers */
  getBrowsers(range?: DateRange): Observable<BrowserData[]> {
    return this.http
      .get<ApiResponse<BrowserData[]>>(`${this.baseUrl}/browsers`, {
        params: this.buildDateParams(range),
      })
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      );
  }

  /** GET /referrers */
  getReferrers(range?: DateRange): Observable<ReferrerData[]> {
    return this.http
      .get<ApiResponse<ReferrerData[]>>(`${this.baseUrl}/referrers`, {
        params: this.buildDateParams(range),
      })
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      );
  }

  /** GET /page-views */
  getPageViews(
    range?: DateRange,
    granularity?: 'day' | 'week' | 'month',
  ): Observable<PageViewTimeSeries[]> {
    let params = this.buildDateParams(range);
    if (granularity) params = params.set('granularity', granularity);

    return this.http
      .get<ApiResponse<PageViewTimeSeries[]>>(`${this.baseUrl}/page-views`, {
        params,
      })
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      );
  }

  /** GET /heatmap/:path */
  getHeatmap(pagePath: string, range?: DateRange): Observable<HeatmapPoint[]> {
    // Strip leading slash for the URL segment, but use "/" for root path
    let encodedPath = pagePath.startsWith('/')
      ? pagePath.substring(1)
      : pagePath;
    if (!encodedPath) encodedPath = '/';

    return this.http
      .get<ApiResponse<HeatmapPoint[]>>(
        `${this.baseUrl}/heatmap/${encodedPath}`,
        { params: this.buildDateParams(range) },
      )
      .pipe(
        map((r) => r.data),
        catchError(() => of([])),
      );
  }

  /** GET /sessions */
  getSessions(filters?: SessionFilters): Observable<SessionsResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.from) params = params.set('startDate', filters.from);
      if (filters.to) params = params.set('endDate', filters.to);
      if (filters.device) params = params.set('device', filters.device);
      if (filters.country) params = params.set('country', filters.country);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit)
        params = params.set('limit', filters.limit.toString());
    }

    return this.http
      .get<ApiResponse<SessionRecord[]> & { meta: PaginationMeta }>(
        `${this.baseUrl}/sessions`,
        { params },
      )
      .pipe(
        map((r) => ({
          sessions: r.data,
          meta: r.meta ?? {
            page: 1,
            limit: 20,
            total: r.data.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        })),
        catchError(() =>
          of({
            sessions: [],
            meta: {
              page: 1,
              limit: 20,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          }),
        ),
      );
  }

  /** GET /active */
  getActiveVisitors(): Observable<number> {
    return this.http
      .get<ApiResponse<{ activeVisitors: number }>>(`${this.baseUrl}/active`)
      .pipe(
        map((r) => r.data.activeVisitors),
        catchError(() => of(0)),
      );
  }

  /** GET /sessions/:sessionId/recording */
  getSessionRecording(sessionId: string): Observable<SessionRecordingData> {
    return this.http
      .get<ApiResponse<SessionRecordingData>>(
        `${this.baseUrl}/sessions/${sessionId}/recording`,
      )
      .pipe(
        map((r) => r.data),
        catchError(() => of({ sessionId, events: [] })),
      );
  }

  // ─── Helpers ─────────────────────────────────────────

  private buildDateParams(range?: DateRange): HttpParams {
    let params = new HttpParams();
    if (range?.from) params = params.set('from', range.from);
    if (range?.to) params = params.set('to', range.to);
    return params;
  }
}
