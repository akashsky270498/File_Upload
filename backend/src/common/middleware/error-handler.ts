// ==========================================
// 🚨 CENTRALIZED ERROR HANDLER MIDDLEWARE
// ==========================================
// Ye middleware Express Application me aane waale sabhi errors catch karke uniform JSON error response return karta hai.

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { logger } from '../logger';
import { env } from '../../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Operational Known Errors (e.g. ValidationError, UnauthorizedError, ConflictError)
  if (err instanceof AppError) {
    logger.warn({ errorCode: err.errorCode, message: err.message }, 'Operational error caught');
    res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    });
    return;
  }

  // Unexpected System / Unhandled Server Errors (500)
  logger.error({ err }, 'Unhandled system error caught');
  res.status(500).json({
    success: false,
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: env.nodeEnv === 'production' ? 'An unexpected error occurred' : err.message,
  });
};

