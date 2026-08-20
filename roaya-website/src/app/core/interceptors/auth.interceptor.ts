import { inject, Injector } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, switchMap, filter, take, mergeMap } from 'rxjs/operators';
import { CsrfService } from '../services/csrf.service';
import { environment } from '../../../environments/environment';

// Lazy-loaded AuthService reference to avoid circular dependency
let authServicePromise: Promise<any> | null = null;

function getAuthService(injector: Injector): Promise<any> {
  if (!authServicePromise) {
    authServicePromise = import('../services/auth.service').then(m => injector.get(m.AuthService));
  }
  return authServicePromise;
}

/**
 * Flag to prevent multiple simultaneous refresh token requests
 */
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<boolean>(false);

/**
 * HTTP methods that require CSRF protection
 */
const CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Auth Interceptor (Functional)
 * - Adds credentials (cookies) to all API requests
 * - Adds CSRF token to state-changing requests
 * - Handles 401 errors by refreshing the session
 *
 * Note: We use lazy injection for AuthService to avoid circular dependency
 * (AuthService uses HttpClient which uses this interceptor)
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const injector = inject(Injector);
  const csrfService = inject(CsrfService);

  // Skip interceptor for non-API requests
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Check if this is an auth endpoint that shouldn't trigger refresh
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/csrf-token');

  // Tracking endpoints are public – skip auth handling entirely
  const isTrackingEndpoint = req.url.includes('/website-analytics/tracking/');
  if (isTrackingEndpoint) {
    return next(req);
  }

  // Build headers object
  const headers: { [key: string]: string } = {};

  // Add CSRF token for state-changing requests
  if (CSRF_METHODS.includes(req.method)) {
    const csrfToken = csrfService.getToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  // Clone request with credentials and headers
  let authReq = req.clone({
    withCredentials: true, // Send cookies with request
    setHeaders: headers,
  });

  // Handle the request and catch 401 errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Silently ignore AbortError (happens during page refresh/navigation)
      const errorAny = error as any;
      if (errorAny?.name === 'AbortError' || errorAny?.message?.includes('aborted')) {
        return throwError(() => error);
      }
      if (error.status === 401 && !isAuthEndpoint) {
        return handle401Error(authReq, next, injector, csrfService);
      }
      // Handle CSRF token errors (403 with specific message)
      if (error.status === 403 && (error.error?.error?.code === 'CSRF_TOKEN_INVALID' || error.error?.error?.code === 'CSRF_ERROR')) {
        return handleCsrfError(authReq, next, csrfService);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Handle 401 Unauthorized errors by refreshing the session
 * Uses lazy injection for AuthService to avoid circular dependency
 */
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  injector: Injector,
  csrfService: CsrfService
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(false);

    // Lazy load AuthService to avoid circular dependency
    return from(getAuthService(injector)).pipe(
      mergeMap((authService) =>
        (authService.refreshToken() as Observable<any>).pipe(
          switchMap((): Observable<HttpEvent<any>> => {
            isRefreshing = false;
            refreshTokenSubject.next(true);

            // Refresh CSRF token after session refresh
            csrfService.refreshToken().subscribe();

            // Retry the original request (cookies are automatically included)
            return next(request.clone({ withCredentials: true }));
          }),
          catchError((error): Observable<HttpEvent<any>> => {
            isRefreshing = false;
            // If refresh fails, logout user
            authService.logout().subscribe();
            return throwError(() => error);
          })
        )
      )
    ) as Observable<HttpEvent<any>>;
  } else {
    // Wait for refresh to complete and retry request
    return refreshTokenSubject.pipe(
      filter((refreshed) => refreshed === true),
      take(1),
      switchMap(() => next(request.clone({ withCredentials: true })))
    );
  }
}

/**
 * Handle CSRF token errors by refreshing the token and retrying
 */
function handleCsrfError(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  csrfService: CsrfService
): Observable<HttpEvent<any>> {
  return csrfService.refreshToken().pipe(
    switchMap((newToken) => {
      if (newToken) {
        // Retry request with new CSRF token
        const retryReq = request.clone({
          withCredentials: true,
          setHeaders: {
            'X-CSRF-Token': newToken,
          },
        });
        return next(retryReq);
      }
      return throwError(() => new Error('Failed to refresh CSRF token'));
    })
  );
}
