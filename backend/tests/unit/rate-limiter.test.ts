import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Request } from 'express';

// Small window so the integration block below trips the limit quickly.
// RATE_LIMIT_* env defaults are untouched; this only shapes the test limiter.
vi.mock('../../src/config/environment.js', () => ({
  config: {
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 3,
      formMaxRequests: 5,
      loginMaxRequests: 5,
    },
  },
}));

vi.mock('../../src/shared/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  isLoopbackIp,
  isTrustedLoopbackRead,
  apiRateLimiter,
} from '../../src/presentation/middleware/rate-limiter.js';

function fakeReq(opts: { method: string; ip?: string; peer?: string; noSocket?: boolean }): Request {
  const req: Record<string, unknown> = { method: opts.method, ip: opts.ip };
  if (!opts.noSocket) {
    req['socket'] = { remoteAddress: opts.peer ?? opts.ip };
  }
  return req as unknown as Request;
}

describe('isLoopbackIp', () => {
  it.each([
    '127.0.0.1',
    '127.0.0.2',
    '127.255.255.254',
    '::1',
    '::ffff:127.0.0.1',
    '::FFFF:127.0.0.1',
    '::ffff:7f00:1',
    '::1%lo0',
    '[::1]',
    ' 127.0.0.1 ',
  ])('returns true for loopback %s', (ip) => {
    expect(isLoopbackIp(ip)).toBe(true);
  });

  it.each([
    '10.0.0.1',
    '192.168.1.10',
    '203.0.113.5',
    '128.0.0.1',
    '126.255.255.255',
    '1270.0.0.1',
    '127.0.0.1.evil',
    '::ffff:10.0.0.1',
    '::ffff:203.0.113.5',
    '::2',
    '2001:db8::1',
    'localhost',
    '',
  ])('returns false for non-loopback %s', (ip) => {
    expect(isLoopbackIp(ip)).toBe(false);
  });

  it('returns false for undefined and null', () => {
    expect(isLoopbackIp(undefined)).toBe(false);
    expect(isLoopbackIp(null)).toBe(false);
  });
});

describe('isTrustedLoopbackRead (apiRateLimiter skip predicate)', () => {
  it('skips a GET whose client and peer are both loopback (SSR render)', () => {
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '127.0.0.1' }))).toBe(true);
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '::1' }))).toBe(true);
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '::ffff:127.0.0.1' }))).toBe(true);
  });

  it('skips a loopback HEAD', () => {
    expect(isTrustedLoopbackRead(fakeReq({ method: 'HEAD', ip: '127.0.0.1' }))).toBe(true);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])(
    'does not skip a loopback %s (writes stay limited)',
    (method) => {
      expect(isTrustedLoopbackRead(fakeReq({ method, ip: '127.0.0.1' }))).toBe(false);
    }
  );

  it('does not skip a GET from a public client IP', () => {
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '203.0.113.5' }))).toBe(false);
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '::ffff:203.0.113.5' }))).toBe(false);
  });

  it('does not skip a GET from a public client proxied by nginx (peer loopback, req.ip public)', () => {
    expect(
      isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '203.0.113.5', peer: '127.0.0.1' }))
    ).toBe(false);
  });

  it('does not skip when req.ip is loopback but the TCP peer is remote (spoofed X-Forwarded-For)', () => {
    expect(
      isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '127.0.0.1', peer: '203.0.113.5' }))
    ).toBe(false);
  });

  it('does not skip when req.ip is missing', () => {
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: undefined, peer: '127.0.0.1' }))).toBe(false);
  });

  it('relies on req.ip alone when no socket is attached', () => {
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '127.0.0.1', noSocket: true }))).toBe(true);
    expect(isTrustedLoopbackRead(fakeReq({ method: 'GET', ip: '203.0.113.5', noSocket: true }))).toBe(false);
  });
});

/**
 * Production topology, in-process: supertest connects over loopback (like the
 * SSR process). Requests carrying X-Forwarded-For stand in for nginx-proxied
 * public traffic; app.set('trust proxy', 1) mirrors app.ts.
 */
describe('apiRateLimiter with the loopback skip (express + supertest)', () => {
  function buildApp() {
    const app = express();
    app.set('trust proxy', 1);
    app.use(apiRateLimiter);
    app.get('/ping', (_req, res) => {
      res.json({ ok: true });
    });
    app.post('/ping', (_req, res) => {
      res.json({ ok: true });
    });
    return app;
  }

  it('never limits loopback GETs, still limits loopback POSTs, and the two do not share a bucket', async () => {
    const app = buildApp();

    // 10 > max(3): loopback GETs are neither counted nor limited, and carry no RateLimit headers.
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/ping');
      expect(res.status).toBe(200);
      expect(res.headers['ratelimit-limit']).toBeUndefined();
    }

    // Loopback POSTs are counted: 3 allowed, 4th rejected.
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/ping').send({});
      expect(res.status).toBe(200);
      expect(res.headers['ratelimit-limit']).toBe('3');
    }
    const blocked = await request(app).post('/ping').send({});
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' },
    });

    // The exhausted loopback bucket does not affect loopback GETs.
    const stillOk = await request(app).get('/ping');
    expect(stillOk.status).toBe(200);
  });

  it('limits GETs from a public client IP carried in X-Forwarded-For (nginx-proxied traffic)', async () => {
    const app = buildApp();
    const clientIp = '203.0.113.10';

    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/ping').set('X-Forwarded-For', clientIp);
      expect(res.status).toBe(200);
      expect(res.headers['ratelimit-limit']).toBe('3');
      expect(res.headers['ratelimit-remaining']).toBe(String(3 - (i + 1)));
    }

    const blocked = await request(app).get('/ping').set('X-Forwarded-For', clientIp);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('is not bypassed by a client prepending 127.0.0.1 to X-Forwarded-For behind nginx', async () => {
    const app = buildApp();
    // nginx's $proxy_add_x_forwarded_for appends the real client after any
    // client-supplied chain; trust proxy 1 resolves req.ip to that last hop.
    const spoofed = '127.0.0.1, 203.0.113.11';

    for (let i = 0; i < 3; i++) {
      const res = await request(app).get('/ping').set('X-Forwarded-For', spoofed);
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).get('/ping').set('X-Forwarded-For', spoofed);
    expect(blocked.status).toBe(429);
  });

  it('keeps separate buckets per public client IP', async () => {
    const app = buildApp();

    for (let i = 0; i < 3; i++) {
      await request(app).get('/ping').set('X-Forwarded-For', '203.0.113.20');
    }
    expect((await request(app).get('/ping').set('X-Forwarded-For', '203.0.113.20')).status).toBe(429);
    expect((await request(app).get('/ping').set('X-Forwarded-For', '203.0.113.21')).status).toBe(200);
  });
});
