import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserRole } from '../../infrastructure/postgres/models/user.model';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwt.accessExpiration as any,
  };
  return jwt.sign(payload, env.jwt.accessSecret, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpiration as any,
  };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
};
