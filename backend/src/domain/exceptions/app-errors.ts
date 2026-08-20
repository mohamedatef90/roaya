// Base Application Error
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  readonly code: string = 'APP_ERROR';
  readonly isOperational: boolean = true;
  readonly timestamp: Date = new Date();

  constructor(message: string, public details?: unknown) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

// 400 - Bad Request Errors
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code: string = 'VALIDATION_ERROR';

  constructor(details: Array<{ field: string; message: string }>) {
    super('Invalid input data', details);
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code: string = 'BAD_REQUEST';
}

// 401 - Unauthorized
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code: string = 'UNAUTHORIZED';

  constructor(message: string = 'Authentication required') {
    super(message);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  readonly code: string = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid email or password');
  }
}

export class TokenExpiredError extends UnauthorizedError {
  readonly code: string = 'TOKEN_EXPIRED';

  constructor() {
    super('Token has expired');
  }
}

export class InvalidTokenError extends UnauthorizedError {
  readonly code: string = 'INVALID_TOKEN';

  constructor() {
    super('Invalid or malformed token');
  }
}

// 403 - Forbidden
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code: string = 'FORBIDDEN';

  constructor(message: string = 'Insufficient permissions') {
    super(message);
  }
}

export class AccountLockedError extends ForbiddenError {
  readonly code: string = 'ACCOUNT_LOCKED';

  constructor(public readonly lockedUntil: Date) {
    super(`Account is locked until ${lockedUntil.toISOString()}`);
  }
}

// 404 - Not Found
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code: string = 'NOT_FOUND';

  constructor(resource: string, identifier?: string) {
    super(identifier ? `${resource} with identifier '${identifier}' not found` : resource);
  }
}

export class LeadNotFoundError extends NotFoundError {
  constructor(leadId: string) {
    super('Lead', leadId);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super('User', userId);
  }
}

// 409 - Conflict
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code: string = 'CONFLICT';
}

export class DuplicateEmailError extends ConflictError {
  readonly code: string = 'DUPLICATE_EMAIL';

  constructor(email: string) {
    super(`Email '${email}' is already registered`);
  }
}

// 429 - Too Many Requests
export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly code: string = 'RATE_LIMIT_EXCEEDED';

  constructor(public readonly retryAfter?: number) {
    super('Too many requests. Please try again later.');
  }
}

// 500 - Internal Server Error
export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly code: string = 'INTERNAL_SERVER_ERROR';
  readonly isOperational: boolean = false;

  constructor(message: string = 'An unexpected error occurred', details?: unknown) {
    super(message, details);
  }
}

export class DatabaseError extends InternalServerError {
  readonly code: string = 'DATABASE_ERROR';

  constructor(originalError: Error) {
    super('Database operation failed', { originalError: originalError.message });
  }
}

export class EmailDeliveryError extends InternalServerError {
  readonly code: string = 'EMAIL_DELIVERY_ERROR';
  readonly isOperational: boolean = true;

  constructor(recipient: string, originalError?: Error) {
    super(
      `Failed to send email to ${recipient}`,
      originalError ? { originalError: originalError.message } : undefined,
    );
  }
}

// 503 - Service Unavailable
export class ServiceUnavailableError extends AppError {
  readonly statusCode = 503;
  readonly code: string = 'SERVICE_UNAVAILABLE';

  constructor(serviceName: string) {
    super(`${serviceName} is temporarily unavailable`);
  }
}
