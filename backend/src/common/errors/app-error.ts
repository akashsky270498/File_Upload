// ==========================================
// 🚨 CUSTOM APPLICATION ERROR CLASSES
// ==========================================
// Ye file standard custom operational errors define karti hai (HTTP Status Codes aur Error Codes ke saath).

// Base Application Error Class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found Error (Jab resource na mile)
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

// 400 Bad Request / Validation Error (Invalid input data)
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// 401 Unauthorized Error (Token missing/invalid/expired)
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// 403 Forbidden Error (Role/Permissions permission restricted)
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden resource') {
    super(message, 403, 'FORBIDDEN');
  }
}

// 409 Conflict Error (Duplicate email or mobile number)
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict detected') {
    super(message, 409, 'CONFLICT');
  }
}

