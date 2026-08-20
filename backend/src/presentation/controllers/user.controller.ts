import { Response, NextFunction } from 'express';
import { userService, CreateUserDTO, UpdateUserDTO } from '../../application/services/user.service.js';
import { AuthenticatedRequest, ApiResponse } from '../../shared/types/index.js';

export class UserController {
  /**
   * Get all users
   */
  async getUsers(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { role, isActive, search } = req.query;

      const users = await userService.getUsers({
        role: role as any,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        search: search as string,
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id!);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user
   */
  async createUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = req.body as CreateUserDTO;
      const createdById = req.user?.userId;

      const user = await userService.createUser(data, createdById);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async updateUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateUserDTO;
      const updatedById = req.user?.userId;

      const user = await userService.updateUser(id!, data, updatedById);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (deactivate)
   */
  async deleteUser(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const deletedById = req.user?.userId;

      await userService.deleteUser(id!, deletedById);

      res.json({
        success: true,
        data: { message: 'User deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const resetById = req.user?.userId;

      const result = await userService.resetPassword(id!, resetById);

      res.json({
        success: true,
        data: {
          message: 'Password reset successfully',
          tempPassword: result.tempPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { page, limit, action } = req.query;

      const { logs, meta } = await userService.getUserActivityLogs(id!, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        action: action as string,
      });

      res.json({
        success: true,
        data: logs,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
