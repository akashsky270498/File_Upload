// ==========================================
// 🛡️ AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ==========================================
// Ye middleware API requests par JWT Token Authentication (HttpOnly Cookie / Bearer Header) aur User Role Authorization check karta hai.

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { UserRole } from '../../infrastructure/postgres/models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * 1. JWT Access Token Authentication Guard
 * Pehle HttpOnly cookie (`accessToken`) check karta hai, fallbacks to `Authorization: Bearer <token>` header.
 */
export const authenticateJwt = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  let token: string | undefined = req.cookies?.accessToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Access token is missing or unauthorized'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // Decoded payload (userId, email, role) req.user par assign kar dete hain
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};

/**
 * 2. Role-Based Access Control (RBAC) Guard (e.g., ADMIN only routes protection)
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
};

