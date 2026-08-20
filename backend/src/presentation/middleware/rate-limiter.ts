import rateLimit from 'express-rate-limit';
import { config } from '../../config/environment.js';
import { RateLimitError } from '../../domain/exceptions/index.js';
import { Request, Response } from 'express';
import { logSecurityEvent, SecurityEventType, extractClientIp } from '../../shared/utils/security-logger.js';

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
