import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, from, forkJoin } from 'rxjs';
import { map, distinctUntilChanged, catchError, timeout } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * Content Loading Service
 * Tracks critical resources loading state for smooth page transitions
 * Monitors: Images, Fonts, Translations, Animations
 */
@Injectable({
  providedIn: 'root',
})
export class ContentLoadingService {
  private translateService = inject(TranslateService);

  // Individual resource tracking
  private criticalImagesLoaded$ = new BehaviorSubject<boolean>(false);
  private fontsReady$ = new BehaviorSubject<boolean>(false);
  private translationsLoaded$ = new BehaviorSubject<boolean>(false);
  private animationsReady$ = new BehaviorSubject<boolean>(false);

  // Timeout for resource loading (10 seconds max)
  private readonly LOADING_TIMEOUT = 10000;

  // Global fallback timeout to prevent infinite loading
  private readonly GLOBAL_TIMEOUT = 8000;

  constructor() {
    this.initFontsTracking();
    this.initTranslationsTracking();
    this.initGlobalFallback();
  }

  /**
   * Initialize global fallback timeout to prevent infinite loading
   * If content isn't ready within 8 seconds, force it ready
   */
  private initGlobalFallback(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const status = this.getStatus();
        if (!status.images || !status.fonts || !status.translations || !status.animations) {
          console.warn('Content loading timeout - forcing ready state. Status:', status);
          this.forceReady();
        }
      }, this.GLOBAL_TIMEOUT);
    }
  }

  /**
   * Combined observable - emits true when ALL critical resources are ready
   */
  get contentReady$(): Observable<boolean> {
    return combineLatest([
      this.criticalImagesLoaded$,
      this.fontsReady$,
      this.translationsLoaded$,
      this.animationsReady$
    ]).pipe(
      map(([images, fonts, translations, animations]) => {
        return images && fonts && translations && animations;
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Track critical images loading
   * @param imageUrls Array of image URLs that must load before content is ready
   */
  trackCriticalImages(imageUrls: string[]): void {
    if (imageUrls.length === 0) {
      this.criticalImagesLoaded$.next(true);
      return;
    }

    const imagePromises = imageUrls.map(url => this.preloadImage(url));

    from(Promise.all(imagePromises)).pipe(
      timeout(this.LOADING_TIMEOUT),
      catchError(() => {
        console.warn('Some critical images failed to load, proceeding anyway');
        return [true];
      })
    ).subscribe(() => {
      this.criticalImagesLoaded$.next(true);
    });
  }

  /**
   * Mark images as loaded (manual trigger)
   */
  setImagesLoaded(): void {
    this.criticalImagesLoaded$.next(true);
  }

  /**
   * Mark animations as ready (call after GSAP initialization)
   */
  setAnimationsReady(): void {
    this.animationsReady$.next(true);
  }

  /**
   * Reset all tracking states (for navigation between pages)
   */
  reset(): void {
    this.criticalImagesLoaded$.next(false);
    this.animationsReady$.next(false);
    // Don't reset fonts and translations - they persist
  }

  /**
   * Force mark all content as ready
   */
  forceReady(): void {
    this.criticalImagesLoaded$.next(true);
    this.fontsReady$.next(true);
    this.translationsLoaded$.next(true);
    this.animationsReady$.next(true);
  }

  /**
   * Initialize fonts tracking using document.fonts API
   */
  private initFontsTracking(): void {
    if (typeof document !== 'undefined' && document.fonts) {
      from(document.fonts.ready).pipe(
        timeout(this.LOADING_TIMEOUT),
        catchError(() => {
          console.warn('Fonts loading timeout, proceeding anyway');
          return [true];
        })
      ).subscribe(() => {
        this.fontsReady$.next(true);
      });
    } else {
      // Fallback for SSR or unsupported browsers
      this.fontsReady$.next(true);
    }
  }

  /**
   * Initialize translations tracking
   */
  private initTranslationsTracking(): void {
    // Check if translations are already loaded
    const currentLang = this.translateService.currentLang || this.translateService.defaultLang;

    if (currentLang) {
      // Try to get a translation to verify loaded
      this.translateService.get('common.loading').subscribe({
        next: () => {
          this.translationsLoaded$.next(true);
        },
        error: () => {
          // Wait for lang change event
          this.translateService.onLangChange.subscribe(() => {
            this.translationsLoaded$.next(true);
          });
        }
      });
    } else {
      // Wait for language to be set
      this.translateService.onLangChange.subscribe(() => {
        this.translationsLoaded$.next(true);
      });
    }

    // Fallback timeout (browser only - a pending timer would delay SSR stability)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (!this.translationsLoaded$.getValue()) {
          this.translationsLoaded$.next(true);
        }
      }, 3000);
    }
  }

  /**
   * Preload a single image
   */
  private preloadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof Image === 'undefined') {
        resolve(true);
        return;
      }

      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        resolve(true); // Resolve anyway to not block loading
      };
      img.src = url;
    });
  }

  /**
   * Get current loading status (for debugging)
   */
  getStatus(): { images: boolean; fonts: boolean; translations: boolean; animations: boolean } {
    return {
      images: this.criticalImagesLoaded$.getValue(),
      fonts: this.fontsReady$.getValue(),
      translations: this.translationsLoaded$.getValue(),
      animations: this.animationsReady$.getValue()
    };
  }
}
