import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { tap, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Loading Interceptor (Functional)
 * DISABLED - The loading is now managed by the main layout component
 * to avoid conflicts between HTTP-triggered loading and content loading
 *
 * Keep this interceptor empty to avoid loading state conflicts
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Simply pass through - loading is managed by MainLayoutComponent
  return next(req);
};
