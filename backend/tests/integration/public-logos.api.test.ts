import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Application } from 'express';

vi.mock('../../src/config/database.js', () => ({
  prisma: {
    logo: {
      findMany: vi.fn(),
    },
  },
  connectDatabase: vi.fn(),
  disconnectDatabase: vi.fn(),
  healthCheck: vi.fn().mockResolvedValue(true),
}));

vi.mock('@prisma/client', () => ({
  LogoCategory: { CLIENT: 'CLIENT', PARTNER: 'PARTNER', TECHNOLOGY: 'TECHNOLOGY', CERTIFICATION: 'CERTIFICATION' },
  EmailTemplateCategory: { TRANSACTIONAL: 'TRANSACTIONAL', MARKETING: 'MARKETING', NOTIFICATION: 'NOTIFICATION' },
}));

describe('Public logos API', () => {
  let app: Application;

  beforeAll(async () => {
    app = express();
    app.use('/api/v1/public', (await import('../../src/presentation/routes/public-logo.routes.js')).default);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    const { prisma } = await import('../../src/config/database.js');
    vi.mocked(prisma.logo.findMany).mockResolvedValue([
      { id: 'active-client', name: 'Active client', category: 'CLIENT', isActive: true },
    ] as never);
  });

  it('returns active client logos without authentication', async () => {
    const response = await request(app).get('/api/v1/public/logos?category=CLIENT');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: [{ id: 'active-client', name: 'Active client', category: 'CLIENT', isActive: true }],
    });

    const { prisma } = await import('../../src/config/database.js');
    expect(prisma.logo.findMany).toHaveBeenCalledWith({
      where: { category: 'CLIENT', isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  });
});
