import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';

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
  UserRole: { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN' },
}));

describe('Public logos API', () => {
  let app: Application;

  beforeAll(async () => {
    app = express();
    app.use('/api/v1/public', (await import('../../src/presentation/routes/public-logo.routes.js')).default);
    app.use('/api/v1/admin', (await import('../../src/presentation/routes/logo.routes.js')).default);
    app.use((error: { statusCode?: number; message?: string }, _req: Request, res: Response, _next: NextFunction) => {
      res.status(error.statusCode || 500).json({ message: error.message });
    });
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

  it('rejects the legacy admin logo list without authentication', async () => {
    const response = await request(app).get('/api/v1/admin/logos?category=CLIENT');

    expect(response.status).toBe(401);

    const { prisma } = await import('../../src/config/database.js');
    expect(prisma.logo.findMany).not.toHaveBeenCalled();
  });
});
