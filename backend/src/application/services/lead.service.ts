import { prisma } from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { 
  CreateLeadDTO, 
  UpdateLeadDTO, 
  LeadFilters, 
  PaginationQuery,
  PaginationMeta 
} from '../../shared/types/index.js';
import { calculatePagination, getPaginationSkip } from '../../shared/utils/helpers.js';
import { NotFoundError, ConflictError } from '../../domain/exceptions/index.js';
import { LeadStatus, LeadSource, Prisma } from '@prisma/client';
import { emailQueue } from '../../infrastructure/email/email-queue.js';

export class LeadService {
  async createLead(data: CreateLeadDTO, metadata?: { ipAddress?: string; userAgent?: string; referrer?: string }) {
    logger.info('Creating new lead', { email: data.email, source: data.source });

    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        jobTitle: data.jobTitle,
        website: data.website,
        source: data.source,
        message: data.message,
        formData: data.formData as Prisma.InputJsonValue,
        estimatedValue: data.estimatedValue,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        referrer: metadata?.referrer,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Create activity for new lead
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'NOTE',
        description: `Lead created from ${data.source}`,
      },
    });

    // Queue emails
    await emailQueue.addLeadConfirmationEmail(lead);
    await emailQueue.addAdminNotificationEmail(lead);

    logger.info('Lead created successfully', { leadId: lead.id });
    return lead;
  }

  async getLeadById(id: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            performedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError(`Lead with id ${id} not found`);
    }

    return lead;
  }

  async getLeads(
    filters: LeadFilters,
    pagination: PaginationQuery
  ): Promise<{ leads: any[]; meta: PaginationMeta }> {
    const where = this.buildWhereClause(filters);
    const skip = getPaginationSkip(pagination);
    const take = pagination.limit ?? 20;
    const orderBy = this.buildOrderBy(pagination);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    const meta = calculatePagination(total, pagination);
    return { leads, meta };
  }

  async updateLead(id: string, data: UpdateLeadDTO, performedById?: string) {
    const existingLead = await this.getLeadById(id);

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        nextFollowUpAt: data.nextFollowUpAt,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Track status change
    if (data.status && data.status !== existingLead.status) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'STATUS_CHANGE',
          description: `Status changed from ${existingLead.status} to ${data.status}`,
          metadata: { from: existingLead.status, to: data.status },
          performedById,
        },
      });
    }

    // Track assignment change
    if (data.assignedToId && data.assignedToId !== existingLead.assignedToId) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'ASSIGNMENT_CHANGE',
          description: `Lead reassigned`,
          metadata: { 
            from: existingLead.assignedToId, 
            to: data.assignedToId 
          },
          performedById,
        },
      });
    }

    logger.info('Lead updated', { leadId: id });
    return lead;
  }

  async deleteLead(id: string) {
    await this.getLeadById(id);
    await prisma.lead.delete({ where: { id } });
    logger.info('Lead deleted', { leadId: id });
  }

  async addTagToLead(leadId: string, tagId: string) {
    await this.getLeadById(leadId);

    const existingTag = await prisma.leadTag.findUnique({
      where: { leadId_tagId: { leadId, tagId } },
    });

    if (existingTag) {
      throw new ConflictError('Tag already added to lead');
    }

    await prisma.leadTag.create({
      data: { leadId, tagId },
    });
  }

  async removeTagFromLead(leadId: string, tagId: string) {
    await prisma.leadTag.delete({
      where: { leadId_tagId: { leadId, tagId } },
    });
  }

  async addNote(leadId: string, content: string, isPrivate = false, performedById?: string) {
    await this.getLeadById(leadId);

    const note = await prisma.leadNote.create({
      data: {
        leadId,
        content,
        isPrivate,
      },
    });

    await prisma.leadActivity.create({
      data: {
        leadId,
        type: 'NOTE',
        description: 'Note added',
        performedById,
      },
    });

    return note;
  }

  async updateNote(noteId: string, content: string, isPrivate?: boolean) {
    const note = await prisma.leadNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundError(`Note with id ${noteId} not found`);
    }

    const updatedNote = await prisma.leadNote.update({
      where: { id: noteId },
      data: {
        content,
        ...(isPrivate !== undefined && { isPrivate }),
      },
    });

    logger.info('Note updated', { noteId });
    return updatedNote;
  }

  async deleteNote(noteId: string) {
    const note = await prisma.leadNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundError(`Note with id ${noteId} not found`);
    }

    await prisma.leadNote.delete({ where: { id: noteId } });
    logger.info('Note deleted', { noteId });
  }

  async getActivities(leadId: string, page = 1, limit = 20, type?: string) {
    await this.getLeadById(leadId);

    const where: Prisma.LeadActivityWhereInput = {
      leadId,
      ...(type && { type: type as any }),
    };

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.leadActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.leadActivity.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      activities,
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

  async createActivity(
    leadId: string,
    type: string,
    description: string,
    performedById?: string,
    metadata?: Record<string, unknown>
  ) {
    await this.getLeadById(leadId);

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        type: type as any,
        description,
        performedById,
        metadata: metadata as Prisma.InputJsonValue,
      },
      include: {
        performedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('Activity created', { leadId, type });
    return activity;
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLeads,
      newLeadsToday,
      newLeadsThisWeek,
      newLeadsThisMonth,
      leadsByStatus,
      leadsBySource,
      leadsBySourceAndStatus,
      wonLeads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.groupBy({ by: ['status'], _count: true }),
      prisma.lead.groupBy({ by: ['source'], _count: true }),
      prisma.lead.groupBy({ by: ['source', 'status'], _count: true }),
      prisma.lead.count({ where: { status: LeadStatus.WON } }),
    ]);

    const statusCounts = Object.values(LeadStatus).reduce((acc, status) => {
      const found = leadsByStatus.find((s) => s.status === status);
      acc[status] = found?._count ?? 0;
      return acc;
    }, {} as Record<LeadStatus, number>);

    const sourceCounts = Object.values(LeadSource).reduce((acc, source) => {
      const found = leadsBySource.find((s) => s.source === source);
      acc[source] = found?._count ?? 0;
      return acc;
    }, {} as Record<LeadSource, number>);

    // Build source x status matrix for heatmap
    const sourceStatusMatrix = Object.values(LeadSource).reduce((acc, source) => {
      acc[source] = Object.values(LeadStatus).reduce((statusAcc, status) => {
        const found = leadsBySourceAndStatus.find(
          (item) => item.source === source && item.status === status
        );
        statusAcc[status] = found?._count ?? 0;
        return statusAcc;
      }, {} as Record<LeadStatus, number>);
      return acc;
    }, {} as Record<LeadSource, Record<LeadStatus, number>>);

    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      newLeadsToday,
      newLeadsThisWeek,
      newLeadsThisMonth,
      leadsByStatus: statusCounts,
      leadsBySource: sourceCounts,
      leadsBySourceAndStatus: sourceStatusMatrix,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageResponseTime: 0, // Would need actual calculation based on activities
    };
  }

  private buildWhereClause(filters: LeadFilters): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};

    if (filters.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters.source) {
      where.source = Array.isArray(filters.source)
        ? { in: filters.source }
        : filters.source;
    }

    if (filters.priority) {
      where.priority = Array.isArray(filters.priority)
        ? { in: filters.priority }
        : filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tagId: { in: filters.tags },
        },
      };
    }

    return where;
  }

  private buildOrderBy(pagination: PaginationQuery): Prisma.LeadOrderByWithRelationInput {
    const sortBy = pagination.sortBy ?? 'createdAt';
    const sortOrder = pagination.sortOrder ?? 'desc';

    return { [sortBy]: sortOrder };
  }
}

export const leadService = new LeadService();
