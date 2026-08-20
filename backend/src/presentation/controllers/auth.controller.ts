import { Request, Response, NextFunction } from 'express';
import { authService } from '../../application/services/auth.service.js';
import { AuthenticatedRequest, ApiResponse } from '../../shared/types/index.js';
import { config } from '../../config/environment.js';
import { extractClientIp } from '../../shared/utils/security-logger.js';
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from '../validators/auth.validators.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.app.isProduction, // true in production, false in development
  sameSite: 'strict' as const,
  path: '/',
};

export class AuthController {
  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body, {
        ip: extractClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      // Set tokens as httpOnly cookies
      res.cookie('access_token', tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: tokens.expiresIn * 1000, // 15 minutes
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          user,
          expiresIn: tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body as RegisterInput;
      const user = await authService.register(data);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies.refresh_token || req.body.refreshToken;

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const tokens = await authService.refreshTokens(refreshToken, {
        ip: extractClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      // Update cookies with new tokens
      res.cookie('access_token', tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: tokens.expiresIn * 1000, // 15 minutes
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          expiresIn: tokens.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const refreshToken = req.cookies.refresh_token || req.body.refreshToken;

      await authService.logout(userId, refreshToken, {
        ip: extractClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      // Clear cookies
      res.clearCookie('access_token', COOKIE_OPTIONS);
      res.clearCookie('refresh_token', COOKIE_OPTIONS);

      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body as ChangePasswordInput;

      await authService.changePassword(userId, currentPassword, newPassword, {
        ip: extractClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        data: { message: 'Password changed successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getUserById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCsrfToken(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      // CSRF token is attached by middleware
      const csrfToken = res.locals.csrfToken;

      res.json({
        success: true,
        data: { csrfToken },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/ws-token
   * Generate a temporary token for WebSocket authentication
   * This token is short-lived (5 minutes) and can only be used for WebSocket connections
   */
  async getWebSocketToken(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;

      // Generate a short-lived WebSocket token (5 minutes)
      const wsToken = await authService.generateWebSocketToken(userId);

      res.json({
        success: true,
        data: { token: wsToken },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
