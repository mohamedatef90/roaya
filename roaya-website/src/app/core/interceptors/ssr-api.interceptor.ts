import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * SSR API Interceptor
 *
 * During server-side rendering / prerendering the backend API is not
 * reachable (relative `/api/v1` URLs would resolve against the SSR server
 * itself and be answered with the app's own HTML). This interceptor
 * short-circuits backend API calls on the server with an immediate network
 * error so services fall back to their local/default data instantly instead
 * of stalling application stability or recursively rendering routes.
 *
 * Browser behavior is unchanged.
 */
export const ssrApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId) && req.url.startsWith(environment.apiUrl)) {
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
