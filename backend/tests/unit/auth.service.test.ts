import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// Mock dependencies
vi.mock('../../src/config/database.js', () => ({
  prisma: {
    adminUser: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('../../src/config/environment.js', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key-that-is-at-least-32-chars',
      accessExpiry: '15m',
      refreshExpiry: '7d',
    },
  },
}));

vi.mock('../../src/shared/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);
      vi.mocked(prisma.adminUser.create).mockResolvedValue({
        id: mockUser.id,
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.VIEWER,
        createdAt: new Date(),
      } as any);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
      expect(prisma.adminUser.create).toHaveBeenCalledTimes(1);
      expect(result.email).toBe('newuser@example.com');
    });

    it('should throw ConflictError if user already exists', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockUser as any);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      await expect(
        authService.register({
          email: mockUser.email,
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue('mock_token' as never);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);
      vi.mocked(prisma.adminUser.update).mockResolvedValue(mockUser as any);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      const result = await authService.login({
        email: mockUser.email,
        password: 'password',
      });

      expect(result.user.email).toBe(mockUser.email);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedError for invalid email', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(null);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      await expect(
        authService.login({
          email: mockUser.email,
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedError for deactivated account', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.adminUser.findUnique).mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as any);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      await expect(
        authService.login({
          email: mockUser.email,
          password: 'password',
        })
      ).rejects.toThrow('deactivated');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      vi.mocked(jwt.verify).mockReturnValue({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access',
      } as never);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      const payload = authService.verifyAccessToken('valid_token');

      expect(payload.userId).toBe(mockUser.id);
      expect(payload.type).toBe('access');
    });

    it('should throw UnauthorizedError for invalid token', async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('invalid token');
      });

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      expect(() => authService.verifyAccessToken('invalid_token')).toThrow('Invalid access token');
    });
  });

  describe('logout', () => {
    it('should revoke refresh tokens on logout', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 1 } as any);

      const { authService } = await import('../../src/application/services/auth.service.js');
      
      await authService.logout(mockUser.id);

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
