import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
  effect
} from '@angular/core';
import { GoogleTranslateService } from '../../core/services/google-translate.service';
import { TranslationCacheService } from '../../core/services/translation-cache.service';
import { LanguageService } from '../../core/services/language.service';
import { firstValueFrom } from 'rxjs';

/**
 * Auto Translate Directive
 *
 * Automatically translates the text content of an element when the language changes.
 * Useful for dynamic content that isn't covered by ngx-translate.
 *
 * Usage:
 *   <p autoTranslate>This text will be translated</p>
 *   <p [autoTranslate]="'en'">Force source language</p>
 *   <p autoTranslate [translateFrom]="originalText">Translate from variable</p>
 *
 * Features:
 * - Reacts to language changes
 * - Caches translations in IndexedDB
 * - Preserves original text for reverse translation
 * - Shows loading state (optional)
 */
@Directive({
  selector: '[autoTranslate]',
  standalone: true
})
export class AutoTranslateDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly googleTranslate = inject(GoogleTranslateService);
  private readonly cache = inject(TranslationCacheService);
  private readonly languageService = inject(LanguageService);

  // Source language (default: 'en')
  @Input('autoTranslate') sourceLang: string = 'en';

  // Optional: Source text (if different from element content)
  @Input() translateFrom: string = '';

  // Optional: Show loading indicator
  @Input() showLoading: boolean = false;

  // Store original text
  private originalText: string = '';
  private isTranslating: boolean = false;

  constructor() {
    // React to language changes
    effect(() => {
      const currentLang = this.languageService.language();
      if (this.originalText) {
        this.translateContent(currentLang);
      }
    });
  }

  ngOnInit(): void {
    // Capture original text
    this.originalText = this.translateFrom || this.el.nativeElement.textContent?.trim() || '';

    // Initial translation
    const currentLang = this.languageService.getCurrentLanguage();
    if (currentLang !== this.getSourceLang()) {
      this.translateContent(currentLang);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Translate content to target language
   */
  private async translateContent(targetLang: string): Promise<void> {
    if (!this.originalText) {
      return;
    }

    const sourceLang = this.getSourceLang();

    // Skip if same language
    if (targetLang === sourceLang) {
      this.el.nativeElement.textContent = this.originalText;
      return;
    }

    // Skip if AI not available
    if (!this.googleTranslate.isAvailable()) {
      return;
    }

    // Prevent multiple simultaneous translations
    if (this.isTranslating) {
      return;
    }

    this.isTranslating = true;

    // Show loading state
    if (this.showLoading) {
      this.el.nativeElement.classList.add('translating');
    }

    try {
      // Check cache first
      const cacheKey = `directive:${this.hashText(this.originalText)}`;
      const cached = await this.cache.get(cacheKey, targetLang);

      if (cached) {
        this.el.nativeElement.textContent = cached;
        this.isTranslating = false;
        if (this.showLoading) {
          this.el.nativeElement.classList.remove('translating');
        }
        return;
      }

      // Translate
      const translated = await firstValueFrom(
        this.googleTranslate.translate(this.originalText, targetLang, sourceLang)
      );

      // Update content
      this.el.nativeElement.textContent = translated;

      // Cache result
      await this.cache.set(cacheKey, targetLang, translated);

    } catch (error) {
      console.error('[AutoTranslate] Translation failed:', error);
      // Keep original text on error
    } finally {
      this.isTranslating = false;
      if (this.showLoading) {
        this.el.nativeElement.classList.remove('translating');
      }
    }
  }

  /**
   * Get source language
   */
  private getSourceLang(): string {
    // Handle empty string or 'true' from attribute binding
    if (!this.sourceLang || this.sourceLang === 'true' || this.sourceLang === '') {
      return 'en';
    }
    return this.sourceLang;
  }

  /**
   * Simple hash function for cache keys
   */
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

/**
 * Translate Placeholder Directive
 *
 * Translates placeholder attribute of input/textarea elements.
 *
 * Usage:
 *   <input translatePlaceholder placeholder="Enter your name">
 */
@Directive({
  selector: '[translatePlaceholder]',
  standalone: true
})
export class TranslatePlaceholderDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly googleTranslate = inject(GoogleTranslateService);
  private readonly cache = inject(TranslationCacheService);
  private readonly languageService = inject(LanguageService);

  @Input() translatePlaceholder: string = 'en';

  private originalPlaceholder: string = '';

  constructor() {
    effect(() => {
      const currentLang = this.languageService.language();
      if (this.originalPlaceholder) {
        this.translatePlaceholderText(currentLang);
      }
    });
  }

  ngOnInit(): void {
    this.originalPlaceholder = this.el.nativeElement.getAttribute('placeholder') || '';

    const currentLang = this.languageService.getCurrentLanguage();
    if (currentLang !== this.getSourceLang()) {
      this.translatePlaceholderText(currentLang);
    }
  }

  ngOnDestroy(): void {}

  private async translatePlaceholderText(targetLang: string): Promise<void> {
    if (!this.originalPlaceholder) return;

    const sourceLang = this.getSourceLang();
    if (targetLang === sourceLang) {
      this.el.nativeElement.setAttribute('placeholder', this.originalPlaceholder);
      return;
    }

    if (!this.googleTranslate.isAvailable()) return;

    try {
      const cacheKey = `placeholder:${this.hashText(this.originalPlaceholder)}`;
      const cached = await this.cache.get(cacheKey, targetLang);

      if (cached) {
        this.el.nativeElement.setAttribute('placeholder', cached);
        return;
      }

      const translated = await firstValueFrom(
        this.googleTranslate.translate(this.originalPlaceholder, targetLang, sourceLang)
      );

      this.el.nativeElement.setAttribute('placeholder', translated);
      await this.cache.set(cacheKey, targetLang, translated);
    } catch (error) {
      console.error('[TranslatePlaceholder] Translation failed:', error);
    }
  }

  private getSourceLang(): string {
    if (!this.translatePlaceholder || this.translatePlaceholder === 'true') {
      return 'en';
    }
    return this.translatePlaceholder;
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
