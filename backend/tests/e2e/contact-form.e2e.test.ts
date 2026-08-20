import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

/**
 * E2E Test Suite for Contact Form Flow
 * 
 * This test suite simulates the complete user journey:
 * 1. User submits contact form on website
 * 2. Lead is created in the system
 * 3. Confirmation email is queued
 * 4. Admin notification is queued
 * 5. Admin can view and manage the lead
 */

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.REDIS_HOST = 'localhost';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.ADMIN_NOTIFICATION_EMAIL = 'admin@roaya.ai';

// Track email queue calls
const emailQueueCalls: Array<{ type: string; email: string }> = [];

// Mock dependencies
vi.mock('../../src/config/database.js', () => {
  // In-memory lead storage for E2E simulation
  const leads: Map<string, any> = new Map();
  let leadCounter = 0;

  return {
    prisma: {
      lead: {
        create: vi.fn().mockImplementation((data) => {
          const id = `lead-${++leadCounter}`;
          const lead = {
            id,
            ...data.data,
            status: 'NEW',
            priority: 'MEDIUM',
            createdAt: new Date(),
            updatedAt: new Date(),
            assignedTo: null,
            tags: [],
          };
          leads.set(id, lead);
          return Promise.resolve(lead);
        }),
        findUnique: vi.fn().mockImplementation((query) => {
          const lead = leads.get(query.where.id);
          if (lead) {
            return Promise.resolve({
              ...lead,
              activities: [],
              notes: [],
            });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockImplementation(() => {
          return Promise.resolve(Array.from(leads.values()));
        }),
        update: vi.fn().mockImplementation((query) => {
          const lead = leads.get(query.where.id);
          if (lead) {
            const updated = { ...lead, ...query.data, updatedAt: new Date() };
            leads.set(query.where.id, updated);
            return Promise.resolve(updated);
          }
          throw new Error('Lead not found');
        }),
        count: vi.fn().mockImplementation(() => leads.size),
        groupBy: vi.fn().mockResolvedValue([]),
      },
      leadActivity: {
        create: vi.fn().mockResolvedValue({}),
      },
      leadNote: {
        create: vi.fn().mockResolvedValue({}),
      },
      adminUser: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'admin-1',
          email: 'admin@roaya.ai',
          passwordHash: '$2a$12$test',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        }),
      },
      refreshToken: {
        create: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({}),
      },
      $connect: vi.fn(),
      $disconnect: vi.fn(),
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    },
    connectDatabase: vi.fn(),
    disconnectDatabase: vi.fn(),
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

vi.mock('../../src/config/redis.js', () => ({
  redis: {
    status: 'ready',
    on: vi.fn(),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn(),
  },
  connectRedis: vi.fn(),
  disconnectRedis: vi.fn(),
  redisHealthCheck: vi.fn().mockResolvedValue(true),
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock('../../src/infrastructure/email/email-queue.js', () => ({
  emailQueue: {
    addLeadConfirmationEmail: vi.fn().mockImplementation((lead) => {
      emailQueueCalls.push({ type: 'confirmation', email: lead.email });
      return Promise.resolve();
    }),
    addAdminNotificationEmail: vi.fn().mockImplementation((lead) => {
      emailQueueCalls.push({ type: 'admin_notification', email: 'admin@roaya.ai' });
      return Promise.resolve();
    }),
  },
  startEmailWorker: vi.fn(),
  stopEmailWorker: vi.fn(),
}));

vi.mock('../../src/application/services/auth.service.js', () => ({
  authService: {
    verifyAccessToken: vi.fn().mockReturnValue({
      userId: 'admin-1',
      email: 'admin@roaya.ai',
      role: 'ADMIN',
      type: 'access',
    }),
    login: vi.fn().mockResolvedValue({
      user: {
        id: 'admin-1',
        email: 'admin@roaya.ai',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900,
      },
    }),
  },
}));

describe('E2E: Contact Form to Lead Management Flow', () => {
  let app: express.Application;
  let createdLeadId: string;

  beforeAll(async () => {
    const appModule = await import('../../src/app.js');
    app = appModule.default;
  });

  beforeEach(() => {
    emailQueueCalls.length = 0;
  });

  describe('Step 1: User Submits Contact Form', () => {
    it('should accept a valid contact form submission', async () => {
      const contactFormData = {
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        email: 'ahmed@techcorp.sa',
        phone: '+966501234567',
        company: 'TechCorp Saudi',
        jobTitle: 'CTO',
        source: 'CONTACT_FORM',
        message: 'Interested in AI automation for our customer service department. We handle over 10,000 customer inquiries daily.',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'ai-automation-ksa',
      };

      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send(contactFormData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.message).toContain('Thank you');

      createdLeadId = response.body.data.id;
    });

    it('should queue confirmation email to user', async () => {
      // Check that confirmation email was queued
      const confirmationEmail = emailQueueCalls.find(
        (call) => call.type === 'confirmation' && call.email === 'ahmed@techcorp.sa'
      );
      expect(confirmationEmail).toBeDefined();
    });

    it('should queue notification email to admin', async () => {
      // Check that admin notification was queued
      const adminNotification = emailQueueCalls.find(
        (call) => call.type === 'admin_notification'
      );
      expect(adminNotification).toBeDefined();
    });
  });

  describe('Step 2: Admin Reviews New Lead', () => {
    it('should allow admin to view the new lead', async () => {
      const response = await request(app)
        .get(`/api/v1/leads/${createdLeadId}`)
        .set('Authorization', 'Bearer mock-access-token');

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('Ahmed');
      expect(response.body.data.company).toBe('TechCorp Saudi');
      expect(response.body.data.status).toBe('NEW');
    });

    it('should show lead in the leads list', async () => {
      const response = await request(app)
        .get('/api/v1/leads')
        .set('Authorization', 'Bearer mock-access-token');

      expect(response.status).toBe(200);
      expect(response.body.data.some((lead: any) => lead.id === createdLeadId)).toBe(true);
    });
  });

  describe('Step 3: Admin Updates Lead Status', () => {
    it('should allow admin to update lead status to CONTACTED', async () => {
      const response = await request(app)
        .patch(`/api/v1/leads/${createdLeadId}`)
        .set('Authorization', 'Bearer mock-access-token')
        .send({ status: 'CONTACTED' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CONTACTED');
    });

    it('should allow admin to set priority to HIGH', async () => {
      const response = await request(app)
        .patch(`/api/v1/leads/${createdLeadId}`)
        .set('Authorization', 'Bearer mock-access-token')
        .send({ priority: 'HIGH' });

      expect(response.status).toBe(200);
      expect(response.body.data.priority).toBe('HIGH');
    });
  });

  describe('Step 4: Additional Form Submissions', () => {
    it('should handle ROI Calculator submission', async () => {
      const roiFormData = {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@globalretail.com',
        company: 'Global Retail Inc',
        source: 'ROI_CALCULATOR',
        estimatedValue: 150000,
        formData: {
          currentEmployees: 50,
          monthlyCalls: 10000,
          avgHandleTime: 8,
        },
      };

      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send(roiFormData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should handle Pricing Page inquiry', async () => {
      const pricingFormData = {
        firstName: 'Mohammad',
        lastName: 'Hassan',
        email: 'mhassan@startuphub.ae',
        company: 'StartupHub UAE',
        source: 'PRICING_PAGE',
        message: 'Looking for AI solutions for our accelerator program.',
      };

      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send(pricingFormData);

      expect(response.status).toBe(201);
    });
  });

  describe('Step 5: Error Handling', () => {
    it('should reject form with missing required fields', async () => {
      const invalidForm = {
        firstName: 'John',
        // Missing lastName, email, source
      };

      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send(invalidForm);

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should reject form with invalid email', async () => {
      const invalidEmailForm = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        source: 'CONTACT_FORM',
      };

      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send(invalidEmailForm);

      expect(response.status).toBe(422);
      expect(response.body.error.details.email).toBeDefined();
    });

    it('should reject form with invalid source', async () => {
      const invalidSourceForm = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: 'INVALID_SOURCE',
      };

      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send(invalidSourceForm);

      expect(response.status).toBe(422);
    });
  });

  describe('Step 6: Security Checks', () => {
    it('should not allow unauthenticated access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/leads');

      expect(response.status).toBe(401);
    });

    it('should not expose sensitive data in public endpoints', async () => {
      // The submit response should only return ID and confirmation message
      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          source: 'CONTACT_FORM',
        });

      expect(response.status).toBe(201);
      // Should not expose internal fields
      expect(response.body.data.passwordHash).toBeUndefined();
      expect(response.body.data.ipAddress).toBeUndefined();
      expect(response.body.data.userAgent).toBeUndefined();
    });
  });
});
