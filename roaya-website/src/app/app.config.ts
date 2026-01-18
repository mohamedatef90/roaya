import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, HttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { importProvidersFrom } from '@angular/core';
import { provideNgIconsConfig } from '@ng-icons/core';

import { routes } from './app.routes';
import { HybridTranslationLoaderFactory } from './core/i18n/hybrid-translation.loader';
import { AIMissingTranslationHandler } from './core/i18n/ai-missing-translation.handler';
import { TranslationCacheService } from './core/services/translation-cache.service';

/**
 * Application Configuration
 * Roaya IT - Angular 21 Standalone App
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone.js change detection with event coalescing for better performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router with component input binding and scroll restoration
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),

    // HTTP client with fetch API
    provideHttpClient(withFetch()),

    // Client-side hydration for SSR (if needed in future)
    provideClientHydration(),

    // ngx-translate for i18n with AI translation support
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HybridTranslationLoaderFactory,
          deps: [HttpClient, TranslationCacheService]
        },
        missingTranslationHandler: {
          provide: MissingTranslationHandler,
          useClass: AIMissingTranslationHandler
        }
      })
    ),

    // ng-icons configuration
    provideNgIconsConfig({
      size: '1.5rem',
    })
  ]
};
