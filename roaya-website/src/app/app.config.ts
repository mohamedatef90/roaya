import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpClient } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ssrApiInterceptor } from './core/interceptors/ssr-api.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { importProvidersFrom } from '@angular/core';
import { provideNgIconsConfig } from '@ng-icons/core';
import { MessageService } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { HybridTranslationLoaderFactory } from './core/i18n/hybrid-translation.loader';
import { AIMissingTranslationHandler } from './core/i18n/ai-missing-translation.handler';
import { TranslationCacheService } from './core/services/translation-cache.service';
import { GlobalErrorHandler } from './core/services/error-handler.service';

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

    // HTTP client with fetch API and interceptors
    provideHttpClient(
      withFetch(), 
      withInterceptors([ssrApiInterceptor, authInterceptor, loadingInterceptor])
    ),

    // Client-side hydration for SSR with event replay
    provideClientHydration(withEventReplay()),

    // Browser animations (required for PrimeNG)
    provideAnimations(),

    // Global error handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },

    // PrimeNG message service for toasts
    MessageService,

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
