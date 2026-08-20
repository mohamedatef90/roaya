import { Injectable, inject, DestroyRef, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * VisitorTrackingService
 * Collects visitor behavior data from the public website and sends it
 * to backend tracking endpoints. Tracks sessions, page views, and clicks.
 *
 * - Visitor ID now managed by backend via httpOnly cookie (XSS-safe)
 * - Starts a session on init, ends on beforeunload
 * - Tracks NavigationEnd events as page views
 * - Optionally tracks clicks for heatmap data (throttled)
 * - Skips admin routes and respects Do Not Track
 * - Errors are silently caught (tracking must never break the website)
 */
@Injectable({ providedIn: 'root' })
export class VisitorTrackingService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private readonly trackingUrl = `${environment.apiUrl}/website-analytics/tracking`;

  private sessionId: string | null = null;
  private clickTrackingEnabled = false;
  private lastClickTime = 0;
  private readonly CLICK_THROTTLE_MS = 500;

  // Page duration and scroll tracking
  private pageEnteredAt = 0;
  private previousPath = '';
  private maxScrollDepth = 0;
  private scrollListenerAttached = false;
  private lastScrollTime = 0;
  private readonly SCROLL_THROTTLE_MS = 500;

  // rrweb recording state
  private recordingStopFn: (() => void) | null = null;
  private recordingSequence = 0;
  private eventBuffer: Record<string, unknown>[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private readonly FLUSH_EVENT_COUNT = 50;
  private readonly FLUSH_INTERVAL_MS = 10_000;

  /** Call once from the root App component to begin tracking */
  init(): void {
    try {
      // Check analytics consent first
      if (!this.hasAnalyticsConsent()) return;

      // Respect Do Not Track
      if (this.isDoNotTrack()) return;

      // Skip recording if loaded inside a heatmap preview iframe
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('_heatmap_preview') === '1') return;
      }

      this.startSession();
      this.listenToRouteChanges();
      this.registerBeforeUnload();
      this.attachScrollListener();
    } catch {
      // Silently ignore – tracking must never break the app
    }
  }

  /** Enable click tracking for heatmap data collection */
  enableClickTracking(): void {
    if (this.clickTrackingEnabled) return;
    this.clickTrackingEnabled = true;

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('click', this.handleClick, { passive: true });
    });

    this.destroyRef.onDestroy(() => {
      document.removeEventListener('click', this.handleClick);
    });
  }

  // ─── Private helpers ────────────────────────────────────

  private hasAnalyticsConsent(): boolean {
    try {
      return localStorage.getItem('ra_analytics_consent') === 'accepted';
    } catch {
      return false;
    }
  }

  private hasRecordingConsent(): boolean {
    try {
      return localStorage.getItem('ra_recording_consent') === 'accepted';
    } catch {
      return false;
    }
  }

  private isDoNotTrack(): boolean {
    const nav = navigator as any;
    return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
  }

  private isAdminRoute(path: string): boolean {
    return path.startsWith('/admin');
  }

  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Safari/')) return 'Safari';
    return 'Other';
  }

  private startSession(): void {
    const payload = {
      // visitorId removed - backend reads from cookie or generates new one
      device: this.detectDevice(),
      browser: this.detectBrowser(),
      referrer: document.referrer || undefined,
      utmSource: this.getUtmParam('utm_source'),
      utmMedium: this.getUtmParam('utm_medium'),
      utmCampaign: this.getUtmParam('utm_campaign'),
    };

    // HttpClient automatically sends cookies for same-origin requests
    // For cross-origin requests, withCredentials: true is needed in HttpClient config
    this.http
      .post<{ success: boolean; data: { id: string } }>(
        `${this.trackingUrl}/session/start`,
        payload,
        { withCredentials: true } // Ensure cookies are sent/received
      )
      .subscribe({
        next: (res) => {
          this.sessionId = res.data.id;
          // Track the initial page view
          this.trackPageView(this.router.url);
          // Start rrweb session recording
          this.startRecording();
        },
        error: () => {
          // Silently fail
        },
      });
  }

  private getUtmParam(key: string): string | undefined {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get(key) || undefined;
    } catch {
      return undefined;
    }
  }

  private listenToRouteChanges(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        try {
          this.trackPageView(event.urlAfterRedirects || event.url);
        } catch {
          // Silently fail
        }
      });
  }

  private trackPageView(fullUrl: string): void {
    // Strip query params for the path
    const path = fullUrl.split('?')[0];

    if (!this.sessionId || this.isAdminRoute(path)) return;

    // Send duration for previous page if exists
    if (this.previousPath && this.pageEnteredAt > 0) {
      this.sendPageDuration(this.previousPath);
    }

    // Track new page view
    this.http
      .post(`${this.trackingUrl}/pageview`, {
        sessionId: this.sessionId,
        path,
        referrer: document.referrer || undefined,
      }, { withCredentials: true })
      .subscribe({ error: () => {} });

    // Reset for new page
    this.previousPath = path;
    this.pageEnteredAt = Date.now();
    this.maxScrollDepth = 0;
  }

  private handleClick = (event: MouseEvent): void => {
    try {
      const now = Date.now();
      if (now - this.lastClickTime < this.CLICK_THROTTLE_MS) return;
      this.lastClickTime = now;

      const path = window.location.pathname;
      if (!this.sessionId || this.isAdminRoute(path)) return;

      const target = event.target as HTMLElement;
      if (!target) return;

      // Calculate x/y as percentages of viewport
      const x = Math.round((event.clientX / window.innerWidth) * 100);
      const y = Math.round(
        ((event.clientY + window.scrollY) /
          document.documentElement.scrollHeight) *
          100,
      );

      this.http
        .post(`${this.trackingUrl}/click`, {
          sessionId: this.sessionId,
          path,
          x: Math.min(100, Math.max(0, x)),
          y: Math.min(100, Math.max(0, y)),
          elementTag: target.tagName?.toLowerCase()?.substring(0, 50),
          elementId: target.id?.substring(0, 255) || undefined,
          elementClass:
            target.className && typeof target.className === 'string'
              ? target.className.substring(0, 500)
              : undefined,
        }, { withCredentials: true })
        .subscribe({ error: () => {} });
    } catch {
      // Silently fail
    }
  };

  private registerBeforeUnload(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      this.endSession();
    });
  }

  private handleBeforeUnload = (): void => {
    // Capture final scroll depth (bypass throttle)
    try {
      const finalDepth = Math.round(
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
      );
      this.maxScrollDepth = Math.max(this.maxScrollDepth, Math.min(100, finalDepth));
    } catch { /* ignore */ }

    // Send final page duration before leaving
    if (this.previousPath && this.pageEnteredAt > 0 && this.sessionId) {
      const duration = Math.round((Date.now() - this.pageEnteredAt) / 1000);
      const payload = JSON.stringify({
        sessionId: this.sessionId,
        path: this.previousPath,
        duration,
        scrollDepth: this.maxScrollDepth,
      });
      navigator.sendBeacon(
        `${this.trackingUrl}/pageview/duration`,
        new Blob([payload], { type: 'application/json' })
      );
    }
    this.endSession();
  };

  // ─── rrweb Recording ─────────────────────────────────

  private startRecording(): void {
    // Check recording consent before starting
    if (!this.hasRecordingConsent()) return;

    if (this.recordingStopFn) return; // Already recording

    this.ngZone.runOutsideAngular(async () => {
      try {
        const { record } = await import('rrweb');

        this.recordingStopFn = record({
          emit: (event: Record<string, unknown>) => {
            this.eventBuffer.push(event);
            if (this.eventBuffer.length >= this.FLUSH_EVENT_COUNT) {
              this.flushEvents();
            }
          },
          maskAllInputs: true,
          blockClass: 'rr-block',
          sampling: {
            mousemove: true,
            mouseInteraction: true,
            scroll: 150,
            input: 'last',
          },
          inlineStylesheet: true,
        }) ?? null;

        // Periodic flush timer
        this.flushTimer = setInterval(() => {
          this.flushEvents();
        }, this.FLUSH_INTERVAL_MS);
      } catch {
        // rrweb failed to load – silently skip recording
      }
    });
  }

  /**
   * Compress JSON data using native CompressionStream API
   * Falls back to uncompressed if not available (Safari < 16.4)
   * @param data JSON string to compress
   * @returns Compressed blob (gzip format)
   */
  private async compressData(data: string): Promise<Blob> {
    const blob = new Blob([data]);
    const cs = new CompressionStream('gzip');
    const compressedStream = blob.stream().pipeThrough(cs);
    return new Response(compressedStream).blob();
  }

  /**
   * Check if CompressionStream API is available
   * Available in Chrome 80+, Firefox 113+, Safari 16.4+
   */
  private isCompressionSupported(): boolean {
    return typeof CompressionStream !== 'undefined';
  }

  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0 || !this.sessionId) return;

    // Re-check recording consent before sending (user may have revoked mid-session)
    if (!this.hasRecordingConsent()) {
      this.eventBuffer = [];
      this.stopRecording();
      return;
    }

    const eventsToSend = this.eventBuffer.slice();
    const seq = this.recordingSequence;
    this.eventBuffer = [];
    this.recordingSequence++;

    const payload = {
      sessionId: this.sessionId,
      events: eventsToSend,
      sequence: seq,
    };

    try {
      // Try to compress if supported
      if (this.isCompressionSupported()) {
        const jsonString = JSON.stringify(payload);
        const compressedBlob = await this.compressData(jsonString);

        // Send compressed data with appropriate headers
        this.http
          .post(`${this.trackingUrl}/recording`, compressedBlob, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Encoding': 'gzip',
              'X-Original-Content-Type': 'application/json',
            },
            withCredentials: true,
          })
          .subscribe({ error: () => {} });
      } else {
        // Fallback to uncompressed for browsers without CompressionStream support
        this.http
          .post(`${this.trackingUrl}/recording`, payload, { withCredentials: true })
          .subscribe({ error: () => {} });
      }
    } catch {
      // If compression fails, send uncompressed as fallback
      this.http
        .post(`${this.trackingUrl}/recording`, payload, { withCredentials: true })
        .subscribe({ error: () => {} });
    }
  }

  private stopRecording(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.recordingStopFn) {
      this.recordingStopFn();
      this.recordingStopFn = null;
    }
  }

  // ─── Page Duration & Scroll Tracking ────────────────────

  private sendPageDuration(path: string): void {
    if (!this.sessionId || this.pageEnteredAt === 0) return;

    const duration = Math.round((Date.now() - this.pageEnteredAt) / 1000);

    this.http
      .post(`${this.trackingUrl}/pageview/duration`, {
        sessionId: this.sessionId,
        path,
        duration,
        scrollDepth: this.maxScrollDepth,
      }, { withCredentials: true })
      .subscribe({ error: () => {} });
  }

  private attachScrollListener(): void {
    if (this.scrollListenerAttached) return;
    this.scrollListenerAttached = true;

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', this.handleScroll);
    });
  }

  private handleScroll = (): void => {
    try {
      const now = Date.now();
      if (now - this.lastScrollTime < this.SCROLL_THROTTLE_MS) return;
      this.lastScrollTime = now;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate scroll depth as percentage (0-100)
      const scrollDepth = Math.round(
        ((scrollY + windowHeight) / documentHeight) * 100
      );

      // Update max scroll depth
      this.maxScrollDepth = Math.max(this.maxScrollDepth, Math.min(100, scrollDepth));
    } catch {
      // Silently fail
    }
  };

  // ─── Session Management ─────────────────────────────────

  private endSession(): void {
    if (!this.sessionId) return;

    // Stop rrweb recording
    this.stopRecording();

    // Flush any remaining recording events via sendBeacon
    if (this.eventBuffer.length > 0) {
      try {
        const recordingBody = JSON.stringify({
          sessionId: this.sessionId,
          events: this.eventBuffer,
          sequence: this.recordingSequence,
        });
        navigator.sendBeacon(
          `${this.trackingUrl}/recording`,
          new Blob([recordingBody], { type: 'application/json' }),
        );
        this.eventBuffer = [];
        this.recordingSequence++;
      } catch {
        // Best effort
      }
    }

    // Use sendBeacon for reliable delivery during page unload
    const url = `${this.trackingUrl}/session/end`;
    const body = JSON.stringify({ sessionId: this.sessionId });

    try {
      const sent = navigator.sendBeacon(
        url,
        new Blob([body], { type: 'application/json' }),
      );
      if (!sent) {
        // Fallback to sync XHR (last resort)
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
      }
    } catch {
      // Nothing more we can do
    }

    this.sessionId = null;
  }
}
