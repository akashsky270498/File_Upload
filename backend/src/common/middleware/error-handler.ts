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
  if (err instanceof AppError) {
    logger.warn({ errorCode: err.errorCode, message: err.message }, 'Operational error caught');
    res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    });
    return;
  }

  logger.error({ err }, 'Unhandled system error caught');
  res.status(500).json({
    success: false,
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: env.nodeEnv === 'production' ? 'An unexpected error occurred' : err.message,
  });
};
