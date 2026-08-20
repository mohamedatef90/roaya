import { Request, Response, NextFunction } from 'express';
import { documentationService } from '../../application/services/documentation.service.js';
import { AuthenticatedRequest, ApiResponse } from '../../shared/types/index.js';

export class DocumentationController {
  // ============================================
  // CATEGORY ENDPOINTS
  // ============================================

  async getCategories(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const includePages = req.query.includePages === 'true';
      const categories = await documentationService.getCategories(includePages);

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const category = await documentationService.getCategoryById(id!);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await documentationService.createCategory(req.body);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const category = await documentationService.updateCategory(id!, req.body);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await documentationService.deleteCategory(id!);

      res.json({
        success: true,
        data: { message: 'Category deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async reorderCategories(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { orderedIds } = req.body;
      await documentationService.reorderCategories(orderedIds);

      res.json({
        success: true,
        data: { message: 'Categories reordered successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // PAGE ENDPOINTS
  // ============================================

  async getPages(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = {
        categoryId: req.query.categoryId as string | undefined,
        isPublished: req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined,
        accessLevel: req.query.accessLevel as any,
        search: req.query.search as string | undefined,
      };

      const pages = await documentationService.getPages(filters);

      res.json({
        success: true,
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPageById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const page = await documentationService.getPageById(id!);

      res.json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPageBySlug(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const page = await documentationService.getPageBySlug(slug!);

      res.json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPage(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = await documentationService.createPage(req.body);

      res.status(201).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePage(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const page = await documentationService.updatePage(id!, req.body);

      res.json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePage(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await documentationService.deletePage(id!);

      res.json({
        success: true,
        data: { message: 'Page deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  async duplicatePage(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const page = await documentationService.duplicatePage(id!);

      res.status(201).json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const documentationController = new DocumentationController();
