import { ValidationErrorDetail } from '../types/apiResponse.interface';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: ValidationErrorDetail[];

  constructor(message: string, statusCode: number = 500, errors?: ValidationErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden resource') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class CustomValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: ValidationErrorDetail[]) {
    super(message, 422, errors);
  }
}
