import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import { config } from '../../config/environment.js';
import { ForbiddenError } from '../../domain/exceptions/index.js';
import { logSecurityEvent, SecurityEventType, extractClientIp } from '../../shared/utils/security-logger.js';

// Routes that should be exempt from CSRF protection
// Login is safe from CSRF - you can't force someone to log into their own account
const CSRF_EXEMPT_ROUTES = [
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/leads/submit', // Public lead submission
  '/api/v1/website-analytics/tracking/', // Public tracking endpoints
];

// Base CSRF protection middleware using cookies
const baseCsrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: config.app.isProduction,
    sameSite: 'strict',
  },
});

// Wrapper that exempts certain routes
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if route is exempt
  const isExempt = CSRF_EXEMPT_ROUTES.some(route => req.path.startsWith(route));

  if (isExempt) {
    // Skip CSRF for exempt routes
    return next();
  }

  // Apply CSRF protection
  baseCsrfProtection(req, res, next);
};

// CSRF error handler
export const csrfErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err.code !== 'EBADCSRFTOKEN') {
    next(err);
    return;
  }

  // Log CSRF token mismatch (critical security event)
  logSecurityEvent(SecurityEventType.CSRF_TOKEN_MISMATCH, {
    endpoint: req.path,
    method: req.method,
    ip: extractClientIp(req),
    userAgent: req.headers['user-agent'],
  });

  // CSRF token validation failed
  res.status(403).json({
    success: false,
    error: {
      code: 'CSRF_TOKEN_INVALID',
      message: 'Invalid CSRF token',
    },
  });
};

// Attach CSRF token to response locals
export const attachCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.locals.csrfToken = req.csrfToken?.();
  next();
};
