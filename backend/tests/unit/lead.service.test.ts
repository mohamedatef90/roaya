import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadStatus, LeadSource, LeadPriority } from '@prisma/client';

// Mock the dependencies before importing the service
vi.mock('../../src/config/database.js', () => ({
  prisma: {
    lead: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    leadActivity: {
      create: vi.fn(),
    },
    leadNote: {
      create: vi.fn(),
    },
    leadTag: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../src/infrastructure/email/email-queue.js', () => ({
  emailQueue: {
    addLeadConfirmationEmail: vi.fn(),
    addAdminNotificationEmail: vi.fn(),
  },
}));

vi.mock('../../src/shared/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('LeadService', () => {
  const mockLead = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Test Corp',
    jobTitle: 'CEO',
    source: LeadSource.CONTACT_FORM,
    status: LeadStatus.NEW,
    priority: LeadPriority.MEDIUM,
    message: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createLead', () => {
    it('should create a new lead successfully', async () => {
      const { prisma } = await import('../../src/config/database.js');
      const { emailQueue } = await import('../../src/infrastructure/email/email-queue.js');
      
      vi.mocked(prisma.lead.create).mockResolvedValue({
        ...mockLead,
        assignedTo: null,
        tags: [],
      } as any);
      vi.mocked(prisma.leadActivity.create).mockResolvedValue({} as any);

      const { leadService } = await import('../../src/application/services/lead.service.js');
      
      const result = await leadService.createLead({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: LeadSource.CONTACT_FORM,
        message: 'Test message',
      });

      expect(prisma.lead.create).toHaveBeenCalledTimes(1);
      expect(prisma.leadActivity.create).toHaveBeenCalledTimes(1);
      expect(emailQueue.addLeadConfirmationEmail).toHaveBeenCalledTimes(1);
      expect(emailQueue.addAdminNotificationEmail).toHaveBeenCalledTimes(1);
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('getLeadById', () => {
    it('should return a lead when found', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.findUnique).mockResolvedValue({
        ...mockLead,
        assignedTo: null,
        tags: [],
        activities: [],
        notes: [],
      } as any);

      const { leadService } = await import('../../src/application/services/lead.service.js');
      
      const result = await leadService.getLeadById(mockLead.id);

      expect(prisma.lead.findUnique).toHaveBeenCalledWith({
        where: { id: mockLead.id },
        include: expect.any(Object),
      });
      expect(result.id).toBe(mockLead.id);
    });

    it('should throw NotFoundError when lead not found', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.findUnique).mockResolvedValue(null);

      const { leadService } = await import('../../src/application/services/lead.service.js');
      
      await expect(leadService.getLeadById('non-existent')).rejects.toThrow('not found');
    });
  });

  describe('getLeads', () => {
    it('should return paginated leads', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.findMany).mockResolvedValue([mockLead] as any);
      vi.mocked(prisma.lead.count).mockResolvedValue(1);

      const { leadService } = await import('../../src/application/services/lead.service.js');
      
      const result = await leadService.getLeads({}, { page: 1, limit: 20 });

      expect(result.leads).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter leads by status', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.findMany).mockResolvedValue([mockLead] as any);
      vi.mocked(prisma.lead.count).mockResolvedValue(1);

      const { leadService } = await import('../../src/application/services/lead.service.js');
      
      await leadService.getLeads({ status: LeadStatus.NEW }, { page: 1, limit: 20 });

      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: LeadStatus.NEW,
          }),
        })
      );
    });
  });

  describe('updateLead', () => {
    it('should update lead and track status change', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.findUnique).mockResolvedValue({
        ...mockLead,
        status: LeadStatus.NEW,
        assignedTo: null,
        tags: [],
        activities: [],
        notes: [],
      } as any);

      vi.mocked(prisma.lead.update).mockResolvedValue({
        ...mockLead,
        status: LeadStatus.CONTACTED,
        assignedTo: null,
        tags: [],
      } as any);

      const { leadService } = await import('../../src/application/services/lead.service.js');
      
      const result = await leadService.updateLead(mockLead.id, { 
        status: LeadStatus.CONTACTED 
      });

      expect(prisma.leadActivity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'STATUS_CHANGE',
          }),
        })
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.count)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(5)   // today
        .mockResolvedValueOnce(20)  // this week
        .mockResolvedValueOnce(50)  // this month
        .mockResolvedValueOnce(10); // won

      vi.mocked(prisma.lead.groupBy)
        .mockResolvedValueOnce([
          { status: LeadStatus.NEW, _count: 40 },
          { status: LeadStatus.WON, _count: 10 },
        ] as any)
        .mockResolvedValueOnce([
          { source: LeadSource.CONTACT_FORM, _count: 60 },
        ] as any);

      const { leadService } = await import('../../src/application/services/lead.service.js');
      
      const stats = await leadService.getDashboardStats();

      expect(stats.totalLeads).toBe(100);
      expect(stats.newLeadsToday).toBe(5);
      expect(stats.conversionRate).toBe(10);
    });
  });
});
