import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './config/environment.js';
import { apiRateLimiter } from './presentation/middleware/rate-limiter.js';
import { errorHandler, notFoundHandler } from './presentation/middleware/error-handler.js';
import { csrfProtection, csrfErrorHandler, attachCsrfToken } from './presentation/middleware/csrf.js';
import { responseTimeTracker } from './presentation/middleware/response-time-tracker.js';
import { morganStream } from './shared/utils/logger.js';
import routes from './presentation/routes/index.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
}));

// Compression
app.use(compression());

// Cookie parsing (must be before CSRF)
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(config.logging.format, { stream: morganStream }));

// Response time tracking for metrics (Feature 3)
app.use(responseTimeTracker);

// CSRF protection (applied to all routes except GET/HEAD/OPTIONS)
app.use(csrfProtection);
app.use(attachCsrfToken);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting
app.use(apiRateLimiter);

// API routes
app.use(`/api/${config.app.apiVersion}`, routes);

// Error handling
app.use(csrfErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
