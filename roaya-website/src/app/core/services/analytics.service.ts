import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Analytics Service
 * Handles Google Analytics 4 and other analytics tracking
 * 
 * TODO: Add GA4 Measurement ID to environment configuration
 * TODO: Initialize gtag in index.html or here
 * TODO: Set up Search Console verification
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  
  // TODO: Get from environment configuration
  private readonly ga4Id = 'G-XXXXXXXXXX'; // Replace with actual GA4 Measurement ID
  private isInitialized = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initialize();
      this.trackPageViews();
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  private initialize(): void {
    if (!isPlatformBrowser(this.platformId) || this.isInitialized) return;

    // TODO: Add GA4 script to index.html:
    // <!-- Google tag (gtag.js) -->
    // <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
    // <script>
    //   window.dataLayer = window.dataLayer || [];
    //   function gtag(){dataLayer.push(arguments);}
    //   gtag('js', new Date());
    //   gtag('config', 'G-XXXXXXXXXX');
    // </script>

    if (typeof (window as any).gtag === 'function') {
      this.isInitialized = true;
      console.log('Analytics initialized');
    } else {
      console.warn('Google Analytics not loaded. Add GA4 script to index.html');
    }
  }

  /**
   * Track page views automatically on route changes
   */
  private trackPageViews(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Track a page view
   */
  trackPageView(url: string): void {
    if (!isPlatformBrowser(this.platformId) || !this.isInitialized) return;

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', this.ga4Id, {
        page_path: url
      });
    }
  }

  /**
   * Track an event
   */
  trackEvent(eventName: string, eventParams?: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId) || !this.isInitialized) return;

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, eventParams);
    }
  }

  /**
   * Track ROI Calculator usage
   */
  trackROICalculator(type: 'cloud' | 'email' | 'security', action: 'started' | 'completed' | 'lead_captured'): void {
    this.trackEvent('roi_calculator', {
      calculator_type: type,
      action: action
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formType: 'contact' | 'roi_lead' | 'newsletter', success: boolean): void {
    this.trackEvent('form_submission', {
      form_type: formType,
      success: success
    });
  }

  /**
   * Track content engagement
   */
  trackContentEngagement(contentType: 'blog' | 'case_study' | 'whitepaper', contentId: string, action: 'view' | 'download' | 'share'): void {
    this.trackEvent('content_engagement', {
      content_type: contentType,
      content_id: contentId,
      action: action
    });
  }
}
