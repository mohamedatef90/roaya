import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { Injectable, inject } from '@angular/core';
import { GoogleTranslateService } from '../services/google-translate.service';
import { TranslationCacheService } from '../services/translation-cache.service';
import { firstValueFrom } from 'rxjs';

/**
 * AI Missing Translation Handler
 *
 * When ngx-translate encounters a missing translation key:
 * 1. Check if AI translation is enabled
 * 2. Get the English text for the key
 * 3. Translate it using Google Translate API
 * 4. Cache the result in IndexedDB
 * 5. Return the translated text
 *
 * Falls back to returning the key if translation fails.
 */
@Injectable({
  providedIn: 'root'
})
export class AIMissingTranslationHandler implements MissingTranslationHandler {
  private readonly googleTranslate = inject(GoogleTranslateService);
  private readonly cache = inject(TranslationCacheService);

  // Track pending translations to avoid duplicate API calls
  private pendingTranslations = new Map<string, Promise<string>>();

  // Store English translations for lookup
  private englishTranslations: Record<string, any> = {};

  /**
   * Handle a missing translation
   * Called by ngx-translate when a key is not found in the current language
   */
  handle(params: MissingTranslationHandlerParams): string {
    const { key, translateService } = params;
    const currentLang = translateService.currentLang;

    // Don't translate if current language is English (source language)
    if (currentLang === 'en') {
      return key;
    }

    // Check if AI translation is available
    if (!this.googleTranslate.isAvailable()) {
      return key;
    }

    // Get English text for this key
    const englishText = this.getEnglishText(key, translateService);

    // If no English text found, return key
    if (!englishText || englishText === key) {
      return key;
    }

    // Start async translation (will update later)
    this.translateAsync(key, englishText, currentLang);

    // Return key initially (translation will be cached for next time)
    // This provides a synchronous response while translation happens in background
    return key;
  }

  /**
   * Get English translation for a key
   */
  private getEnglishText(key: string, translateService: any): string {
    // Try to get from cached English translations
    const value = this.getNestedValue(this.englishTranslations, key);
    if (value && typeof value === 'string') {
      return value;
    }

    // Try to get from translateService
    const translations = translateService.translations['en'];
    if (translations) {
      this.englishTranslations = translations;
      const fromService = this.getNestedValue(translations, key);
      if (fromService && typeof fromService === 'string') {
        return fromService;
      }
    }

    return key;
  }

  /**
   * Get nested value from object using dot notation key
   */
  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  /**
   * Perform async translation and cache result
   */
  private async translateAsync(key: string, englishText: string, targetLang: string): Promise<void> {
    const cacheKey = `${key}:${targetLang}`;

    // Check if already pending
    if (this.pendingTranslations.has(cacheKey)) {
      return;
    }

    // Check if already cached
    const cached = await this.cache.get(key, targetLang);
    if (cached) {
      return; // Already have it
    }

    // Start translation
    const translationPromise = this.doTranslate(key, englishText, targetLang);
    this.pendingTranslations.set(cacheKey, translationPromise);

    try {
      await translationPromise;
    } finally {
      this.pendingTranslations.delete(cacheKey);
    }
  }

  /**
   * Perform the actual translation
   */
  private async doTranslate(key: string, englishText: string, targetLang: string): Promise<string> {
    try {
      const translated = await firstValueFrom(
        this.googleTranslate.translate(englishText, targetLang, 'en')
      );

      // Cache the result
      if (translated && translated !== englishText) {
        await this.cache.set(key, targetLang, translated);
        console.log(`[AIMissingHandler] Translated and cached: ${key}`);
      }

      return translated;
    } catch (error) {
      console.error(`[AIMissingHandler] Translation failed for ${key}:`, error);
      return englishText;
    }
  }

  /**
   * Pre-translate a batch of missing keys
   * Useful for translating all missing keys at once
   */
  async translateBatch(
    keys: string[],
    translateService: any,
    targetLang: string
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    // Get English texts for all keys
    const textsToTranslate: { key: string; text: string }[] = [];

    for (const key of keys) {
      const englishText = this.getEnglishText(key, translateService);
      if (englishText && englishText !== key) {
        // Check cache first
        const cached = await this.cache.get(key, targetLang);
        if (cached) {
          results[key] = cached;
        } else {
          textsToTranslate.push({ key, text: englishText });
        }
      }
    }

    // Batch translate uncached texts
    if (textsToTranslate.length > 0) {
      try {
        const texts = textsToTranslate.map(t => t.text);
        const translated = await firstValueFrom(
          this.googleTranslate.translateBatch(texts, targetLang, 'en')
        );

        // Cache results
        const toCache: Record<string, string> = {};
        textsToTranslate.forEach((item, index) => {
          const translatedText = translated[index];
          results[item.key] = translatedText;
          toCache[item.key] = translatedText;
        });

        await this.cache.setMany(toCache, targetLang);
        console.log(`[AIMissingHandler] Batch translated ${textsToTranslate.length} keys`);
      } catch (error) {
        console.error('[AIMissingHandler] Batch translation failed:', error);
        // Return original texts as fallback
        textsToTranslate.forEach(item => {
          results[item.key] = item.text;
        });
      }
    }

    return results;
  }

  /**
   * Check if a translation is pending
   */
  isPending(key: string, lang: string): boolean {
    return this.pendingTranslations.has(`${key}:${lang}`);
  }

  /**
   * Get count of pending translations
   */
  getPendingCount(): number {
    return this.pendingTranslations.size;
  }
}
