import { Injectable, signal, effect, inject, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
    // Check localStorage first (with SSR safety)
    if (typeof localStorage !== 'undefined') {
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

    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      
      // Set language attribute
      html.setAttribute('lang', lang);
      
      // Set direction (RTL for Arabic, LTR for English)
      const direction = lang === 'ar' ? 'rtl' : 'ltr';
      html.setAttribute('dir', direction);
      
      // Update body class for styling hooks
      html.classList.remove('lang-en', 'lang-ar');
      html.classList.add(`lang-${lang}`);
    }
  }

  /**
   * Save language to localStorage
   */
  private saveLanguage(lang: Language): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.LANGUAGE_KEY, lang);
    }
  }

  /**
   * Toggle between English and Arabic
   */
  toggleLanguage(): void {
    this.language.update(current => current === 'en' ? 'ar' : 'en');
  }

  /**
   * Set specific language
   */
  setLanguage(lang: Language): void {
    this.language.set(lang);
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
