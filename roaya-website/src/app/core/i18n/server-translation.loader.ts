import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import en from '../../../assets/i18n/en.json';
import ar from '../../../assets/i18n/ar.json';

/**
 * Server Translation Loader
 *
 * The browser HybridTranslationLoader fetches translation JSON over HTTP
 * (relative URL) and merges IndexedDB-cached AI translations. Neither works
 * during SSR/prerender, so on the server we import the static JSON files
 * directly into the bundle and return them synchronously. This guarantees
 * translated content is present in the first HTTP response.
 */
export class ServerTranslationLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of((lang === 'ar' ? ar : en) as TranslationObject);
  }
}
