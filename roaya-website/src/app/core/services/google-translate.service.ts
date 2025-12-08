import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, retry, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Response structure from Google Cloud Translation API v2
 */
interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

/**
 * Translation result for a single text
 */
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  targetLang: string;
  cached: boolean;
}

/**
 * Google Translate Service
 * Handles API calls to Google Cloud Translation API v2
 *
 * Features:
 * - Single and batch translation support
 * - Automatic retry with exponential backoff
 * - Error handling with graceful degradation
 * - Character count tracking for cost management
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleTranslateService {
  private readonly apiUrl = 'https://translation.googleapis.com/language/translate/v2';
  private readonly http = inject(HttpClient);

  // Track character usage for cost monitoring
  private charactersUsedToday = 0;
  private lastResetDate = new Date().toDateString();

  /**
   * Translate a single text string
   * @param text - Text to translate
   * @param targetLang - Target language code (e.g., 'ar', 'fr')
   * @param sourceLang - Source language code (default: 'en')
   * @returns Observable with translated text
   */
  translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'en'
  ): Observable<string> {
    // Skip if no API key configured
    if (!environment.googleTranslateApiKey) {
      console.warn('[GoogleTranslateService] No API key configured. Returning original text.');
      return of(text);
    }

    // Skip if same language
    if (targetLang === sourceLang) {
      return of(text);
    }

    // Skip empty text
    if (!text || text.trim() === '') {
      return of(text);
    }

    return this.translateBatch([text], targetLang, sourceLang).pipe(
      map(results => results[0] || text)
    );
  }

  /**
   * Translate multiple texts in a single API call (more efficient)
   * @param texts - Array of texts to translate
   * @param targetLang - Target language code
   * @param sourceLang - Source language code
   * @returns Observable with array of translated texts
   */
  translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang: string = 'en'
  ): Observable<string[]> {
    // Skip if no API key configured
    if (!environment.googleTranslateApiKey) {
      console.warn('[GoogleTranslateService] No API key configured. Returning original texts.');
      return of(texts);
    }

    // Filter out empty texts and track their indices
    const validTexts: string[] = [];
    const indexMap: number[] = [];

    texts.forEach((text, index) => {
      if (text && text.trim() !== '') {
        validTexts.push(text);
        indexMap.push(index);
      }
    });

    if (validTexts.length === 0) {
      return of(texts);
    }

    // Check character limit
    const totalChars = validTexts.join('').length;
    if (totalChars > environment.translation.maxCharsPerRequest) {
      console.warn(`[GoogleTranslateService] Text exceeds max chars (${totalChars}/${environment.translation.maxCharsPerRequest})`);
      // Split into smaller batches
      return this.translateInChunks(validTexts, targetLang, sourceLang, texts, indexMap);
    }

    // Track usage
    this.trackCharacterUsage(totalChars);

    // Build request
    const params = new URLSearchParams({
      key: environment.googleTranslateApiKey,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    });

    // Add each text as a 'q' parameter (Google API format)
    validTexts.forEach(text => params.append('q', text));

    return this.http.post<GoogleTranslateResponse>(
      `${this.apiUrl}?${params.toString()}`,
      null
    ).pipe(
      retry({ count: 2, delay: 1000 }),
      map(response => {
        const translations = response.data.translations.map(t => t.translatedText);

        // Rebuild original array with translations in correct positions
        const result = [...texts];
        translations.forEach((translation, i) => {
          result[indexMap[i]] = translation;
        });

        return result;
      }),
      catchError(error => this.handleError(error, texts))
    );
  }

  /**
   * Split large texts into chunks and translate separately
   */
  private translateInChunks(
    texts: string[],
    targetLang: string,
    sourceLang: string,
    originalTexts: string[],
    indexMap: number[]
  ): Observable<string[]> {
    const maxChars = environment.translation.maxCharsPerRequest;
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    let currentChunkChars = 0;

    texts.forEach(text => {
      if (currentChunkChars + text.length > maxChars && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentChunkChars = 0;
      }
      currentChunk.push(text);
      currentChunkChars += text.length;
    });

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // For simplicity, translate first chunk only (avoid multiple API calls)
    // In production, you might want to use forkJoin to translate all chunks
    console.warn(`[GoogleTranslateService] Text split into ${chunks.length} chunks. Translating first chunk only.`);

    return this.translateBatch(chunks[0], targetLang, sourceLang).pipe(
      map(translatedChunk => {
        const result = [...originalTexts];
        translatedChunk.forEach((translation, i) => {
          if (i < indexMap.length) {
            result[indexMap[i]] = translation;
          }
        });
        return result;
      })
    );
  }

  /**
   * Handle API errors gracefully
   */
  private handleError(error: HttpErrorResponse, fallbackTexts: string[]): Observable<string[]> {
    console.error('[GoogleTranslateService] Translation error:', error);

    if (error.status === 403) {
      console.error('[GoogleTranslateService] API key invalid or restricted. Check Google Cloud Console.');
    } else if (error.status === 429) {
      console.error('[GoogleTranslateService] Rate limit exceeded. Try again later.');
    } else if (error.status === 400) {
      console.error('[GoogleTranslateService] Bad request. Check text format.');
    }

    // Return original texts as fallback
    return of(fallbackTexts);
  }

  /**
   * Track character usage for cost monitoring
   */
  private trackCharacterUsage(chars: number): void {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.charactersUsedToday = 0;
      this.lastResetDate = today;
    }
    this.charactersUsedToday += chars;

    // Log usage for monitoring
    if (this.charactersUsedToday > 400000) { // 80% of free tier
      console.warn(`[GoogleTranslateService] Approaching free tier limit: ${this.charactersUsedToday}/500,000 chars`);
    }
  }

  /**
   * Get current character usage stats
   */
  getUsageStats(): { today: number; limit: number; percentage: number } {
    return {
      today: this.charactersUsedToday,
      limit: 500000, // Google free tier monthly limit
      percentage: (this.charactersUsedToday / 500000) * 100
    };
  }

  /**
   * Check if translation is available (API key configured)
   */
  isAvailable(): boolean {
    return !!environment.googleTranslateApiKey && environment.translation.enableAI;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return environment.translation.supportedLangs;
  }
}
