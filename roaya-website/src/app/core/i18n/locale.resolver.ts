import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { DEFAULT_LOCALE, Locale } from './locale-routing';

/**
 * Applies the locale declared by the route's own `data.locale` before the
 * component renders, and blocks activation until that locale's translations
 * have loaded.
 *
 * Blocking matters on the server: the prerender/SSR pass serializes the
 * response as soon as the route activates, so a non-blocking language switch
 * would ship raw translation keys (or English) inside an Arabic URL. That
 * exact failure — raw keys reaching production HTML — is what this resolver
 * exists to make impossible.
 */
export const localeResolver: ResolveFn<Locale> = route => {
  const locale = (route.data['locale'] as Locale) ?? DEFAULT_LOCALE;
  return inject(LanguageService).activateLocale(locale);
};
