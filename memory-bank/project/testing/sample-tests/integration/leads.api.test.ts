/**
 * Integration Tests: Leads API Endpoints
 *
 * Tests API endpoints with real database and queue integration.
 * Uses Testcontainers for isolated PostgreSQL instance.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../src/app';
import { prisma } from '../../../src/lib/prisma';
import { resetDatabase, seedTestData } from '../../utils/database';
import { leadFixtures } from '../../fixtures/leads.fixture';

describe('Lead Submission API Integration Tests', () => {
  beforeAll(async () => {
    // Database setup
    await resetDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean leads table before each test
    await prisma.lead.deleteMany({});
    await prisma.emailNotification.deleteMany({});
  });

  describe('POST /api/v1/leads/contact', () => {
    it('should create lead and return 201 [LEAD-FUNC-001]', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(leadFixtures.validContactFormData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: {
          leadId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
          ),
          createdAt: expect.any(String),
          estimatedResponse: '24-48 hours',
        },
      });

      // Verify lead in database
      const lead = await prisma.lead.findUnique({
        where: { id: response.body.data.leadId },
      });

      expect(lead).toBeTruthy();
      expect(lead?.contact_email).toBe(leadFixtures.validContactFormData.email);
      expect(lead?.source_id).toBe(1); // Contact form
    });

    it('should create activity log entry [LEAD-INT-001]', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(leadFixtures.validContactFormData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert - Check activity log
      const activities = await prisma.leadActivity.findMany({
        where: { lead_id: leadId },
      });

      expect(activities).toHaveLength(1);
      expect(activities[0]).toMatchObject({
        activity_type: 'created',
        performed_by_type: 'system',
        description: expect.stringContaining('Lead created from Contact Form'),
      });
    });

    it('should queue admin notification email [LEAD-INT-002]', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(leadFixtures.validContactFormData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert - Check email notification queued
      const emailNotifications = await prisma.emailNotification.findMany({
        where: {
          lead_id: leadId,
          notification_type: 'admin_alert',
        },
      });

      expect(emailNotifications).toHaveLength(1);
      expect(emailNotifications[0]).toMatchObject({
        recipient_email: 'sales@roaya.co',
        status: 'pending',
        retry_count: 0,
      });
    });

    it('should queue customer confirmation email [LEAD-INT-003]', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(leadFixtures.validContactFormData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert - Check customer email queued
      const emailNotifications = await prisma.emailNotification.findMany({
        where: {
          lead_id: leadId,
          notification_type: 'lead_confirmation',
        },
      });

      expect(emailNotifications).toHaveLength(1);
      expect(emailNotifications[0]).toMatchObject({
        recipient_email: leadFixtures.validContactFormData.email,
        status: 'pending',
      });
    });

    it('should capture UTM parameters [LEAD-INT-005]', async () => {
      // Arrange
      const dataWithUTM = {
        ...leadFixtures.validContactFormData,
        utmParams: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'winter-2026',
        },
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(dataWithUTM)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert - Check UTM fields in database
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: {
          utm_source: true,
          utm_medium: true,
          utm_campaign: true,
        },
      });

      expect(lead).toMatchObject({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'winter-2026',
      });
    });

    it('should reject missing required field (email) with 400 [LEAD-NEG-001]', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        message: 'Test message',
        // email missing
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: expect.stringContaining('email'),
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              code: 'REQUIRED',
            }),
          ]),
        },
      });
    });

    it('should reject invalid email format with 400 [LEAD-NEG-002]', async () => {
      // Arrange
      const invalidData = {
        ...leadFixtures.validContactFormData,
        email: 'not-a-valid-email',
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            code: 'INVALID_FORMAT',
          }),
        ])
      );
    });

    it('should sanitize XSS attempt in message [LEAD-NEG-003]', async () => {
      // Arrange
      const xssData = {
        ...leadFixtures.validContactFormData,
        message: 'Hello <script>alert("XSS")</script> World',
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(xssData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert - Verify script tag removed in database
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { requirements: true },
      });

      expect(lead?.requirements).not.toContain('<script>');
      expect(lead?.requirements).toContain('Hello');
      expect(lead?.requirements).toContain('World');
    });

    it('should reject message exceeding 2000 characters [LEAD-NEG-005]', async () => {
      // Arrange
      const longMessageData = {
        ...leadFixtures.validContactFormData,
        message: 'a'.repeat(2001),
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(longMessageData)
        .expect(400);

      // Assert
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'message',
            code: 'TOO_LONG',
            message: expect.stringContaining('2000'),
          }),
        ])
      );
    });

    it('should accept exactly 2000 character message [LEAD-BOUND-001]', async () => {
      // Arrange
      const exactLengthData = {
        ...leadFixtures.validContactFormData,
        message: 'a'.repeat(2000),
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(exactLengthData)
        .expect(201);

      // Assert
      const leadId = response.body.data.leadId;
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { requirements: true },
      });

      expect(lead?.requirements?.length).toBe(2000);
    });

    it('should handle Arabic characters correctly [LEAD-FUNC-004]', async () => {
      // Arrange
      const arabicData = {
        name: 'محمد علي',
        email: 'mohammed@example.com',
        phone: '+201234567890',
        company: 'شركة التكنولوجيا',
        message: 'مرحبا، أنا مهتم بخدمات الحوسبة السحابية',
        language: 'ar' as const,
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send(arabicData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert - Verify Arabic text preserved
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      expect(lead?.contact_name).toBe('محمد علي');
      expect(lead?.company_name).toBe('شركة التكنولوجيا');
      expect(lead?.requirements).toContain('مرحبا');
      expect(lead?.language).toBe('ar');
    });
  });

  describe('POST /api/v1/leads/pricing-quote', () => {
    it('should create lead with pricing quote source [LEAD-FUNC-006]', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/leads/pricing-quote')
        .send(leadFixtures.validPricingQuoteData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { source: true },
      });

      expect(lead?.source_id).toBe(2);
      expect(lead?.source.code).toBe('pricing_quote');
    });

    it('should create junction table entries for services [LEAD-INT-006]', async () => {
      // Arrange
      const dataWithServices = {
        ...leadFixtures.validPricingQuoteData,
        services: ['cloud', 'security', 'email'],
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/pricing-quote')
        .send(dataWithServices)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert - Check lead_services junction table
      const leadServices = await prisma.leadService.findMany({
        where: { lead_id: leadId },
        include: { service: true },
      });

      expect(leadServices).toHaveLength(3);
      expect(leadServices.map((ls) => ls.service.code)).toEqual(
        expect.arrayContaining(['cloud', 'security', 'email'])
      );
    });

    it('should reject empty services array [LEAD-NEG-007]', async () => {
      // Arrange
      const dataWithEmptyServices = {
        ...leadFixtures.validPricingQuoteData,
        services: [],
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/pricing-quote')
        .send(dataWithEmptyServices)
        .expect(400);

      // Assert
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'services',
            code: 'REQUIRED',
          }),
        ])
      );
    });

    it('should reject invalid service code [LEAD-NEG-008]', async () => {
      // Arrange
      const dataWithInvalidService = {
        ...leadFixtures.validPricingQuoteData,
        services: ['cloud', 'nonexistent-service'],
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/pricing-quote')
        .send(dataWithInvalidService)
        .expect(400);

      // Assert
      expect(response.body.error.message).toContain('Invalid service code');
    });

    it('should associate industry when provided [LEAD-INT-007]', async () => {
      // Arrange
      const dataWithIndustry = {
        ...leadFixtures.validPricingQuoteData,
        industry: 'technology',
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/pricing-quote')
        .send(dataWithIndustry)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { industry: true },
      });

      expect(lead?.industry_id).toBeTruthy();
      expect(lead?.industry?.code).toBe('technology');
    });
  });

  describe('POST /api/v1/leads/roi-calculator', () => {
    it('should store calculator data in JSONB format [LEAD-INT-008]', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/leads/roi-calculator')
        .send(leadFixtures.validROICalculatorData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { form_data: true },
      });

      expect(lead?.form_data).toMatchObject({
        calculatorType: 'cloud',
        inputs: {
          currentSpend: 10000,
          employees: 50,
          serverCount: 10,
        },
        results: {
          estimatedSavings: 3000,
          roi: 30,
          paybackPeriod: 12,
        },
      });
    });

    it('should calculate lead score based on ROI [LEAD-INT-009]', async () => {
      // Arrange
      const highROIData = {
        ...leadFixtures.validROICalculatorData,
        results: {
          estimatedSavings: 100000,
          roi: 200,
          paybackPeriod: 6,
        },
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/roi-calculator')
        .send(highROIData)
        .expect(201);

      const leadId = response.body.data.leadId;

      // Assert
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { lead_score: true },
      });

      expect(lead?.lead_score).toBeGreaterThan(70); // High ROI = high score
    });

    it('should reject invalid calculator type [LEAD-NEG-010]', async () => {
      // Arrange
      const invalidData = {
        ...leadFixtures.validROICalculatorData,
        calculatorType: 'invalid-type',
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/roi-calculator')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'calculatorType',
            code: 'INVALID_ENUM',
          }),
        ])
      );
    });

    it('should accept negative ROI values [LEAD-NEG-011]', async () => {
      // Arrange
      const negativeROIData = {
        ...leadFixtures.validROICalculatorData,
        results: {
          estimatedSavings: -5000,
          roi: -20,
          paybackPeriod: 0,
        },
      };

      // Act
      const response = await request(app)
        .post('/api/v1/leads/roi-calculator')
        .send(negativeROIData)
        .expect(201);

      // Assert - Negative ROI is valid (customer may have miscalculated)
      const leadId = response.body.data.leadId;
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { form_data: true },
      });

      expect(lead?.form_data.results.roi).toBe(-20);
    });
  });

  describe('Rate Limiting', () => {
    it('should block after 5 submissions from same IP [SEC-FUNC-011]', async () => {
      // Act - Submit 5 times
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/leads/contact')
          .send({
            ...leadFixtures.validContactFormData,
            email: `test${i}@example.com`,
          })
          .expect(201);
      }

      // 6th attempt should be blocked
      const response = await request(app)
        .post('/api/v1/leads/contact')
        .send({
          ...leadFixtures.validContactFormData,
          email: 'test6@example.com',
        })
        .expect(429);

      // Assert
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: expect.stringContaining('Too many requests'),
        },
      });
    });
  });
});
