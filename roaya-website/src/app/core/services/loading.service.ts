import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApplicationRef } from '@angular/core';
import { filter, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Loading Service
 * Manages application loading states including:
 * - Solar system loading screen (initial app load)
 * - Page transition loading states
 * - Global loading overlay
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly appRef = inject(ApplicationRef);
  private readonly platformId = inject(PLATFORM_ID);

  // Initial app loading state (shown once at startup)
  isInitialLoading = signal<boolean>(true);

  // Page transition loading state
  isPageLoading = signal<boolean>(false);

  // Global loading overlay state
  isLoading = signal<boolean>(false);

  /** Minimum time to display the loading screen */
  private readonly MIN_DISPLAY_TIME = 3000; // 3 seconds

  /** Maximum time to wait before forcing dismissal */
  private readonly MAX_DISPLAY_TIME = 10000; // 10 seconds (safety timeout)

  /** Fade-out animation duration (must match CSS) */
  private readonly FADE_DURATION = 600; // ms

  /** Timestamp when loading started */
  private loadingStartTime = Date.now();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSolarSystemLoader();
    }
  }

  /**
   * Initialize the solar system loading screen dismissal logic.
   * Waits for the Angular app to stabilize, then hides the screen.
   */
  private initSolarSystemLoader(): void {
    // Wait for app to be stable (all async tasks complete)
    this.appRef.isStable.pipe(
      filter((stable) => stable),
      timeout(this.MAX_DISPLAY_TIME),
      catchError(() => {
        console.warn('Loading screen timeout - forcing dismissal');
        return of(true);
      }),
      take(1)
    ).subscribe(() => {
      this.hideSolarSystemLoader();
    });
  }

  /**
   * Hide the solar system loading screen with smooth fade-out animation.
   * Respects minimum display time to prevent flash on fast loads.
   */
  private hideSolarSystemLoader(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    const elapsedTime = Date.now() - this.loadingStartTime;
    const remainingTime = Math.max(0, this.MIN_DISPLAY_TIME - elapsedTime);

    // Ensure minimum display time for smooth UX
    setTimeout(() => {
      // Add fade-out class to trigger CSS transition
      loadingScreen.classList.add('fade-out');

      // Update signal state
      this.isInitialLoading.set(false);

      // Remove from DOM after transition completes
      setTimeout(() => {
        loadingScreen.remove();
      }, this.FADE_DURATION);
    }, remainingTime);
  }

  /**
   * Mark initial loading as complete (legacy method, kept for compatibility)
   */
  completeInitialLoading(): void {
    this.hideSolarSystemLoader();
  }

  /**
   * Start page transition loading
   */
  startPageLoading(): void {
    this.isPageLoading.set(true);
  }

  /**
   * Complete page transition loading
   */
  completePageLoading(): void {
    this.isPageLoading.set(false);
  }

  /**
   * Show global loading overlay
   */
  showLoading(): void {
    this.isLoading.set(true);
  }

  /**
   * Hide global loading overlay
   */
  hideLoading(): void {
    this.isLoading.set(false);
  }

  /**
   * Manually dismiss the loading screen (useful for specific scenarios)
   */
  dismiss(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.hideSolarSystemLoader();
    }
  }
}
