import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

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

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['dev', 'combined', 'common', 'short', 'tiny']).default('dev'),

  // Grounded website assistant
  RAG_GENERATION_PROVIDER: z.enum(['ollama', 'openai', 'extractive']).default('ollama'),
  OLLAMA_BASE_URL: z.string().url().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().default('qwen3.5:4b'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-5-nano'),
  OPENAI_VECTOR_STORE_ID: z.string().optional(),
  RAG_CORPUS_PATH: z.string().default('../roaya-website/rag/corpus.json'),
  RAG_ENABLE_CMS: z.string().default('true').transform((value) => value === 'true'),
  RAG_ENABLE_VECTOR_SEARCH: z.string().default('false').transform((value) => value === 'true'),
  RAG_MAX_RESULTS: z.string().default('4').transform(Number),
  RAG_MAX_CONTEXT_CHARS: z.string().default('4200').transform(Number),
  RAG_MAX_OUTPUT_TOKENS: z.string().default('320').transform(Number),
  RAG_CACHE_TTL_MS: z.string().default('600000').transform(Number),
  RAG_CACHE_MAX_ENTRIES: z.string().default('200').transform(Number),
  RAG_VECTOR_SCORE_THRESHOLD: z.string().default('0.58').transform(Number),
  RAG_LOCAL_SCORE_THRESHOLD: z.string().default('0.34').transform(Number),

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
    fromEmail: env.SENDGRID_FROM_EMAIL,
    fromName: env.SENDGRID_FROM_NAME,
    adminEmail: env.ADMIN_NOTIFICATION_EMAIL,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    formMaxRequests: env.FORM_RATE_LIMIT_MAX,
    loginMaxRequests: env.LOGIN_RATE_LIMIT_MAX,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    vectorStoreId: env.OPENAI_VECTOR_STORE_ID,
  },
  ollama: {
    baseUrl: env.OLLAMA_BASE_URL.replace(/\/$/, ''),
    model: env.OLLAMA_MODEL,
  },
  rag: {
    corpusPath: env.RAG_CORPUS_PATH,
    generationProvider: env.RAG_GENERATION_PROVIDER,
    enableCms: env.RAG_ENABLE_CMS,
    enableVectorSearch: env.RAG_ENABLE_VECTOR_SEARCH,
    maxResults: env.RAG_MAX_RESULTS,
    maxContextChars: env.RAG_MAX_CONTEXT_CHARS,
    maxOutputTokens: env.RAG_MAX_OUTPUT_TOKENS,
    cacheTtlMs: env.RAG_CACHE_TTL_MS,
    cacheMaxEntries: env.RAG_CACHE_MAX_ENTRIES,
    vectorScoreThreshold: env.RAG_VECTOR_SCORE_THRESHOLD,
    localScoreThreshold: env.RAG_LOCAL_SCORE_THRESHOLD,
  },
  dataRetention: {
    recordingRetentionDays: env.RECORDING_RETENTION_DAYS,
    dataRetentionDays: env.DATA_RETENTION_DAYS,
    sessionRetentionDays: env.SESSION_RETENTION_DAYS,
  },
} as const;

export type Config = typeof config;
