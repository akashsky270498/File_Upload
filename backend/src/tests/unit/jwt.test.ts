import { UserRole } from '../../infrastructure/postgres/models/user.model';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../common/utils/jwt';

describe('JWT Token Utility Unit Tests', () => {
  const payload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@omnimedia.com',
    role: UserRole.USER,
  };

  it('should generate a valid access token and decode payload correctly', () => {
    const accessToken = generateAccessToken(payload);
    expect(accessToken).toBeDefined();

    const decoded = verifyAccessToken(accessToken);
    expect(decoded.userId).toEqual(payload.userId);
    expect(decoded.email).toEqual(payload.email);
    expect(decoded.role).toEqual(payload.role);
  });

  it('should generate a valid refresh token and decode payload correctly', () => {
    const refreshToken = generateRefreshToken(payload);
    expect(refreshToken).toBeDefined();

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toEqual(payload.userId);
    expect(decoded.email).toEqual(payload.email);
  });

  it('should throw an error when verifying an invalid token string', () => {
    expect(() => {
      verifyAccessToken('invalid.jwt.token');
    }).toThrow();
  });
});
