import { Injectable, signal, effect, inject, computed, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { splitLocale, withLocale } from '../i18n/locale-routing';
import { TranslationCacheService } from './translation-cache.service';
import { GoogleTranslateService } from './google-translate.service';

export type Language = 'en' | 'ar';

/**
 * Language Service
 * Manages bilingual support (English/Arabic) with RTL handling
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANGUAGE_KEY = 'roaya-language';
  private readonly translate = inject(TranslateService);
  private readonly cacheService = inject(TranslationCacheService);
  private readonly googleTranslate = inject(GoogleTranslateService);
  private readonly router = inject(Router);

  /** See ThemeService.isBrowser — typeof localStorage is unsafe on Node 22+. */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  /** The server document during SSR/prerender, the real one in the browser. */
  private readonly document = inject(DOCUMENT);

  // Signal for reactive language state
  language = signal<Language>(this.getInitialLanguage());

  // Loading state signals for AI translation
  isTranslating = signal<boolean>(false);
  translationError = signal<string | null>(null);

  // Computed signals
  isRTLMode = computed(() => this.language() === 'ar');
  isAIEnabled = computed(() => this.googleTranslate.isAvailable());

  constructor() {
    // Setup available languages
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');

    // Effect to sync language changes
    effect(() => {
      const currentLang = this.language();
      this.applyLanguage(currentLang);
      this.saveLanguage(currentLang);
    });

    // Set initial language
    this.applyLanguage(this.language());

    // Run cache cleanup on startup
    this.cacheService.cleanup().catch(() => {});
  }

  /**
   * Get initial language from localStorage or browser preference
   */
  private getInitialLanguage(): Language {
    if (this.isBrowser) {
      // The URL outranks every stored preference: /ar/* is an Arabic page for
      // everyone who opens it, including a visitor whose last choice was
      // English. Reading it here (not only in the route resolver) keeps the
      // very first paint from flashing the wrong language before the
      // resolver runs.
      const path = this.document.location?.pathname ?? '';
      if (path === '/ar' || path.startsWith('/ar/')) {
        return 'ar';
      }

      const savedLang = localStorage.getItem(this.LANGUAGE_KEY) as Language;
      if (savedLang === 'en' || savedLang === 'ar') {
        return savedLang;
      }
    }

    // Fall back to browser language (with safety check)
    try {
      const browserLang = this.translate?.getBrowserLang?.();
      return browserLang === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  }

  /**
   * Apply language and RTL direction
   */
  private applyLanguage(lang: Language): void {
    // Set translation language
    this.translate.use(lang);

    // Written through the injected DOCUMENT, not the `document` global, so
    // this also runs during SSR/prerender. It used to be browser-only, which
    // meant an Arabic render still shipped `<html lang="en" dir="ltr">` in
    // the first response — telling every crawler the Arabic page was
    // English, and leaving RTL to appear only after hydration.
    const html = this.document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    html.classList.remove('lang-en', 'lang-ar');
    html.classList.add(`lang-${lang}`);
  }

  /**
   * Save language to localStorage
   */
  private saveLanguage(lang: Language): void {
    if (this.isBrowser) {
      localStorage.setItem(this.LANGUAGE_KEY, lang);
    }
  }

  /**
   * Apply the locale the URL declares, and complete only once that locale's
   * translations are loaded.
   *
   * This is the route resolver's entry point (see locale-routing.ts) and the
   * reason the URL — not `localStorage` — decides the rendered language.
   * Returns synchronously when the requested locale is already active, so
   * client-side navigation within one locale costs nothing.
   */
  activateLocale(lang: Language): Observable<Language> {
    if (this.language() !== lang) {
      this.language.set(lang);
    }
    if (this.translate.currentLang === lang) {
      return of(lang);
    }
    return this.translate.use(lang).pipe(map(() => lang));
  }

  /**
   * Toggle between English and Arabic
   */
  toggleLanguage(): void {
    this.setLanguage(this.language() === 'en' ? 'ar' : 'en');
  }

  /**
   * Set specific language.
   *
   * On a public page this NAVIGATES to that page's mirror (/about <->
   * /ar/about) rather than swapping strings in place: the URL is what makes
   * an Arabic page linkable, shareable, and crawlable, so a language that
   * changed without the URL changing would leave the reader on an address
   * that claims to be English. Query string and fragment are carried across
   * so a switch never loses the reader's place.
   *
   * Admin and auth screens are not locale-prefixed (no /ar/admin exists), so
   * there the language still switches in place.
   */
  setLanguage(lang: Language): void {
    const currentUrl = this.router.url;
    const [pathAndQuery, fragment] = currentUrl.split('#');
    const [rawPath, query] = pathAndQuery.split('?');

    if (!this.isLocalizedPath(rawPath)) {
      this.language.set(lang);
      return;
    }

    const { path } = splitLocale(rawPath);
    const target = withLocale(path, lang)
      + (query ? `?${query}` : '')
      + (fragment ? `#${fragment}` : '');

    // The route resolver applies the locale on activation, so this single
    // navigation is the whole switch — setting the signal here too would
    // render the new language against the old URL for one frame.
    void this.router.navigateByUrl(target);
  }

  /** Public pages are mirrored per locale; admin/auth screens are not. */
  private isLocalizedPath(path: string): boolean {
    return !path.startsWith('/admin');
  }

  /**
   * Check if Arabic is active (for RTL logic)
   */
  isRTL(): boolean {
    return this.language() === 'ar';
  }

  /**
   * Get current language code
   */
  getCurrentLanguage(): Language {
    return this.language();
  }

  /**
   * Get translation for a key
   */
  instant(key: string, interpolateParams?: object): string {
    return this.translate.instant(key, interpolateParams);
  }

  /**
   * Get translation observable for a key
   */
  get(key: string, interpolateParams?: object) {
    return this.translate.get(key, interpolateParams);
  }

  /**
   * Clear translation cache for current language
   */
  async clearCache(): Promise<void> {
    await this.cacheService.clearLanguage(this.language());
  }

  /**
   * Clear all translation caches
   */
  async clearAllCache(): Promise<void> {
    await this.cacheService.clearAll();
  }

  /**
   * Refresh translations by clearing cache and reloading
   */
  async refreshTranslations(): Promise<void> {
    const currentLang = this.language();
    this.isTranslating.set(true);
    this.translationError.set(null);

    try {
      // Clear cache for current language
      await this.cacheService.clearLanguage(currentLang);

      // Force reload translations
      this.translate.resetLang(currentLang);
      await this.translate.use(currentLang).toPromise();
    } catch (error) {
      console.error('[LanguageService] Failed to refresh translations:', error);
      this.translationError.set('Failed to refresh translations');
    } finally {
      this.isTranslating.set(false);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ count: number; languages: string[] }> {
    return this.cacheService.getStats();
  }

  /**
   * Get translation API usage statistics
   */
  getAPIUsageStats(): { today: number; limit: number; percentage: number } {
    return this.googleTranslate.getUsageStats();
  }

  /**
   * Check if AI translation is available
   */
  isAITranslationAvailable(): boolean {
    return this.googleTranslate.isAvailable();
  }
}
