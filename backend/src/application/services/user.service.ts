import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { NotFoundError, ConflictError, ValidationError } from '../../domain/exceptions/index.js';
import { UserRole, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserActivityLogDTO {
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class UserService {
  private readonly SALT_ROUNDS = 12;

  /**
   * Get all users with optional filters
   */
  async getUsers(options?: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
  }) {
    const where: Prisma.AdminUserWhereInput = {};

    if (options?.role) {
      where.role = options.role;
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options?.search) {
      where.OR = [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.adminUser.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedLeads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      ...user,
      assignedLeadsCount: user._count.assignedLeads,
    }));
  }

  /**
   * Get user by ID with activity logs
   */
  async getUserById(id: string) {
    const user = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedLeads: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return {
      ...user,
      assignedLeadsCount: user._count.assignedLeads,
    };
  }

  /**
   * Create a new user (SUPER_ADMIN only)
   */
  async createUser(data: CreateUserDTO, createdById?: string) {
    // Check if email already exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Validate password strength
    if (data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await prisma.adminUser.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log activity
    if (createdById) {
      await this.logActivity({
        userId: createdById,
        action: 'USER_CREATED',
        details: { createdUserId: user.id, email: user.email },
      });
    }

    logger.info('User created', { userId: user.id, email: user.email });
    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDTO, updatedById?: string) {
    const existingUser = await this.getUserById(id);

    // Check if email is being changed and if it's already taken
    if (data.email && data.email.toLowerCase() !== existingUser.email) {
      const emailTaken = await prisma.adminUser.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (emailTaken) {
        throw new ConflictError('Email is already taken by another user');
      }
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activity
    if (updatedById) {
      await this.logActivity({
        userId: updatedById,
        action: 'USER_UPDATED',
        details: { updatedUserId: user.id, changes: data },
      });
    }

    logger.info('User updated', { userId: id });
    return user;
  }

  /**
   * Reset user password
   */
  async resetPassword(id: string, resetById?: string) {
    await this.getUserById(id);

    // Generate temporary password that meets complexity requirements
    const tempPassword = this.generateStrongPassword();
    const passwordHash = await bcrypt.hash(tempPassword, this.SALT_ROUNDS);

    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });

    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Log activity
    if (resetById) {
      await this.logActivity({
        userId: resetById,
        action: 'PASSWORD_RESET',
        details: { targetUserId: id },
      });
    }

    logger.info('User password reset', { userId: id });
    return { tempPassword };
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(id: string, deletedById?: string) {
    const user = await this.getUserById(id);

    // Prevent deleting yourself
    if (id === deletedById) {
      throw new ValidationError('Cannot delete your own account');
    }

    // Deactivate instead of hard delete
    await prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Log activity
    if (deletedById) {
      await this.logActivity({
        userId: deletedById,
        action: 'USER_DELETED',
        details: { deletedUserId: id, email: user.email },
      });
    }

    logger.info('User deleted', { userId: id });
  }

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(
    userId: string,
    options?: { page?: number; limit?: number; action?: string }
  ) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserActivityLogWhereInput = { userId };

    if (options?.action) {
      where.action = options.action;
    }

    const [logs, total] = await Promise.all([
      prisma.userActivityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userActivityLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Generate a strong password meeting all complexity requirements
   */
  private generateStrongPassword(length = 16): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const specials = '@$!%*?&#^_+-=';
    const all = upper + lower + digits + specials;

    const chars: string[] = [
      upper.charAt(crypto.randomInt(upper.length)),
      lower.charAt(crypto.randomInt(lower.length)),
      digits.charAt(crypto.randomInt(digits.length)),
      specials.charAt(crypto.randomInt(specials.length)),
    ];

    for (let i = 4; i < length; i++) {
      chars.push(all.charAt(crypto.randomInt(all.length)));
    }

    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);
      const temp = chars[i]!;
      chars[i] = chars[j]!;
      chars[j] = temp;
    }

    return chars.join('');
  }

  /**
   * Log user activity
   */
  async logActivity(data: UserActivityLogDTO) {
    await prisma.userActivityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        details: data.details as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }
}

export const userService = new UserService();
