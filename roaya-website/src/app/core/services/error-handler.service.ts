import { Injectable, ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/**
 * Centralized Error Logging Service
 * Integrates with Sentry for production error tracking
 * Falls back to console logging when Sentry is not available
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorLoggingService {
  private sentry: any = null;
  private sentryInitialized = false;

  constructor() {
    this.initSentry();
  }

  private async initSentry(): Promise<void> {
    // Only initialize if DSN is configured
    if (!environment.sentryDsn) {
      console.log('[ErrorLogging] Sentry DSN not configured - using console logging');
      return;
    }

    try {
      // Dynamic import - only loads if @sentry/angular is installed
      const sentryModule = await import('@sentry/angular');

      sentryModule.init({
        dsn: environment.sentryDsn,
        environment: environment.production ? 'production' : 'development',
        tracesSampleRate: environment.production ? 0.1 : 1.0, // 10% in prod, 100% in dev
        replaysSessionSampleRate: 0, // Disable session replay by default
        replaysOnErrorSampleRate: environment.production ? 0.1 : 0, // 10% replay on errors in prod
        integrations: [
          sentryModule.browserTracingIntegration(),
        ],
        beforeSend(event: any) {
          // Strip PII before sending
          return stripPII(event);
        },
      });

      this.sentry = sentryModule;
      this.sentryInitialized = true;
      console.log('[ErrorLogging] Sentry initialized successfully');
    } catch (error) {
      // Sentry not installed - use console logging
      console.log('[ErrorLogging] Sentry not available - using console logging');
    }
  }

  /**
   * Capture an exception with optional context
   */
  captureError(error: Error, context?: Record<string, any>): void {
    const sanitizedError = this.stripPIIFromError(error);
    const sanitizedContext = context ? this.stripPIIFromObject(context) : undefined;

    if (this.sentryInitialized && this.sentry) {
      this.sentry.captureException(sanitizedError, {
        extra: sanitizedContext,
      });
    } else {
      console.error('[ErrorLogging]', sanitizedError.message, sanitizedContext);
    }
  }

  /**
   * Capture a message with severity level
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const sanitizedMessage = this.stripPIIFromString(message);

    if (this.sentryInitialized && this.sentry) {
      this.sentry.captureMessage(sanitizedMessage, level);
    } else {
      const logMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
      logMethod(`[ErrorLogging][${level}]`, sanitizedMessage);
    }
  }

  /**
   * Set user context for error tracking
   * WARNING: Only use non-PII identifiers (e.g., hashed user ID)
   */
  setUser(userId?: string): void {
    if (this.sentryInitialized && this.sentry && userId) {
      this.sentry.setUser({ id: userId });
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (this.sentryInitialized && this.sentry) {
      this.sentry.setUser(null);
    }
  }

  /**
   * Add breadcrumb for debugging context
   */
  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const sanitizedMessage = this.stripPIIFromString(message);

    if (this.sentryInitialized && this.sentry) {
      this.sentry.addBreadcrumb({
        message: sanitizedMessage,
        category,
        level,
      });
    }
  }

  /**
   * Strip PII from error object
   */
  private stripPIIFromError(error: Error): Error {
    const sanitizedMessage = this.stripPIIFromString(error.message);
    const sanitizedError = new Error(sanitizedMessage);
    sanitizedError.name = error.name;
    sanitizedError.stack = error.stack ? this.stripPIIFromString(error.stack) : undefined;
    return sanitizedError;
  }

  /**
   * Strip PII from object
   */
  private stripPIIFromObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.stripPIIFromString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.stripPIIFromObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Strip PII from string (emails, tokens, IPs, passwords)
   */
  private stripPIIFromString(str: string): string {
    let sanitized = str;

    // Strip emails (RFC 5322 compliant)
    sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');

    // Strip JWT tokens (format: xxx.xxx.xxx)
    sanitized = sanitized.replace(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g, '[TOKEN_REDACTED]');

    // Strip Bearer tokens
    sanitized = sanitized.replace(/Bearer\s+[\w.-]+/gi, 'Bearer [TOKEN_REDACTED]');

    // Strip IPv4 addresses
    sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');

    // Strip IPv6 addresses (simplified pattern)
    sanitized = sanitized.replace(/\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g, '[IP_REDACTED]');

    // Strip common password patterns in URLs or logs
    sanitized = sanitized.replace(/password[=:]\s*[^\s&]+/gi, 'password=[REDACTED]');

    // Strip API keys (common patterns)
    sanitized = sanitized.replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=[REDACTED]');

    // Strip access tokens
    sanitized = sanitized.replace(/access[_-]?token[=:]\s*[\w.-]+/gi, 'access_token=[REDACTED]');

    return sanitized;
  }
}

/**
 * Strip PII from Sentry event before sending
 */
function stripPII(event: any): any {
  // Strip from message
  if (event.message) {
    event.message = stripString(event.message);
  }

  // Strip from exception values
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map((ex: any) => {
      if (ex.value) ex.value = stripString(ex.value);
      if (ex.stacktrace?.frames) {
        ex.stacktrace.frames = ex.stacktrace.frames.map((frame: any) => {
          if (frame.filename) frame.filename = stripString(frame.filename);
          if (frame.abs_path) frame.abs_path = stripString(frame.abs_path);
          return frame;
        });
      }
      return ex;
    });
  }

  // Strip from breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((crumb: any) => {
      if (crumb.message) crumb.message = stripString(crumb.message);
      if (crumb.data) {
        for (const key in crumb.data) {
          if (typeof crumb.data[key] === 'string') {
            crumb.data[key] = stripString(crumb.data[key]);
          }
        }
      }
      return crumb;
    });
  }

  // Strip from request data
  if (event.request) {
    if (event.request.url) event.request.url = stripString(event.request.url);
    if (event.request.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers.Cookie;
    }
    if (event.request.data) {
      event.request.data = '[REDACTED]';
    }
  }

  return event;
}

function stripString(str: string): string {
  return str
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
    .replace(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g, '[TOKEN]')
    .replace(/Bearer\s+[\w.-]+/gi, 'Bearer [TOKEN]')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
    .replace(/password[=:]\s*[^\s&]+/gi, 'password=[REDACTED]')
    .replace(/api[_-]?key[=:]\s*[\w-]+/gi, 'api_key=[REDACTED]');
}

/**
 * Global Error Handler Service
 * Catches and handles all application errors
 * Now integrates with ErrorLoggingService for centralized error tracking
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private messageService = inject(MessageService);
  private router = inject(Router);
  private errorLogging = inject(ErrorLoggingService);

  handleError(error: Error | HttpErrorResponse): void {
    // Silently ignore AbortError (happens during page refresh/navigation)
    const errorAny = error as any;
    if (errorAny?.name === 'AbortError' ||
        errorAny?.message?.includes('aborted') ||
        errorAny?.rejection?.name === 'AbortError') {
      return;
    }

    // Log but don't show toast for NG01203 form control errors (will be fixed at source)
    if (errorAny?.message?.includes('NG01203')) {
      console.warn('Form control value accessor issue:', error);
      return;
    }

    // Log to Sentry (or console if not available)
    this.errorLogging.captureError(error, {
      component: 'GlobalErrorHandler',
      errorType: error instanceof HttpErrorResponse ? 'HttpError' : 'ClientError',
    });

    console.error('Global error handler:', error);

    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let errorMessage = 'An error occurred';
    let errorDetails = '';

    // Client-side or network error
    if (error.error instanceof ErrorEvent) {
      errorMessage = 'Network Error';
      errorDetails = error.error.message;
    } else {
      // Backend error
      switch (error.status) {
        case 0:
          errorMessage = 'No Internet Connection';
          errorDetails = 'Please check your network connection';
          break;
        case 400:
          errorMessage = 'Bad Request';
          errorDetails = this.extractErrorMessage(error);
          break;
        case 401:
          errorMessage = 'Unauthorized';
          errorDetails = 'Please log in again';
          // Only redirect to login if user is on an admin route
          if (this.router.url?.startsWith('/admin')) {
            this.router.navigate(['/admin/login']);
          }
          break;
        case 403:
          errorMessage = 'Forbidden';
          errorDetails = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Not Found';
          errorDetails = 'The requested resource was not found';
          break;
        case 500:
          errorMessage = 'Server Error';
          errorDetails = 'An internal server error occurred';
          break;
        case 503:
          errorMessage = 'Service Unavailable';
          errorDetails = 'The service is temporarily unavailable';
          break;
        default:
          errorMessage = `Error ${error.status}`;
          errorDetails = this.extractErrorMessage(error);
      }
    }

    // Only show error toasts on admin routes — public visitors shouldn't see backend errors
    if (this.router.url?.startsWith('/admin')) {
      this.messageService.add({
        severity: 'error',
        summary: errorMessage,
        detail: errorDetails,
        life: 5000,
      });
    }
  }

  private handleClientError(error: Error): void {
    const errorMessage = error.message || 'An unexpected error occurred';
    
    if (this.router.url?.startsWith('/admin')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Application Error',
        detail: errorMessage,
        life: 5000,
      });
    }
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string') {
      return error.error;
    }
    
    if (error.error?.error?.message) {
      return error.error.error.message;
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }
}

/**
 * Error Display Service
 * Helper service for displaying user-friendly error messages
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorDisplayService {
  constructor(private messageService: MessageService) {}

  showError(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'error',
      summary: message,
      detail: detail,
      life: 5000,
    });
  }

  showSuccess(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary: message,
      detail: detail,
      life: 3000,
    });
  }

  showWarning(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: message,
      detail: detail,
      life: 4000,
    });
  }

  showInfo(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'info',
      summary: message,
      detail: detail,
      life: 3000,
    });
  }

  /**
   * Show validation errors from API response
   */
  showValidationErrors(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach((message) => {
        this.showError(`${field}: ${message}`);
      });
    });
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messageService.clear();
  }
}
