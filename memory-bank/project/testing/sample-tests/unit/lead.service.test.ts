/**
 * Unit Tests: Lead Service
 *
 * Tests the business logic for lead management without database dependencies.
 * All database calls are mocked to isolate service layer logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LeadService } from '../../../src/services/lead.service';
import { prisma } from '../../../src/lib/prisma';
import { emailQueue } from '../../../src/lib/queue';
import { leadFixtures } from '../../fixtures/leads.fixture';

// Mock Prisma client
vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    lead: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    leadActivity: {
      create: vi.fn(),
    },
    emailNotification: {
      create: vi.fn(),
    },
  },
}));

// Mock email queue
vi.mock('../../../src/lib/queue', () => ({
  emailQueue: {
    add: vi.fn(),
  },
}));

describe('LeadService', () => {
  let leadService: LeadService;

  beforeEach(() => {
    leadService = new LeadService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createContactLead', () => {
    it('should create lead with valid contact form data [LEAD-FUNC-001]', async () => {
      // Arrange
      const mockCreatedLead = {
        id: 'lead-uuid-123',
        source_id: 1,
        contact_email: leadFixtures.validContactFormData.email,
        created_at: new Date(),
      };

      (prisma.lead.create as any).mockResolvedValue(mockCreatedLead);

      // Act
      const result = await leadService.createContactLead(
        leadFixtures.validContactFormData
      );

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          source_id: 1, // Contact form source
          contact_email: leadFixtures.validContactFormData.email,
          contact_name: leadFixtures.validContactFormData.name,
          requirements: leadFixtures.validContactFormData.message,
          language: leadFixtures.validContactFormData.language,
        }),
      });

      expect(result).toEqual({
        success: true,
        leadId: mockCreatedLead.id,
        createdAt: mockCreatedLead.created_at,
      });
    });

    it('should set default status to "new" [LEAD-FUNC-003]', async () => {
      // Arrange
      (prisma.lead.create as any).mockResolvedValue({ id: 'test-id' });

      // Act
      await leadService.createContactLead(leadFixtures.validContactFormData);

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status_id: 1, // "new" status
        }),
      });
    });

    it('should handle Arabic characters in name and message [LEAD-FUNC-004]', async () => {
      // Arrange
      const arabicData = {
        ...leadFixtures.validContactFormData,
        name: 'محمد علي',
        message: 'مرحبا، أنا مهتم بخدماتكم',
      };

      (prisma.lead.create as any).mockResolvedValue({ id: 'test-id' });

      // Act
      await leadService.createContactLead(arabicData);

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          contact_name: 'محمد علي',
          requirements: expect.stringContaining('مرحبا'),
        }),
      });
    });

    it('should capture UTM parameters when provided [LEAD-INT-005]', async () => {
      // Arrange
      const dataWithUTM = {
        ...leadFixtures.validContactFormData,
        utmParams: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'summer-2026',
        },
      };

      (prisma.lead.create as any).mockResolvedValue({ id: 'test-id' });

      // Act
      await leadService.createContactLead(dataWithUTM);

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'summer-2026',
        }),
      });
    });

    it('should throw error if database operation fails', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      (prisma.lead.create as any).mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        leadService.createContactLead(leadFixtures.validContactFormData)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('createPricingQuoteLead', () => {
    it('should create lead with pricing quote source [LEAD-FUNC-006]', async () => {
      // Arrange
      (prisma.lead.create as any).mockResolvedValue({ id: 'test-id' });

      // Act
      await leadService.createPricingQuoteLead(
        leadFixtures.validPricingQuoteData
      );

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          source_id: 2, // Pricing quote source
          company_name: leadFixtures.validPricingQuoteData.companyName,
        }),
      });
    });

    it('should create junction table entries for services [LEAD-INT-006]', async () => {
      // Arrange
      const mockLead = { id: 'lead-123' };
      (prisma.lead.create as any).mockResolvedValue(mockLead);

      const dataWithServices = {
        ...leadFixtures.validPricingQuoteData,
        services: ['cloud', 'security', 'email'],
      };

      // Act
      await leadService.createPricingQuoteLead(dataWithServices);

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          services: {
            create: [
              { service_id: 1 }, // cloud
              { service_id: 2 }, // security
              { service_id: 3 }, // email
            ],
          },
        }),
      });
    });

    it('should associate industry when provided [LEAD-INT-007]', async () => {
      // Arrange
      (prisma.lead.create as any).mockResolvedValue({ id: 'test-id' });

      const dataWithIndustry = {
        ...leadFixtures.validPricingQuoteData,
        industry: 'technology',
      };

      // Act
      await leadService.createPricingQuoteLead(dataWithIndustry);

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          industry_id: 1, // technology industry
        }),
      });
    });
  });

  describe('createROICalculatorLead', () => {
    it('should store calculator data in JSONB format [LEAD-INT-008]', async () => {
      // Arrange
      (prisma.lead.create as any).mockResolvedValue({ id: 'test-id' });

      // Act
      await leadService.createROICalculatorLead(
        leadFixtures.validROICalculatorData
      );

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          source_id: 3, // ROI calculator source
          form_data: expect.objectContaining({
            calculatorType: 'cloud',
            inputs: expect.objectContaining({
              currentSpend: 10000,
              employees: 50,
            }),
            results: expect.objectContaining({
              estimatedSavings: 3000,
              roi: 30,
            }),
          }),
        }),
      });
    });

    it('should calculate lead score based on ROI data [LEAD-INT-009]', async () => {
      // Arrange
      (prisma.lead.create as any).mockResolvedValue({ id: 'test-id' });

      const highROIData = {
        ...leadFixtures.validROICalculatorData,
        results: {
          estimatedSavings: 50000,
          roi: 150,
          paybackPeriod: 6,
        },
      };

      // Act
      await leadService.createROICalculatorLead(highROIData);

      // Assert
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lead_score: expect.any(Number),
        }),
      });

      const calledWith = (prisma.lead.create as any).mock.calls[0][0];
      expect(calledWith.data.lead_score).toBeGreaterThan(50); // High ROI = high score
    });
  });

  describe('queueEmailNotifications', () => {
    it('should queue admin notification email [LEAD-INT-002]', async () => {
      // Arrange
      const leadId = 'lead-123';
      const leadData = {
        id: leadId,
        contact_email: 'customer@example.com',
        contact_name: 'John Doe',
        company_name: 'Acme Corp',
      };

      // Act
      await leadService.queueEmailNotifications(leadData, 'contact');

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-admin-notification',
        expect.objectContaining({
          leadId,
          type: 'admin_alert',
          recipient: 'sales@roaya.co',
          templateData: expect.objectContaining({
            company_name: 'Acme Corp',
          }),
        })
      );
    });

    it('should queue customer confirmation email [LEAD-INT-003]', async () => {
      // Arrange
      const leadData = {
        id: 'lead-123',
        contact_email: 'customer@example.com',
        contact_name: 'John Doe',
        language: 'en',
      };

      // Act
      await leadService.queueEmailNotifications(leadData, 'contact');

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-customer-confirmation',
        expect.objectContaining({
          type: 'lead_confirmation',
          recipient: 'customer@example.com',
          language: 'en',
        })
      );
    });

    it('should use Arabic template for Arabic language leads [EMAIL-FUNC-007]', async () => {
      // Arrange
      const leadData = {
        id: 'lead-123',
        contact_email: 'customer@example.com',
        contact_name: 'محمد',
        language: 'ar',
      };

      // Act
      await leadService.queueEmailNotifications(leadData, 'contact');

      // Assert
      expect(emailQueue.add).toHaveBeenCalledWith(
        'send-customer-confirmation',
        expect.objectContaining({
          language: 'ar',
          templateId: expect.stringContaining('_ar'),
        })
      );
    });
  });

  describe('calculateLeadScore', () => {
    it('should assign score 80+ for high-value ROI leads', () => {
      // Arrange
      const highValueROI = {
        estimatedSavings: 100000,
        roi: 200,
        paybackPeriod: 3,
      };

      // Act
      const score = leadService.calculateLeadScore(highValueROI);

      // Assert
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should assign score 40-60 for medium-value ROI leads', () => {
      // Arrange
      const mediumValueROI = {
        estimatedSavings: 10000,
        roi: 50,
        paybackPeriod: 12,
      };

      // Act
      const score = leadService.calculateLeadScore(mediumValueROI);

      // Assert
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThanOrEqual(60);
    });

    it('should handle negative ROI values gracefully', () => {
      // Arrange
      const negativeROI = {
        estimatedSavings: -5000,
        roi: -20,
        paybackPeriod: 0,
      };

      // Act
      const score = leadService.calculateLeadScore(negativeROI);

      // Assert
      expect(score).toBe(0); // Minimum score
    });

    it('should cap score at 100', () => {
      // Arrange
      const extremeROI = {
        estimatedSavings: 1000000,
        roi: 1000,
        paybackPeriod: 1,
      };

      // Act
      const score = leadService.calculateLeadScore(extremeROI);

      // Assert
      expect(score).toBe(100);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags from message [LEAD-NEG-003]', () => {
      // Arrange
      const maliciousInput = 'Hello <script>alert("XSS")</script> World';

      // Act
      const sanitized = leadService.sanitizeInput(maliciousInput);

      // Assert
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('Hello  World');
    });

    it('should escape HTML entities', () => {
      // Arrange
      const htmlInput = 'Test <b>bold</b> and <i>italic</i>';

      // Act
      const sanitized = leadService.sanitizeInput(htmlInput);

      // Assert
      expect(sanitized).not.toContain('<b>');
      expect(sanitized).toContain('&lt;b&gt;');
    });

    it('should preserve Arabic text', () => {
      // Arrange
      const arabicInput = 'مرحبا بكم في رؤية';

      // Act
      const sanitized = leadService.sanitizeInput(arabicInput);

      // Assert
      expect(sanitized).toBe(arabicInput);
    });
  });

  describe('detectDuplicateLead', () => {
    it('should flag duplicate if same email within 24 hours [LEAD-INT-004]', async () => {
      // Arrange
      const recentLead = {
        id: 'existing-lead',
        contact_email: 'test@example.com',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      };

      (prisma.lead.findMany as any).mockResolvedValue([recentLead]);

      // Act
      const isDuplicate = await leadService.detectDuplicateLead(
        'test@example.com'
      );

      // Assert
      expect(isDuplicate).toBe(true);
      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        where: {
          contact_email: 'test@example.com',
          created_at: {
            gte: expect.any(Date), // Within last 24 hours
          },
        },
      });
    });

    it('should not flag duplicate if same email after 24 hours', async () => {
      // Arrange
      const oldLead = {
        id: 'old-lead',
        contact_email: 'test@example.com',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
      };

      (prisma.lead.findMany as any).mockResolvedValue([oldLead]);

      // Act
      const isDuplicate = await leadService.detectDuplicateLead(
        'test@example.com'
      );

      // Assert
      expect(isDuplicate).toBe(false);
    });

    it('should not flag duplicate if different email', async () => {
      // Arrange
      (prisma.lead.findMany as any).mockResolvedValue([]);

      // Act
      const isDuplicate = await leadService.detectDuplicateLead(
        'newcustomer@example.com'
      );

      // Assert
      expect(isDuplicate).toBe(false);
    });
  });
});
