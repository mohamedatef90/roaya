import { Request, Response, NextFunction } from 'express';
import { AppError, isAppError, ValidationError } from '../../domain/exceptions/index.js';
import { logger } from '../../shared/utils/logger.js';
import { config } from '../../config/environment.js';
import { ApiResponse } from '../../shared/types/index.js';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  // Log error
  if (isAppError(error) && error.isOperational) {
    logger.warn('Operational error', {
      code: error.code,
      message: error.message,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unexpected error', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle different error types
  if (isAppError(error)) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    // Add validation details if present
    if (error instanceof ValidationError) {
      response.error!.details = error.details;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.app.isProduction
        ? 'An unexpected error occurred'
        : error.message,
    },
  };

  res.status(500).json(response);
}

// 404 handler
export function notFoundHandler(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
