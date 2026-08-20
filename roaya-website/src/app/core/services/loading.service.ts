import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, timer } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

/**
 * Loading Service
 * Manages global loading state for the application
 * Supports minimum display time and content readiness tracking
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingCount = 0;
  private loadingStartTime: number | null = null;
  private minimumDisplayTime = 2000; // 2 seconds fixed display time
  private maximumDisplayTime = 10000; // 10 seconds maximum - hard limit
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxTimeout: ReturnType<typeof setTimeout> | null = null;

  public isLoading = signal(false);
  public loadingMessage = signal('Loading...');

  // Content readiness tracking
  private contentReady$ = new BehaviorSubject<boolean>(false);
  private minimumTimeElapsed$ = new BehaviorSubject<boolean>(false);

  /**
   * Show loading indicator with minimum display time
   */
  show(message: string = 'Loading...'): void {
    // Clear any pending timeouts
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.maxTimeout) {
      clearTimeout(this.maxTimeout);
      this.maxTimeout = null;
    }

    this.loadingCount++;
    this.loadingMessage.set(message);
    this.isLoading.set(true);

    // Record start time on first show
    if (this.loadingStartTime === null) {
      this.loadingStartTime = Date.now();
      this.minimumTimeElapsed$.next(false);
      this.contentReady$.next(false);

      // Auto-hide after fixed duration (don't wait for content)
      timer(this.minimumDisplayTime).subscribe(() => {
        this.minimumTimeElapsed$.next(true);
        this.contentReady$.next(true); // Force content ready
        this.performHide();
      });

      // HARD MAXIMUM TIMEOUT - force hide after max time regardless of state
      this.maxTimeout = setTimeout(() => {
        if (this.isLoading()) {
          console.warn('Loading exceeded maximum time, forcing hide');
          this.forceHide();
        }
      }, this.maximumDisplayTime);
    }
  }

  /**
   * Hide loading indicator (respects minimum display time)
   */
  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.checkAndHide();
    }
  }

  /**
   * Mark content as ready (call when critical resources loaded)
   */
  setContentReady(): void {
    this.contentReady$.next(true);
    this.checkAndHide();
  }

  /**
   * Check if both conditions met and hide if ready
   */
  private checkAndHide(): void {
    const minimumTimeElapsed = this.minimumTimeElapsed$.getValue();
    const contentReady = this.contentReady$.getValue();
    const noActiveLoading = this.loadingCount <= 0;

    // Hide only when: minimum time elapsed AND content ready AND no active loading
    if (minimumTimeElapsed && contentReady && noActiveLoading) {
      this.performHide();
    }
  }

  /**
   * Actually hide the loading indicator
   */
  private performHide(): void {
    this.isLoading.set(false);
    this.loadingMessage.set('Loading...');
    this.loadingStartTime = null;
  }

  /**
   * Force hide loading indicator (reset everything)
   * Use only for error recovery or emergency
   */
  forceHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.maxTimeout) {
      clearTimeout(this.maxTimeout);
      this.maxTimeout = null;
    }
    this.loadingCount = 0;
    this.loadingStartTime = null;
    this.minimumTimeElapsed$.next(true);
    this.contentReady$.next(true);
    this.isLoading.set(false);
    this.loadingMessage.set('Loading...');
  }

  /**
   * Set minimum display time (default: 3000ms)
   */
  setMinimumDisplayTime(ms: number): void {
    this.minimumDisplayTime = ms;
  }

  /**
   * Get observable for when loading should complete
   * Emits true when both minimum time elapsed and content ready
   */
  get canHide$(): Observable<boolean> {
    return combineLatest([
      this.minimumTimeElapsed$,
      this.contentReady$
    ]).pipe(
      map(([timeElapsed, contentReady]) => timeElapsed && contentReady),
      filter(canHide => canHide),
      take(1)
    );
  }
}
