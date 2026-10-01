import { describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ sendMail: vi.fn(), template: vi.fn() }));
vi.mock('../../src/config/environment.js', () => ({ config: {
  email: { smtp: { host: 'smtp.example.test', port: 465, user: 'test', pass: 'dummy' },
    fromEmail: 'sender@example.test', fromName: 'Roaya', adminEmail: 'inbox@example.test' },
  cors: { origin: 'https://example.test' },
} }));
vi.mock('../../src/shared/utils/logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));
vi.mock('../../src/config/database.js', () => ({ prisma: { emailTemplate: { findUnique: mocks.template } } }));
vi.mock('../../src/config/redis.js', () => ({ redis: {} }));
vi.mock('../../src/infrastructure/email/sendgrid.client.js', () => ({ sendgridClient: { send: vi.fn() } }));
vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn(() => ({ sendMail: mocks.sendMail })) } }));

import { emailService } from '../../src/application/services/email.service.js';
import { emailQueue, emailQueueInstance } from '../../src/infrastructure/email/email-queue.js';

describe('SMTP form notifications', () => {
  it('sends all answers to the fixed inbox and escapes user HTML without a database template', async () => {
    mocks.sendMail.mockResolvedValue({ accepted: ['inbox@example.test'], rejected: [] });
    const success = await emailService.sendAdminNewLeadNotification({
      id: 'lead-1', firstName: '<script>alert(1)</script>', lastName: 'Test',
      email: 'visitor@example.test', source: 'CONTACT_FORM',
      formData: { service: 'Cloud', budget: 100 }, createdAt: '2026-10-01T10:00:00Z',
    });
    expect(success).toBe(true);
    expect(mocks.template).not.toHaveBeenCalled();
    const message = mocks.sendMail.mock.calls[0]![0];
    expect(message.to).toBe('inbox@example.test');
    expect(message.from.address).toBe('sender@example.test');
    expect(message.text).toContain('visitor@example.test');
    expect(message.text).toContain('Cloud');
    expect(message.text).toContain('2026-10-01T10:00:00.000Z');
    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script&gt;');
  });

  it('reports SMTP rejection as failure so the existing queue can retry', async () => {
    mocks.sendMail.mockResolvedValue({ accepted: [], rejected: ['inbox@example.test'] });
    expect(await emailService.sendEmail({ to: 'inbox@example.test', subject: 'Test', html: '', text: 'test' })).toBe(false);
  });

  it('reports transport failure instead of marking an unsent message successful', async () => {
    mocks.sendMail.mockRejectedValue(new Error('SMTP unavailable'));
    expect(await emailService.sendEmail({ to: 'inbox@example.test', subject: 'Test', html: '', text: 'test' })).toBe(false);
  });

  it('carries custom answers, submission time and extra fields into the notification queue', async () => {
    await emailQueue.addAdminNotificationEmail({ id: 'lead-2', firstName: 'Test', lastName: 'Person',
      email: 'visitor@example.test', source: 'CONTACT_FORM', formData: { service: 'Cloud' },
      createdAt: '2026-10-01T10:00:00Z', jobTitle: 'Engineer', website: 'https://example.test' });
    expect(emailQueueInstance.add).toHaveBeenCalledWith('admin_notification', expect.objectContaining({
      createdAt: '2026-10-01T10:00:00Z',
      formData: { answers: { service: 'Cloud' }, jobTitle: 'Engineer', website: 'https://example.test' },
    }));
  });
});
