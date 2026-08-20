import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { config } from '../../config/environment.js';
import { logger } from '../../shared/utils/logger.js';
import { logSecurityEvent, SecurityEventType } from '../../shared/utils/security-logger.js';
import {
  LoginDTO,
  RegisterDTO,
  AuthTokens,
  JwtPayload
} from '../../shared/types/index.js';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  BadRequestError,
  AccountLockedError
} from '../../domain/exceptions/index.js';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = config.jwt.accessExpiry;
  private readonly REFRESH_TOKEN_EXPIRY = config.jwt.refreshExpiry;
  private readonly MAX_FAILED_ATTEMPTS = 10;
  private readonly LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  async register(data: RegisterDTO) {
    logger.info('Registering new user', { email: data.email });

    const existingUser = await prisma.adminUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    const user = await prisma.adminUser.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? UserRole.VIEWER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info('User registered successfully', { userId: user.id });
    return user;
  }

  async login(
    data: LoginDTO,
    context?: { ip?: string; userAgent?: string }
  ): Promise<{ user: { id: string; email: string; firstName: string; lastName: string; role: UserRole }; tokens: AuthTokens }> {
    const user = await prisma.adminUser.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Timing-safe dummy password check to prevent user enumeration
      await this.dummyPasswordCheck();
      // Log failed login attempt
      logSecurityEvent(SecurityEventType.AUTH_LOGIN_FAILED, {
        email: data.email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        reason: 'User not found',
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      // Log deactivated account login attempt
      logSecurityEvent(SecurityEventType.AUTH_LOGIN_FAILED, {
        userId: user.id,
        email: data.email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        reason: 'Account deactivated',
      });
      throw new UnauthorizedError('Account is deactivated');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      logger.warn('Login attempt on locked account', {
        userId: user.id,
        email: user.email,
        lockedUntil: user.lockedUntil,
      });
      logSecurityEvent(SecurityEventType.AUTH_LOGIN_FAILED, {
        userId: user.id,
        email: data.email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        reason: 'Account locked',
        lockedUntil: user.lockedUntil.toISOString(),
      });
      throw new AccountLockedError(user.lockedUntil);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, user.email, user.failedLoginAttempts, context);
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Update last login and reset failed attempts
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    // Log successful login
    logSecurityEvent(SecurityEventType.AUTH_LOGIN_SUCCESS, {
      userId: user.id,
      email: user.email,
      role: user.role,
      ip: context?.ip,
      userAgent: context?.userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  private async dummyPasswordCheck(): Promise<void> {
    // Timing-safe dummy password check to prevent user enumeration
    await bcrypt.compare('dummy-password', '$2a$12$dummyHashToPreventTimingAttacks12345678901234567890');
  }

  private async handleFailedLogin(
    userId: string,
    email: string,
    currentFailedAttempts: number,
    context?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const newFailedAttempts = currentFailedAttempts + 1;

    if (newFailedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION_MS);

      await prisma.adminUser.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: newFailedAttempts,
          lockedUntil,
        },
      });

      logger.warn('Account locked due to too many failed login attempts', {
        userId,
        email,
        failedAttempts: newFailedAttempts,
        lockedUntil,
      });

      logSecurityEvent(SecurityEventType.AUTH_LOGIN_FAILED, {
        userId,
        email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        reason: 'Account locked - too many failed attempts',
        failedAttempts: newFailedAttempts,
        lockedUntil: lockedUntil.toISOString(),
      });
    } else {
      await prisma.adminUser.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: newFailedAttempts,
        },
      });

      logger.warn('Failed login attempt', {
        userId,
        email,
        failedAttempts: newFailedAttempts,
        remainingAttempts: this.MAX_FAILED_ATTEMPTS - newFailedAttempts,
      });

      logSecurityEvent(SecurityEventType.AUTH_LOGIN_FAILED, {
        userId,
        email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        reason: 'Invalid password',
        failedAttempts: newFailedAttempts,
        remainingAttempts: this.MAX_FAILED_ATTEMPTS - newFailedAttempts,
      });
    }
  }

  async refreshTokens(
    refreshToken: string,
    context?: { ip?: string; userAgent?: string }
  ): Promise<AuthTokens> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      // CRITICAL: Token reuse detected - possible token theft
      logSecurityEvent(SecurityEventType.AUTH_TOKEN_REUSE_DETECTED, {
        userId: storedToken.userId,
        tokenFamily: storedToken.tokenFamily,
        ip: context?.ip,
        userAgent: context?.userAgent,
        reason: 'Revoked token reused',
      });

      // Revoke all tokens in the same family as a security measure
      await prisma.refreshToken.updateMany({
        where: {
          tokenFamily: storedToken.tokenFamily,
          revokedAt: null
        },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedError('Refresh token has been revoked');
    }

    // Check if token was already used (token reuse detection)
    if (storedToken.usedAt) {
      logger.error('SECURITY: Refresh token reuse detected - revoking entire token family', {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        tokenFamily: storedToken.tokenFamily,
        originalUsedAt: storedToken.usedAt,
      });

      logSecurityEvent(SecurityEventType.AUTH_TOKEN_REUSE_DETECTED, {
        userId: storedToken.userId,
        email: storedToken.user.email,
        tokenFamily: storedToken.tokenFamily,
        ip: context?.ip,
        userAgent: context?.userAgent,
        reason: 'Used token reused - possible token theft',
        originalUsedAt: storedToken.usedAt.toISOString(),
      });

      // Revoke all tokens in the same family (potential token theft)
      await prisma.refreshToken.updateMany({
        where: {
          tokenFamily: storedToken.tokenFamily,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Verify JWT
    try {
      jwt.verify(refreshToken, config.jwt.secret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Mark token as used immediately (before generating new tokens)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    });

    // Generate new tokens in the same token family
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
      storedToken.tokenFamily
    );

    logger.info('Tokens refreshed successfully', {
      userId: storedToken.user.id,
      tokenFamily: storedToken.tokenFamily,
    });

    // Log token refresh
    logSecurityEvent(SecurityEventType.AUTH_TOKEN_REFRESH, {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      tokenFamily: storedToken.tokenFamily,
      ip: context?.ip,
      userAgent: context?.userAgent,
    });

    return tokens;
  }

  async logout(
    userId: string,
    refreshToken?: string,
    context?: { ip?: string; userAgent?: string }
  ) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          token: refreshToken,
          revokedAt: null
        },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all refresh tokens for user
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    logger.info('User logged out', { userId });

    // Log logout
    logSecurityEvent(SecurityEventType.AUTH_LOGOUT, {
      userId,
      ip: context?.ip,
      userAgent: context?.userAgent,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    context?: { ip?: string; userAgent?: string }
  ) {
    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await prisma.adminUser.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info('Password changed', { userId });

    // Log password change
    logSecurityEvent(SecurityEventType.PASSWORD_CHANGED, {
      userId,
      email: user.email,
      ip: context?.ip,
      userAgent: context?.userAgent,
    });
  }

  async getUserById(userId: string) {
    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

      if (payload.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token has expired');
      }
      throw new UnauthorizedError('Invalid access token');
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
    tokenFamily?: string
  ): Promise<AuthTokens> {
    const accessPayload: JwtPayload = {
      userId,
      email,
      role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      userId,
      email,
      role,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessPayload, config.jwt.secret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY as any,
    });

    const refreshToken = jwt.sign(refreshPayload, config.jwt.secret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY as any,
    });

    // Calculate refresh token expiry
    const refreshExpiryMs = this.parseExpiryToMs(this.REFRESH_TOKEN_EXPIRY);
    const expiresAt = new Date(Date.now() + refreshExpiryMs);

    // Use existing token family or generate new one for first login
    const family = tokenFamily || uuidv4();

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
        tokenFamily: family,
      },
    });

    // Calculate access token expiry in seconds
    const expiresIn = Math.floor(this.parseExpiryToMs(this.ACCESS_TOKEN_EXPIRY) / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseExpiryToMs(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900000; // Default 15 minutes

    const value = parseInt(match[1]!, 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 900000;
    }
  }

  /**
   * Generate a short-lived token for WebSocket authentication
   * This token is valid for 5 minutes and can only be used for WebSocket connections
   */
  async generateWebSocketToken(userId: string): Promise<string> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Generate a short-lived JWT token (5 minutes) for WebSocket auth
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: '5m', // 5 minutes
    });

    logger.info('WebSocket token generated', {
      userId: user.id,
      expiresIn: '5m',
    });

    return token;
  }
}

export const authService = new AuthService();
