import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApplicationRef } from '@angular/core';
import { filter, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Loading Service
 * Manages application loading states including:
 * - Solar system loading screen (initial app load)
 * - Wave abstract lines page transition effect
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

  /** Wave transition animation duration */
  private readonly WAVE_TRANSITION_DURATION = 1500; // ms

  /** Timestamp when loading started */
  private loadingStartTime = Date.now();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSolarSystemLoader();
      this.detectLanguageForTransition();
    }
  }

  /**
   * Detect browser language and update transition text
   */
  private detectLanguageForTransition(): void {
    const transitionText = document.getElementById('transition-text');
    if (!transitionText) return;

    const browserLang = navigator.language || (navigator as any).userLanguage;
    const isArabic = browserLang.startsWith('ar');

    if (isArabic) {
      transitionText.setAttribute('data-lang', 'ar');
      const mainText = transitionText.querySelector('.transition-text-main');
      const subText = transitionText.querySelector('.transition-text-sub');
      if (mainText) mainText.textContent = 'مرحباً';
      if (subText) subText.textContent = 'نبتكر حلول تقنية المعلومات';
    }
  }

  /**
   * Initialize the solar system loading screen dismissal logic.
   * Waits for the Angular app to stabilize, then hides the screen with wave transition.
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
   * Hide the solar system loading screen with wave abstract lines transition.
   * Respects minimum display time to prevent flash on fast loads.
   * Waits for Earth to be rendered before dismissing.
   */
  private hideSolarSystemLoader(): void {
    const loadingScreen = document.getElementById('loading-screen');
    const waveTransition = document.getElementById('wave-transition');
    if (!loadingScreen) return;

    const elapsedTime = Date.now() - this.loadingStartTime;
    const remainingTime = Math.max(0, this.MIN_DISPLAY_TIME - elapsedTime);

    // Wait for Earth to be ready (with timeout)
    const waitForEarth = (): Promise<void> => {
      return new Promise((resolve) => {
        const checkEarth = () => {
          const earthReady = (window as any).earthRendered === true;
          if (earthReady) {
            resolve();
          } else {
            // Check again after a short delay, but don't wait forever
            setTimeout(() => {
              if (Date.now() - this.loadingStartTime < this.MAX_DISPLAY_TIME) {
                checkEarth();
              } else {
                // Timeout - proceed anyway
                resolve();
              }
            }, 100);
          }
        };
        checkEarth();
      });
    };

    // Ensure minimum display time and Earth readiness for smooth UX
    Promise.all([
      new Promise(resolve => setTimeout(resolve, remainingTime)),
      waitForEarth()
    ]).then(() => {
      // Cleanup typing animation if exists
      if (typeof (window as any).cleanupTypingAnimation === 'function') {
        (window as any).cleanupTypingAnimation();
      }

      // Step 1: Start fading out the loader
      loadingScreen.classList.add('wave-exit');

      // Step 2: Activate wave transition with incoming animation
      setTimeout(() => {
        if (waveTransition) {
          waveTransition.classList.add('active', 'wave-in');
        }
      }, 200);

      // Step 3: Remove loading screen while wave is visible
      setTimeout(() => {
        loadingScreen.remove();
        this.isInitialLoading.set(false);
      }, 500);

      // Step 4: Start wave out animation to reveal hero
      setTimeout(() => {
        if (waveTransition) {
          waveTransition.classList.remove('wave-in');
          waveTransition.classList.add('wave-out');
        }
      }, 2000);

      // Step 5: Remove wave transition after animation completes
      setTimeout(() => {
        if (waveTransition) {
          waveTransition.classList.remove('active', 'wave-out');
          waveTransition.remove();
        }
      }, 3000);
    });
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
