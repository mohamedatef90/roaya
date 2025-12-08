import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, forkJoin, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { TranslationCacheService } from '../services/translation-cache.service';

/**
 * Hybrid Translation Loader
 *
 * Loads translations from multiple sources in this priority:
 * 1. Static JSON files (en.json, ar.json) - always loaded first
 * 2. IndexedDB cache - merged with static translations
 *
 * This allows:
 * - Static translations to work immediately
 * - AI-translated content to be cached and reused
 * - Missing translations to be added without modifying static files
 */
export class HybridTranslationLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private cacheService: TranslationCacheService
  ) {}

  /**
   * Load translations for a language
   * Merges static JSON with cached AI translations
   */
  getTranslation(lang: string): Observable<any> {
    // Load static file first
    const staticTranslations$ = this.loadStaticTranslations(lang);

    // For English, just return static (it's the source of truth)
    if (lang === 'en') {
      return staticTranslations$;
    }

    // For other languages, merge with cache
    return staticTranslations$.pipe(
      switchMap(staticTranslations =>
        from(this.loadCachedTranslations(lang)).pipe(
          map(cachedTranslations => {
            // Merge: cached translations override static for the same keys
            // This allows AI translations to take precedence once cached
            return this.deepMerge(staticTranslations, cachedTranslations);
          }),
          catchError(() => of(staticTranslations))
        )
      )
    );
  }

  /**
   * Load static translation file
   */
  private loadStaticTranslations(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`).pipe(
      catchError(error => {
        console.error(`[HybridLoader] Failed to load ${lang}.json:`, error);
        // Return empty object if file doesn't exist
        return of({});
      })
    );
  }

  /**
   * Load cached translations from IndexedDB
   */
  private async loadCachedTranslations(lang: string): Promise<Record<string, string>> {
    try {
      const cached = await this.cacheService.getAll(lang);
      return this.unflattenTranslations(cached);
    } catch (error) {
      console.error('[HybridLoader] Failed to load cached translations:', error);
      return {};
    }
  }

  /**
   * Convert flat keys (e.g., 'home.hero.title') to nested object
   * { 'home.hero.title': 'value' } => { home: { hero: { title: 'value' } } }
   */
  private unflattenTranslations(flat: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [flatKey, value] of Object.entries(flat)) {
      const keys = flatKey.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
    }

    return result;
  }

  /**
   * Deep merge two objects
   * Source values override target values
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (key in target && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          result[key] = this.deepMerge(target[key], source[key]);
        } else {
          result[key] = { ...source[key] };
        }
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }
}

/**
 * Factory function for creating HybridTranslationLoader
 * Used in app.config.ts provider configuration
 */
export function HybridTranslationLoaderFactory(
  http: HttpClient,
  cacheService: TranslationCacheService
): TranslateLoader {
  return new HybridTranslationLoader(http, cacheService);
}
