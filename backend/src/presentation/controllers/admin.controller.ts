import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database.js';
import { AuthenticatedRequest, ApiResponse } from '../../shared/types/index.js';
import { NotFoundError } from '../../domain/exceptions/index.js';
import { authService } from '../../application/services/auth.service.js';
import { UpdateUserInput } from '../validators/auth.validators.js';

export class AdminController {
  // Get all admin users
  async getUsers(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await prisma.adminUser.findMany({
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
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id!);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  async updateUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateUserInput;

      const user = await prisma.adminUser.update({
        where: { id },
        data,
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

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async deleteUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user?.userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SELF_DELETION',
            message: 'Cannot delete your own account',
          },
        });
        return;
      }

      await prisma.adminUser.delete({ where: { id } });

      res.json({
        success: true,
        data: { message: 'User deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all tags
  async getTags(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: { leads: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: tags.map((tag) => ({
          ...tag,
          leadCount: tag._count.leads,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  // Create tag
  async createTag(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, color } = req.body;

      const tag = await prisma.tag.create({
        data: { name, color },
      });

      res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete tag
  async deleteTag(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.tag.delete({ where: { id } });

      res.json({
        success: true,
        data: { message: 'Tag deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get system settings
  async getSettings(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await prisma.systemSetting.findMany();

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, unknown>);

      res.json({
        success: true,
        data: settingsMap,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update system setting
  async updateSetting(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { key } = req.params;
      const { value } = req.body;

      const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key: key!, value },
      });

      res.json({
        success: true,
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
