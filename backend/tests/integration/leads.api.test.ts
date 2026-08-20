import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Set up minimal test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.REDIS_HOST = 'localhost';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.ADMIN_NOTIFICATION_EMAIL = 'test@test.com';

// Mock all external dependencies
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
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  healthCheck: vi.fn().mockResolvedValue(true),
}));

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
    addLeadConfirmationEmail: vi.fn(),
    addAdminNotificationEmail: vi.fn(),
  },
  startEmailWorker: vi.fn(),
  stopEmailWorker: vi.fn(),
}));

vi.mock('../../src/application/services/auth.service.js', () => ({
  authService: {
    verifyAccessToken: vi.fn().mockReturnValue({
      userId: 'test-user-id',
      email: 'admin@test.com',
      role: 'ADMIN',
      type: 'access',
    }),
  },
}));

// Use valid UUIDs for test data
const TEST_LEAD_ID = '550e8400-e29b-41d4-a716-446655440000';
const NON_EXISTENT_ID = '550e8400-e29b-41d4-a716-446655440999';

describe('Leads API Integration Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Import app after mocks are set up
    const appModule = await import('../../src/app.js');
    app = appModule.default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/leads/submit', () => {
    it('should create a lead with valid data', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      const mockLead = {
        id: TEST_LEAD_ID,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        source: 'CONTACT_FORM',
        status: 'NEW',
        createdAt: new Date(),
        assignedTo: null,
        tags: [],
      };

      vi.mocked(prisma.lead.create).mockResolvedValue(mockLead as any);
      vi.mocked(prisma.leadActivity.create).mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          source: 'CONTACT_FORM',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(TEST_LEAD_ID);
    });

    it('should return 422 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send({
          firstName: 'John',
          // Missing required fields
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/leads/submit')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          source: 'CONTACT_FORM',
        });

      expect(response.status).toBe(422);
      expect(response.body.error.details).toHaveProperty('email');
    });
  });

  describe('GET /api/v1/leads', () => {
    it('should return paginated leads for authenticated user', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      const mockLeads = [
        {
          id: 'lead-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          source: 'CONTACT_FORM',
          status: 'NEW',
          priority: 'MEDIUM',
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.lead.findMany).mockResolvedValue(mockLeads as any);
      vi.mocked(prisma.lead.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/leads')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/leads');

      expect(response.status).toBe(401);
    });

    it('should filter leads by status', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.findMany).mockResolvedValue([]);
      vi.mocked(prisma.lead.count).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/leads?status=NEW')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(prisma.lead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'NEW',
          }),
        })
      );
    });
  });

  describe('GET /api/v1/leads/:id', () => {
    it('should return a single lead', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      const mockLead = {
        id: TEST_LEAD_ID,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        assignedTo: null,
        tags: [],
        activities: [],
        notes: [],
      };

      vi.mocked(prisma.lead.findUnique).mockResolvedValue(mockLead as any);

      const response = await request(app)
        .get(`/api/v1/leads/${TEST_LEAD_ID}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(TEST_LEAD_ID);
    });

    it('should return 404 for non-existent lead', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      vi.mocked(prisma.lead.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/leads/${NON_EXISTENT_ID}`)
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/leads/:id', () => {
    it('should update a lead', async () => {
      const { prisma } = await import('../../src/config/database.js');
      
      const mockLead = {
        id: TEST_LEAD_ID,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        status: 'NEW',
        assignedTo: null,
        tags: [],
        activities: [],
        notes: [],
      };

      vi.mocked(prisma.lead.findUnique).mockResolvedValue(mockLead as any);
      vi.mocked(prisma.lead.update).mockResolvedValue({
        ...mockLead,
        status: 'CONTACTED',
      } as any);

      const response = await request(app)
        .patch(`/api/v1/leads/${TEST_LEAD_ID}`)
        .set('Authorization', 'Bearer valid-token')
        .send({ status: 'CONTACTED' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CONTACTED');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });
});
