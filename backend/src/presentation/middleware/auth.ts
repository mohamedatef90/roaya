import { Response, NextFunction } from 'express';
import { authService } from '../../application/services/auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../../domain/exceptions/index.js';
import { AuthenticatedRequest, UserRole } from '../../shared/types/index.js';
import { logger } from '../../shared/utils/logger.js';
import { logSecurityEvent, SecurityEventType, extractClientIp } from '../../shared/utils/security-logger.js';

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Try to get token from cookie first, then fallback to Authorization header
    let token = req.cookies?.access_token;

    if (!token) {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        // Log unauthorized access attempt
        logSecurityEvent(SecurityEventType.AUTH_UNAUTHORIZED_ACCESS, {
          resource: req.path,
          method: req.method,
          ip: extractClientIp(req),
          userAgent: req.headers['user-agent'],
          reason: 'No authorization token',
        });
        throw new UnauthorizedError('No authorization token provided');
      }

      const [type, headerToken] = authHeader.split(' ');

      if (type !== 'Bearer' || !headerToken) {
        // Log unauthorized access attempt
        logSecurityEvent(SecurityEventType.AUTH_UNAUTHORIZED_ACCESS, {
          resource: req.path,
          method: req.method,
          ip: extractClientIp(req),
          userAgent: req.headers['user-agent'],
          reason: 'Invalid authorization format',
        });
        throw new UnauthorizedError('Invalid authorization format');
      }

      token = headerToken;
    }

    try {
      const payload = authService.verifyAccessToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      next();
    } catch (tokenError) {
      // Check if it's an expired token error
      if (tokenError instanceof UnauthorizedError &&
          tokenError.message.includes('expired')) {
        logSecurityEvent(SecurityEventType.AUTH_SESSION_EXPIRED, {
          resource: req.path,
          method: req.method,
          ip: extractClientIp(req),
          userAgent: req.headers['user-agent'],
        });
      } else {
        logSecurityEvent(SecurityEventType.AUTH_UNAUTHORIZED_ACCESS, {
          resource: req.path,
          method: req.method,
          ip: extractClientIp(req),
          userAgent: req.headers['user-agent'],
          reason: 'Invalid token',
        });
      }
      throw tokenError;
    }
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Access denied', {
          userId: req.user.userId,
          role: req.user.role,
          requiredRoles: allowedRoles,
        });

        // Log permission denied
        logSecurityEvent(SecurityEventType.AUTH_PERMISSION_DENIED, {
          userId: req.user.userId,
          email: req.user.email,
          role: req.user.role,
          resource: req.path,
          method: req.method,
          requiredRoles: allowedRoles.join(', '),
          ip: extractClientIp(req),
          userAgent: req.headers['user-agent'],
        });

        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Convenience middleware for common role checks
export const requireSuperAdmin = authorize(UserRole.SUPER_ADMIN);
export const requireAdmin = authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN);
export const requireSalesManager = authorize(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.SALES_MANAGER
);
export const requireSalesRep = authorize(
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.SALES_MANAGER,
  UserRole.SALES_REP
);
