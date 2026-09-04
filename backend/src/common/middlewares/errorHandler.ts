import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/customErrors';
import { sendResponse } from '../utils/apiResponse';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    return sendResponse(
      res,
      err.statusCode,
      err.message,
      undefined,
      undefined,
      err.errors
    );
  }

  // Handle Mongoose Duplicate Key Error
  if ('code' in err && err.code === 11000) {
    const duplicateErr = err as unknown as { keyValue?: Record<string, string> };
    const field = duplicateErr.keyValue ? Object.keys(duplicateErr.keyValue)[0] : 'field';
    return sendResponse(
      res,
      400,
      `Duplicate value entered for ${field}. Please use another value.`,
      undefined,
      undefined,
      [{ field, message: `${field} already exists.` }]
    );
  }

  // Handle Multer Errors
  if (err.name === 'MulterError') {
    return sendResponse(res, 400, `Upload error: ${err.message}`);
  }

  console.error('[Unhandled Error]', err);

  return sendResponse(
    res,
    500,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  );
};
