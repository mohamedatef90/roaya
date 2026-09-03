import { vi, beforeAll, afterAll, beforeEach } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.SENDGRID_API_KEY = '';
process.env.ADMIN_NOTIFICATION_EMAIL = 'test@test.com';

// Mock Prisma client
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    lead: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    adminUser: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    leadActivity: {
      create: vi.fn(),
      createMany: vi.fn(),
    },
    leadNote: {
      create: vi.fn(),
    },
    leadTag: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    tag: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    emailTemplate: {
      findUnique: vi.fn(),
    },
    systemSetting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    contentItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    LeadStatus: {
      NEW: 'NEW',
      CONTACTED: 'CONTACTED',
      QUALIFIED: 'QUALIFIED',
      PROPOSAL: 'PROPOSAL',
      NEGOTIATION: 'NEGOTIATION',
      WON: 'WON',
      LOST: 'LOST',
      ARCHIVED: 'ARCHIVED',
    },
    LeadSource: {
      CONTACT_FORM: 'CONTACT_FORM',
      PRICING_PAGE: 'PRICING_PAGE',
      ROI_CALCULATOR: 'ROI_CALCULATOR',
      NEWSLETTER: 'NEWSLETTER',
      REFERRAL: 'REFERRAL',
      LINKEDIN: 'LINKEDIN',
      GOOGLE_ADS: 'GOOGLE_ADS',
      ORGANIC: 'ORGANIC',
      OTHER: 'OTHER',
    },
    LeadPriority: {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      URGENT: 'URGENT',
    },
    UserRole: {
      SUPER_ADMIN: 'SUPER_ADMIN',
      ADMIN: 'ADMIN',
      SALES_MANAGER: 'SALES_MANAGER',
      SALES_REP: 'SALES_REP',
      VIEWER: 'VIEWER',
    },
    // Content enums (mirrors prisma/schema.prisma) so content.service.ts can
    // reference ContentStatus.PUBLISHED under the global mock.
    ContentType: {
      BLOG_POST: 'BLOG_POST',
      CASE_STUDY: 'CASE_STUDY',
      WHITEPAPER: 'WHITEPAPER',
    },
    ContentStatus: {
      DRAFT: 'DRAFT',
      PENDING_REVIEW: 'PENDING_REVIEW',
      PUBLISHED: 'PUBLISHED',
      ARCHIVED: 'ARCHIVED',
    },
  };
});

// Mock Redis
vi.mock('ioredis', () => {
  const mockRedis = {
    status: 'ready',
    on: vi.fn(),
    once: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    ttl: vi.fn(),
    keys: vi.fn(),
    ping: vi.fn().mockResolvedValue('PONG'),
    quit: vi.fn().mockResolvedValue('OK'),
  };

  return {
    default: vi.fn(() => mockRedis),
  };
});

// Mock BullMQ
vi.mock('bullmq', () => ({
  Queue: vi.fn(() => ({
    add: vi.fn(),
    close: vi.fn(),
  })),
  Worker: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock SendGrid
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }]),
  },
}));

beforeAll(() => {
  // Global setup
});

afterAll(() => {
  // Global cleanup
});

beforeEach(() => {
  vi.clearAllMocks();
});
