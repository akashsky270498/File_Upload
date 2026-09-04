import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/authenticatedRequest.interface';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../errors/customErrors';

export const authGuard = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is missing or malformed.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return next(new UnauthorizedError(`Authentication failed: ${message}`));
  }
};
