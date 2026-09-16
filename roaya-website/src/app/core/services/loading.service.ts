import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

/**
 * Loading Service
 * Manages global loading state for the application.
 *
 * The app-open intro (see InitLoaderComponent) owns its own ~2.1s visual
 * timeline and calls `completeIntro()` when it is done. This service then
 * plays a short exit cross-fade — `isExiting` stays true for the length of
 * the transition — before removing the loader, so the landing page is never
 * revealed by an abrupt unmount. Safety timers cover the cases where the
 * intro never reports back.
 *
 * `isLoading` defaults to `true` (not `false`) on purpose: MainLayoutComponent
 * only calls `show()` inside an `isPlatformBrowser` guard, so during SSR (and
 * during the instant before the client hydrates) nothing ever calls `show()`.
 * If the signal defaulted to `false`, the server-rendered HTML — and the
 * first client paint before Angular finishes bootstrapping — would show the
 * actual home page with no loader over it at all, which then gets covered by
 * the loader a beat later once `ngOnInit` runs. That produced a visible
 * "home page flashes, then the loader appears on top of it" sequence.
 * Defaulting to `true` means the loader is present in the very first HTML
 * the browser paints, so the home page is never revealed before the intro
 * finishes. See docs/deploy/RUNTIME-ENV.md for why SSR output matters here.
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingCount = 0;

  /** Visual length of the intro sequence before the exit begins. */
  private introDuration = 2100;
  /** Length of the exit cross-fade; must match the loader's exit animation. */
  private readonly exitDuration = 300;
  /** Fallback in case the intro never reports completion. */
  private readonly introFallbackSlack = 1500;
  /** Hard limit — the loader never outlives this. */
  private readonly maximumDisplayTime = 10000;

  private fallbackTimeout: ReturnType<typeof setTimeout> | null = null;
  private exitTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxTimeout: ReturnType<typeof setTimeout> | null = null;

  /** See class doc: starts `true` so SSR/first paint never reveals the page. */
  public isLoading = signal(true);
  /** True while the loader is cross-fading out. */
  public isExiting = signal(false);
  /** True once the app reports it can safely be revealed. */
  public contentReady = signal(false);
  public loadingMessage = signal('Loading...');

  // Content readiness tracking
  private contentReady$ = new BehaviorSubject<boolean>(false);
  private introComplete$ = new BehaviorSubject<boolean>(false);

  /**
   * Show the loading overlay. The first call starts the intro window.
   */
  show(message: string = 'Loading...'): void {
    const isFirstShow = this.loadingCount === 0;

    this.loadingCount++;
    this.loadingMessage.set(message);
    this.isExiting.set(false);
    this.isLoading.set(true);

    // Only the first show opens the intro window; nested calls just keep the
    // overlay up and must not extend or restart the sequence.
    if (!isFirstShow) {
      return;
    }

    this.clearTimers();
    this.introComplete$.next(false);
    this.contentReady$.next(false);
    this.contentReady.set(false);

    // If the intro component never reports back (not mounted, destroyed
    // early, no rAF), start the exit anyway.
    this.fallbackTimeout = setTimeout(
      () => this.beginExit(),
      this.introDuration + this.introFallbackSlack
    );

    // Hard maximum — force hide regardless of state.
    this.maxTimeout = setTimeout(() => {
      if (this.isLoading()) {
        console.warn('Loading exceeded maximum time, forcing hide');
        this.forceHide();
      }
    }, this.maximumDisplayTime);
  }

  /**
   * Hide loading indicator (respects the intro window).
   */
  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.checkAndHide();
    }
  }

  /**
   * Mark content as ready (call when critical resources are loaded).
   * The intro holds short of its final stage until this is set.
   */
  setContentReady(): void {
    this.contentReady.set(true);
    this.contentReady$.next(true);
    this.checkAndHide();
  }

  /**
   * Called by the intro sequence once it has finished presenting.
   * Starts the exit cross-fade into the page underneath.
   */
  completeIntro(): void {
    this.introComplete$.next(true);
    this.beginExit();
  }

  /**
   * Begin the exit cross-fade, then remove the loader.
   */
  private beginExit(): void {
    if (!this.isLoading() || this.isExiting()) {
      return;
    }

    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }

    this.isExiting.set(true);
    this.exitTimeout = setTimeout(() => {
      this.exitTimeout = null;
      this.performHide();
    }, this.exitDuration);
  }

  /**
   * Check if both conditions are met and hide if ready.
   */
  private checkAndHide(): void {
    const introComplete = this.introComplete$.getValue();
    const contentReady = this.contentReady$.getValue();
    const noActiveLoading = this.loadingCount <= 0;

    if (introComplete && contentReady && noActiveLoading) {
      this.beginExit();
    }
  }

  /**
   * Actually remove the loading indicator.
   */
  private performHide(): void {
    this.clearTimers();
    this.isLoading.set(false);
    this.isExiting.set(false);
    this.loadingMessage.set('Loading...');
  }

  /**
   * Force hide the loading indicator (reset everything).
   * Use only for error recovery or emergencies.
   */
  forceHide(): void {
    this.clearTimers();
    this.loadingCount = 0;
    this.introComplete$.next(true);
    this.contentReady$.next(true);
    this.contentReady.set(true);
    this.isExiting.set(false);
    this.isLoading.set(false);
    this.loadingMessage.set('Loading...');
  }

  /**
   * Set the intro window length (default: 2200ms).
   */
  setMinimumDisplayTime(ms: number): void {
    this.introDuration = ms;
  }

  private clearTimers(): void {
    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }
    if (this.exitTimeout) {
      clearTimeout(this.exitTimeout);
      this.exitTimeout = null;
    }
    if (this.maxTimeout) {
      clearTimeout(this.maxTimeout);
      this.maxTimeout = null;
    }
  }

  /**
   * Emits once the intro has finished and content is ready.
   */
  get canHide$(): Observable<boolean> {
    return combineLatest([this.introComplete$, this.contentReady$]).pipe(
      map(([introComplete, contentReady]) => introComplete && contentReady),
      filter(canHide => canHide),
      take(1)
    );
  }
}
