import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * SSR API Interceptor
 *
 * During server-side rendering, relative `/api/v1` URLs cannot be resolved:
 * they would resolve against the SSR server itself and be answered with the
 * app's own HTML.
 *
 * Two server-side behaviors, selected by the NG_SSR_API_ORIGIN runtime
 * environment variable (see docs/deploy/RUNTIME-ENV.md):
 *
 * 1. NG_SSR_API_ORIGIN set (the production SSR runtime, where the backend
 *    listens on the same host): GET requests to the backend API are rewritten
 *    to that absolute origin and forwarded, so server-rendered pages (blog
 *    listing/detail and other API-backed content) carry their real content in
 *    the first HTTP response — the raw HTML that crawlers and AI assistants
 *    read. Only GETs are forwarded: rendering must never replay mutations.
 *
 * 2. NG_SSR_API_ORIGIN unset (build-time prerendering, CI, local checks):
 *    backend API calls are short-circuited with an immediate network error so
 *    services fall back to their local/default data instantly, keeping
 *    prerendered output deterministic and independent of whatever database a
 *    build machine happens to have running.
 *
 * Browser behavior is unchanged in both cases.
 */
export const ssrApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId) && req.url.startsWith(environment.apiUrl)) {
    const ssrApiOrigin =
      typeof process !== 'undefined' ? process.env?.['NG_SSR_API_ORIGIN'] : undefined;

    if (ssrApiOrigin && req.method === 'GET') {
      // environment.apiUrl is origin-relative in production ('/api/v1');
      // prefix it with the backend origin so Node's fetch can resolve it.
      // A dev-mode absolute apiUrl (http://localhost:3001/api/v1) passes
      // through untouched — it is already absolute.
      const absoluteUrl = req.url.startsWith('/')
        ? `${ssrApiOrigin.replace(/\/$/, '')}${req.url}`
        : req.url;
      return next(req.clone({ url: absoluteUrl }));
    }

    return throwError(
      () =>
        new HttpErrorResponse({
          url: req.url,
          status: 0,
          statusText: 'Backend API is not called during server-side rendering',
        })
    );
  }

  return next(req);
};
