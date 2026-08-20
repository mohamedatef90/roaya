import { Request, Response, NextFunction } from 'express';
import { leadService } from '../../application/services/lead.service.js';
import { AuthenticatedRequest, ApiResponse } from '../../shared/types/index.js';
import {
  CreateLeadInput,
  UpdateLeadInput,
  LeadFiltersInput,
  PaginationInput,
  AddNoteInput,
  UpdateNoteInput,
  CreateActivityInput,
  ActivityQueryInput,
} from '../validators/lead.validators.js';

export class LeadController {
  // Public endpoint - create lead from form
  async createLead(
    req: Request<unknown, unknown, CreateLeadInput>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer,
      };

      const lead = await leadService.createLead(req.body, metadata);

      res.status(201).json({
        success: true,
        data: {
          id: lead.id,
          message: 'Thank you for your submission. We will contact you shortly.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - get all leads with filters
  async getLeads(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as unknown as LeadFiltersInput;
      const pagination = req.query as unknown as PaginationInput;

      const { leads, meta } = await leadService.getLeads(filters, pagination);

      res.json({
        success: true,
        data: { leads, meta },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - get lead by ID
  async getLeadById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await leadService.getLeadById(id!);

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - update lead
  async updateLead(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateLeadInput;
      const performedById = req.user?.userId;

      // Only SUPER_ADMIN can change assignment
      if (data.assignedToId !== undefined && req.user?.role !== 'SUPER_ADMIN') {
        delete data.assignedToId;
      }

      const lead = await leadService.updateLead(id!, data, performedById);

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - delete lead
  async deleteLead(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await leadService.deleteLead(id!);

      res.json({
        success: true,
        data: { message: 'Lead deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - add tag to lead
  async addTag(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { tagId } = req.body;

      await leadService.addTagToLead(id!, tagId);

      res.json({
        success: true,
        data: { message: 'Tag added successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - remove tag from lead
  async removeTag(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, tagId } = req.params;
      await leadService.removeTagFromLead(id!, tagId!);

      res.json({
        success: true,
        data: { message: 'Tag removed successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - add note to lead
  async addNote(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { content, isPrivate } = req.body as AddNoteInput;
      const performedById = req.user?.userId;

      const note = await leadService.addNote(id!, content, isPrivate, performedById);

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - update note
  async updateNote(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { content, isPrivate } = req.body as UpdateNoteInput;

      const note = await leadService.updateNote(id!, content, isPrivate);

      res.json({
        success: true,
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - delete note
  async deleteNote(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await leadService.deleteNote(id!);

      res.json({
        success: true,
        data: { message: 'Note deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - get lead activities (paginated)
  async getActivities(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { page, limit, type } = req.query as unknown as ActivityQueryInput;

      const { activities, meta } = await leadService.getActivities(
        id!,
        page,
        limit,
        type
      );

      res.json({
        success: true,
        data: { activities, meta },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - create manual activity
  async createActivity(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { type, description, metadata } = req.body as CreateActivityInput;
      const performedById = req.user?.userId;

      const activity = await leadService.createActivity(
        id!,
        type,
        description,
        performedById,
        metadata as Record<string, unknown>
      );

      res.status(201).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoint - get dashboard stats
  async getDashboardStats(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await leadService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const leadController = new LeadController();
