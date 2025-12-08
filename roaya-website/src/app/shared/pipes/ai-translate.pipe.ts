import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { GoogleTranslateService } from '../../core/services/google-translate.service';
import { TranslationCacheService } from '../../core/services/translation-cache.service';
import { LanguageService } from '../../core/services/language.service';

/**
 * AI Translate Pipe
 *
 * Translates dynamic text content using Google Translate API.
 * Use this for content that comes from CMS, user input, or other dynamic sources
 * that aren't in the static translation files.
 *
 * Usage:
 *   {{ dynamicText | aiTranslate }}
 *   {{ dynamicText | aiTranslate:'ar' }}
 *   {{ dynamicText | aiTranslate:'ar':'en' }}
 *
 * Features:
 * - Automatic caching in IndexedDB
 * - Falls back to original text if translation fails
 * - Reactive to language changes
 * - Shows original text while translating
 */
@Pipe({
  name: 'aiTranslate',
  standalone: true,
  pure: false // Impure to react to language changes
})
export class AiTranslatePipe implements PipeTransform, OnDestroy {
  private readonly googleTranslate = inject(GoogleTranslateService);
  private readonly cache = inject(TranslationCacheService);
  private readonly languageService = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Cache for current translations
  private translationCache = new Map<string, string>();
  private pendingTranslations = new Map<string, Observable<string>>();
  private subscription: Subscription | null = null;

  // Track last values for change detection
  private lastText: string = '';
  private lastTargetLang: string = '';
  private lastResult: string = '';

  transform(
    text: string | null | undefined,
    targetLang?: string,
    sourceLang: string = 'en'
  ): string {
    // Handle null/undefined
    if (!text) {
      return '';
    }

    // Default to current language if not specified
    const target = targetLang || this.languageService.getCurrentLanguage();

    // Skip if same language
    if (target === sourceLang) {
      return text;
    }

    // Check if we have a cached result
    const cacheKey = this.getCacheKey(text, target, sourceLang);
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    // Check if values changed
    if (text === this.lastText && target === this.lastTargetLang) {
      return this.lastResult || text;
    }

    // Update tracking
    this.lastText = text;
    this.lastTargetLang = target;

    // Start translation asynchronously
    this.translateAsync(text, target, sourceLang, cacheKey);

    // Return original text while translating
    return text;
  }

  private async translateAsync(
    text: string,
    targetLang: string,
    sourceLang: string,
    cacheKey: string
  ): Promise<void> {
    // Check IndexedDB cache first
    const dbCacheKey = `dynamic:${this.hashText(text)}`;
    const cached = await this.cache.get(dbCacheKey, targetLang);

    if (cached) {
      this.translationCache.set(cacheKey, cached);
      this.lastResult = cached;
      this.cdr.markForCheck();
      return;
    }

    // Skip if already pending
    if (this.pendingTranslations.has(cacheKey)) {
      return;
    }

    // Check if AI translation is available
    if (!this.googleTranslate.isAvailable()) {
      this.translationCache.set(cacheKey, text);
      this.lastResult = text;
      return;
    }

    // Start translation
    const translation$ = this.googleTranslate.translate(text, targetLang, sourceLang).pipe(
      tap(async (translated) => {
        // Cache result
        this.translationCache.set(cacheKey, translated);
        this.lastResult = translated;

        // Store in IndexedDB
        await this.cache.set(dbCacheKey, targetLang, translated);

        // Trigger change detection
        this.cdr.markForCheck();
      }),
      catchError(() => {
        // On error, use original text
        this.translationCache.set(cacheKey, text);
        this.lastResult = text;
        return of(text);
      })
    );

    this.pendingTranslations.set(cacheKey, translation$);

    // Subscribe to translation
    this.subscription = translation$.subscribe(() => {
      this.pendingTranslations.delete(cacheKey);
    });
  }

  private getCacheKey(text: string, targetLang: string, sourceLang: string): string {
    return `${sourceLang}:${targetLang}:${this.hashText(text)}`;
  }

  private hashText(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.translationCache.clear();
    this.pendingTranslations.clear();
  }
}

/**
 * AI Translate Async Pipe
 *
 * Returns an Observable for async translation with loading states.
 * Use with Angular async pipe for more control over loading UI.
 *
 * Usage:
 *   <span>{{ dynamicText | aiTranslateAsync | async }}</span>
 */
@Pipe({
  name: 'aiTranslateAsync',
  standalone: true
})
export class AiTranslateAsyncPipe implements PipeTransform {
  private readonly googleTranslate = inject(GoogleTranslateService);
  private readonly cache = inject(TranslationCacheService);
  private readonly languageService = inject(LanguageService);

  transform(
    text: string | null | undefined,
    targetLang?: string,
    sourceLang: string = 'en'
  ): Observable<string> {
    if (!text) {
      return of('');
    }

    const target = targetLang || this.languageService.getCurrentLanguage();

    if (target === sourceLang) {
      return of(text);
    }

    if (!this.googleTranslate.isAvailable()) {
      return of(text);
    }

    return new Observable<string>(subscriber => {
      // Emit original text immediately
      subscriber.next(text);

      // Then try to get translation
      this.getTranslation(text, target, sourceLang).then(translated => {
        subscriber.next(translated);
        subscriber.complete();
      }).catch(() => {
        subscriber.complete();
      });
    });
  }

  private async getTranslation(
    text: string,
    targetLang: string,
    sourceLang: string
  ): Promise<string> {
    // Check cache first
    const cacheKey = `dynamic:${this.hashText(text)}`;
    const cached = await this.cache.get(cacheKey, targetLang);
    if (cached) {
      return cached;
    }

    // Translate
    return new Promise((resolve) => {
      this.googleTranslate.translate(text, targetLang, sourceLang).subscribe({
        next: async (translated) => {
          await this.cache.set(cacheKey, targetLang, translated);
          resolve(translated);
        },
        error: () => resolve(text)
      });
    });
  }

  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}
