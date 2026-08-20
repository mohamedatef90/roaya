import { logger } from './logger.js';

export enum SecurityEventType {
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED',
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_TOKEN_REFRESH = 'AUTH_TOKEN_REFRESH',
  AUTH_TOKEN_REUSE_DETECTED = 'AUTH_TOKEN_REUSE_DETECTED',
  AUTH_UNAUTHORIZED_ACCESS = 'AUTH_UNAUTHORIZED_ACCESS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  CSRF_TOKEN_MISMATCH = 'CSRF_TOKEN_MISMATCH',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTH_PERMISSION_DENIED = 'AUTH_PERMISSION_DENIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
}

interface SecurityEventContext {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  role?: string;
  tokenFamily?: string;
  attemptCount?: number;
  reason?: string;
  endpoint?: string;
  method?: string;
  [key: string]: unknown;
}

/**
 * Extract the real client IP address from request headers
 * Considers X-Forwarded-For and X-Real-IP headers for proxied requests
 */
export function extractClientIp(req: any): string {
  // Check X-Forwarded-For header (can be a comma-separated list)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = typeof forwardedFor === 'string'
      ? forwardedFor.split(',').map((ip: string) => ip.trim())
      : forwardedFor;
    return ips[0] || req.ip || 'unknown';
  }

  // Check X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0] || req.ip || 'unknown';
  }

  // Fallback to req.ip
  return req.ip || 'unknown';
}

/**
 * Log security-related events for audit trail and threat detection
 * @param eventType - Type of security event
 * @param context - Additional context about the event
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  context: SecurityEventContext
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    ...context,
  };

  // Use warn level for critical security events
  const criticalEvents = [
    SecurityEventType.AUTH_TOKEN_REUSE_DETECTED,
    SecurityEventType.AUTH_ACCOUNT_LOCKED,
    SecurityEventType.AUTH_UNAUTHORIZED_ACCESS,
    SecurityEventType.CSRF_TOKEN_MISMATCH,
  ];

  if (criticalEvents.includes(eventType)) {
    logger.warn('SECURITY EVENT (CRITICAL)', logEntry);
  } else {
    logger.info('SECURITY EVENT', logEntry);
  }
}
