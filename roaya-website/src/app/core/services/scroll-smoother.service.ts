import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Configuration options for ScrollSmoother
 */
export interface ScrollSmootherConfig {
  smooth?: number;
  effects?: boolean;
  smoothTouch?: number | boolean;
  normalizeScroll?: boolean;
  ignoreMobileResize?: boolean;
  preventDefault?: boolean;
  wrapper?: string | Element;
  content?: string | Element;
  ease?: string;
  onUpdate?: (self: ScrollSmoother) => void;
  onStop?: (self: ScrollSmoother) => void;
}

/**
 * ScrollSmootherService - Centralized GSAP ScrollSmoother management
 *
 * Responsibilities:
 * - Initialize ScrollSmoother once per app lifecycle
 * - Provide observable for components to await initialization
 * - Handle cleanup on destroy
 * - Respect prefers-reduced-motion accessibility setting
 * - Support RTL layout normalization
 *
 * Usage Pattern:
 * ```typescript
 * constructor(private scrollSmootherService: ScrollSmootherService) {}
 *
 * ngAfterViewInit() {
 *   this.scrollSmootherService.smootherReady$
 *     .pipe(filter(ready => ready), take(1))
 *     .subscribe(() => {
 *       // Create ScrollTrigger animations
 *       // ScrollSmoother is now available
 *     });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ScrollSmootherService {
  private readonly platformId = inject(PLATFORM_ID);
  private _smoother: ScrollSmoother | null = null;
  private _initialized = new BehaviorSubject<boolean>(false);
  private _prefersReducedMotion = signal(false);

  /**
   * Observable that emits true when ScrollSmoother is initialized and ready
   */
  public readonly smootherReady$: Observable<boolean> = this._initialized.asObservable();

  constructor() {
    // Register GSAP plugins
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

      // Detect reduced motion preference
      this._prefersReducedMotion.set(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );

      // Listen for changes to reduced motion preference
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        this._prefersReducedMotion.set(e.matches);
        // If preference changes, reinitialize ScrollSmoother
        if (this._smoother) {
          this.destroy();
          this.init();
        }
      });
    }
  }

  /**
   * Initialize ScrollSmoother with configuration
   * Should be called once in MainLayoutComponent.ngAfterViewInit()
   *
   * @param config - Optional ScrollSmoother configuration overrides
   */
  public init(config?: ScrollSmootherConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Prevent double initialization
    if (this._smoother) {
      console.warn('[ScrollSmootherService] Already initialized. Call destroy() first.');
      return;
    }

    // Verify DOM structure exists
    const wrapper = document.querySelector('#smooth-wrapper');
    const content = document.querySelector('#smooth-content');

    if (!wrapper || !content) {
      console.error('[ScrollSmootherService] Required DOM structure missing: #smooth-wrapper and #smooth-content');
      return;
    }

    // Default configuration
    const defaultConfig: ScrollSmootherConfig = {
      smooth: this._prefersReducedMotion() ? 0 : 1.5, // Disable smooth scroll if reduced motion
      effects: !this._prefersReducedMotion(), // Disable parallax effects if reduced motion
      smoothTouch: this._prefersReducedMotion() ? false : 0.1, // Smooth touch scroll on mobile
      normalizeScroll: true, // Prevent address bar hide/show on mobile from affecting scroll
      ignoreMobileResize: true, // Ignore mobile keyboard resize
      preventDefault: false, // Allow default scroll behavior
    };

    // Merge with user config
    const finalConfig = { ...defaultConfig, ...config };

    try {
      // Create ScrollSmoother instance
      this._smoother = ScrollSmoother.create(finalConfig);

      // Mark as initialized
      this._initialized.next(true);

      console.log('[ScrollSmootherService] Initialized successfully', {
        config: finalConfig,
        reducedMotion: this._prefersReducedMotion()
      });
    } catch (error) {
      console.error('[ScrollSmootherService] Initialization failed:', error);
      this._initialized.next(false);
    }
  }

  /**
   * Get the ScrollSmoother instance
   * Returns undefined if not initialized
   */
  public getSmoother(): ScrollSmoother | undefined {
    return this._smoother || undefined;
  }

  /**
   * Check if ScrollSmoother is initialized
   */
  public isReady(): boolean {
    return this._initialized.value;
  }

  /**
   * Scroll to a target element or position
   *
   * @param target - Element, selector string, or scroll position
   * @param smooth - Whether to animate the scroll (default: true)
   * @param offset - Offset from target position (default: "top top")
   */
  public scrollTo(target: string | Element | number, smooth: boolean = true, offset?: string): void {
    if (!this._smoother) {
      console.warn('[ScrollSmootherService] Cannot scrollTo: Not initialized');
      return;
    }

    this._smoother.scrollTo(target, smooth, offset);
  }

  /**
   * Pause smooth scrolling
   */
  public pause(): void {
    if (this._smoother) {
      this._smoother.paused(true);
    }
  }

  /**
   * Resume smooth scrolling
   */
  public resume(): void {
    if (this._smoother) {
      this._smoother.paused(false);
    }
  }

  /**
   * Cleanup ScrollSmoother instance
   * Call this in MainLayoutComponent.ngOnDestroy()
   */
  public destroy(): void {
    if (this._smoother) {
      this._smoother.kill();
      this._smoother = null;
      this._initialized.next(false);
      console.log('[ScrollSmootherService] Destroyed');
    }
  }

  /**
   * Get current scroll position
   */
  public scrollTop(): number {
    return this._smoother?.scrollTop() || 0;
  }

  /**
   * Check if reduced motion is preferred
   */
  public prefersReducedMotion(): boolean {
    return this._prefersReducedMotion();
  }
}
