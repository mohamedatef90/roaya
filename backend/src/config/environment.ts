import { z } from 'zod';
import dotenv from 'dotenv';

// Local project settings should take precedence over machine-wide variables
// during development. Production keeps the host environment authoritative.
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ override: process.env.NODE_ENV !== 'production' });
}
// Private local SMTP settings; production uses its server environment/.env.
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: '.env.local', override: true });
}

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CSRF
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters').optional(),

  // SMTP (takes precedence over SendGrid when configured)
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().default('465').transform(Number).pipe(z.number().int().min(1).max(65535)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),
  FORMS_RECEIVER: z.string().email().optional(),

  // SendGrid
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().default('noreply@roaya.ai'),
  SENDGRID_FROM_NAME: z.string().default('Roaya AI'),

  // Admin Notifications
  ADMIN_NOTIFICATION_EMAIL: z.string().email().default('admin@roaya.ai'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
  FORM_RATE_LIMIT_MAX: z.string().default('5').transform(Number),
  LOGIN_RATE_LIMIT_MAX: z.string().default('5').transform(Number),

  // CORS — comma-separated list. First origin is used for links in emails.
  // Angular dev server is http://localhost:4200 (also opened as 127.0.0.1).
  CORS_ORIGIN: z.string().default('http://localhost:4200,http://127.0.0.1:4200'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['dev', 'combined', 'common', 'short', 'tiny']).default('dev'),

  // Data Retention (for analytics cleanup cron)
  RECORDING_RETENTION_DAYS: z.string().default('30').transform(Number),
  DATA_RETENTION_DAYS: z.string().default('90').transform(Number),
  SESSION_RETENTION_DAYS: z.string().default('180').transform(Number),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('Environment validation failed:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  
  return parsed.data;
}

export const env = validateEnv();

export const config = {
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    apiVersion: env.API_VERSION,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  jwt: {
    secret: env.JWT_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },
  csrf: {
    secret: env.CSRF_SECRET || env.JWT_SECRET, // Use JWT secret as fallback
  },
  email: {
    sendgridApiKey: env.SENDGRID_API_KEY,
    fromEmail: env.MAIL_FROM ?? env.SENDGRID_FROM_EMAIL,
    fromName: env.SENDGRID_FROM_NAME,
    adminEmail: env.FORMS_RECEIVER ?? env.ADMIN_NOTIFICATION_EMAIL,
    smtp: { host: env.SMTP_HOST, port: env.SMTP_PORT, user: env.SMTP_USER, pass: env.SMTP_PASS },
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    formMaxRequests: env.FORM_RATE_LIMIT_MAX,
    loginMaxRequests: env.LOGIN_RATE_LIMIT_MAX,
  },
  cors: {
    origin: env.CORS_ORIGIN.split(',')[0]?.trim() || 'http://localhost:4200',
    allowedOrigins: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean),
  },
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },
  dataRetention: {
    recordingRetentionDays: env.RECORDING_RETENTION_DAYS,
    dataRetentionDays: env.DATA_RETENTION_DAYS,
    sessionRetentionDays: env.SESSION_RETENTION_DAYS,
  },
} as const;

export type Config = typeof config;
