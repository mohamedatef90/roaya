import rateLimit from 'express-rate-limit';
import { config } from '../../config/environment.js';
import { RateLimitError } from '../../domain/exceptions/index.js';
import { Request, Response } from 'express';
import { logSecurityEvent, SecurityEventType, extractClientIp } from '../../shared/utils/security-logger.js';

/**
 * True for loopback addresses in every form Node reports them:
 * 127.0.0.0/8, ::1, and IPv4-mapped IPv6 (::ffff:127.x.x.x or ::ffff:7fxx:xxxx).
 * Tolerates an IPv6 zone id suffix ("::1%lo0") and surrounding brackets.
 */
export function isLoopbackIp(ip: string | undefined | null): boolean {
  if (!ip) {
    return false;
  }

  let addr = ip.trim().toLowerCase();

  const zone = addr.indexOf('%');
  if (zone !== -1) {
    addr = addr.slice(0, zone);
  }
  if (addr.startsWith('[') && addr.endsWith(']')) {
    addr = addr.slice(1, -1);
  }

  if (addr === '::1') {
    return true;
  }

  if (addr.startsWith('::ffff:')) {
    const mapped = addr.slice('::ffff:'.length);
    // Hex form of an IPv4-mapped 127.x.x.x, e.g. ::ffff:7f00:1
    if (/^7f[0-9a-f]{2}:[0-9a-f]{1,4}$/.test(mapped)) {
      return true;
    }
    addr = mapped;
  }

  return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(addr);
}

const READ_ONLY_METHODS = new Set(['GET', 'HEAD']);

/**
 * Skip predicate for apiRateLimiter: exempt read-only requests that originate
 * on this host.
 *
 * Why (2026-09-02 AI-readiness reconciliation): the Angular SSR process runs
 * on the same host and calls this API over loopback for every server-side
 * render (blog listing/detail, related posts, sitemap.xml, rss.xml) WITHOUT an
 * X-Forwarded-For header, so req.ip is 127.0.0.1/::1 for all visitors and
 * crawlers combined. Those renders shared a single rate-limit bucket, and after
 * ~50 renders per window every blog article rendered as a 503 "Post Not Found".
 * Public browser traffic reaches the API through nginx, which sets
 * X-Forwarded-For ($proxy_add_x_forwarded_for on `location ^~ /api/`); with
 * app.set('trust proxy', 1) req.ip is then the real client IP and stays limited.
 *
 * Guards:
 *  - GET/HEAD only: loopback POST/PUT/PATCH/DELETE remain limited.
 *  - req.ip (client after trust-proxy resolution) must be loopback.
 *  - The TCP peer (req.socket.remoteAddress) must also be loopback, so a
 *    remote client that reaches the port directly with a spoofed
 *    "X-Forwarded-For: 127.0.0.1" is not exempted.
 *
 * The form and login limiters do not use this predicate.
 */
export function isTrustedLoopbackRead(req: Request): boolean {
  if (!READ_ONLY_METHODS.has(req.method)) {
    return false;
  }

  if (!isLoopbackIp(req.ip)) {
    return false;
  }

  const peer = req.socket?.remoteAddress;
  if (peer !== undefined && !isLoopbackIp(peer)) {
    return false;
  }

  return true;
}

// Standard API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.maxRequests, // 100 requests per window
  message: { 
    success: false, 
    error: { 
      code: 'RATE_LIMIT_EXCEEDED', 
      message: 'Too many requests, please try again later' 
    } 
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Same-host SSR renders are neither counted nor limited (see isTrustedLoopbackRead).
  skip: isTrustedLoopbackRead,
  handler: (req: Request, res: Response) => {
    // Log rate limit exceeded
    logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
      endpoint: req.path,
      method: req.method,
      ip: extractClientIp(req),
      userAgent: req.headers['user-agent'],
      limitType: 'API',
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    });
  },
});

// Stricter rate limit for form submissions
export const formRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.formMaxRequests, // 5 form submissions per window
  message: {
    success: false,
    error: {
      code: 'FORM_RATE_LIMIT_EXCEEDED',
      message: 'Too many form submissions, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP + email if available for more accurate limiting
    const email = req.body?.email;
    return email ? `${req.ip}-${email}` : req.ip ?? 'unknown';
  },
  handler: (req: Request, res: Response) => {
    // Log form rate limit exceeded
    logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
      endpoint: req.path,
      method: req.method,
      ip: extractClientIp(req),
      userAgent: req.headers['user-agent'],
      limitType: 'FORM',
      email: req.body?.email,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'FORM_RATE_LIMIT_EXCEEDED',
        message: 'Too many form submissions, please try again later',
      },
    });
  },
});

// Login rate limiter
export const loginRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.loginMaxRequests, // 5 login attempts per window
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = req.body?.email;
    return email ? `login-${email}` : `login-${req.ip}`;
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req: Request, res: Response) => {
    // Log login rate limit exceeded
    logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
      endpoint: req.path,
      method: req.method,
      ip: extractClientIp(req),
      userAgent: req.headers['user-agent'],
      limitType: 'LOGIN',
      email: req.body?.email,
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'LOGIN_RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts, please try again later',
      },
    });
  },
});
