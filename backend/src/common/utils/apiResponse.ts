import { Response } from 'express';
import { ApiResponse, PaginationMeta, ValidationErrorDetail } from '../types/apiResponse.interface';

export const sendResponse = <T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: PaginationMeta,
  errors?: ValidationErrorDetail[]
): Response => {
  const isSuccess = statusCode >= 200 && statusCode < 300;

  const responseBody: ApiResponse<T> = {
    success: isSuccess,
    statusCode,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
    ...(errors !== undefined && { errors }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(responseBody);
};
