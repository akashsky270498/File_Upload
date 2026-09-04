import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JwtPayload } from '../../common/utils/jwt';
import { userService } from '../users/users.service';
import { userRepository } from '../users/users.repository';
import { IUserResponse, sanitizeUser } from '../users/user.interface';
import { RegisterInput, LoginInput, AuthResponseData, TokenRefreshResponse, ChangePasswordInput } from './auth.interface';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../common/errors/customErrors';

export class AuthService {
  public async register(input: RegisterInput): Promise<AuthResponseData> {
    const existingUser = await userService.findByEmail(input.email);
    if (existingUser) {
      throw new BadRequestError('User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await userService.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userService.addRefreshToken(user._id.toString(), refreshToken);

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  public async login(input: LoginInput): Promise<AuthResponseData> {
    const user = await userService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email address or password.');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email address or password.');
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userService.addRefreshToken(user._id.toString(), refreshToken);

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  public async refreshTokens(refreshToken: string): Promise<TokenRefreshResponse> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required.');
    }

    try {
      const decoded = verifyRefreshToken(refreshToken) as JwtPayload;
      const isValid = await userService.verifyRefreshToken(decoded.userId, refreshToken);
      if (!isValid) {
        throw new UnauthorizedError('Invalid refresh token.');
      }

      await userService.removeRefreshToken(decoded.userId, refreshToken);

      const payload = { userId: decoded.userId, email: decoded.email };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      await userService.addRefreshToken(decoded.userId, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: unknown) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  public async logout(userId: string, refreshToken: string): Promise<void> {
    if (refreshToken) {
      await userService.removeRefreshToken(userId, refreshToken);
    }
  }

  public async getProfile(userId: string): Promise<IUserResponse> {
    const user = await userService.getProfile(userId);
    return sanitizeUser(user);
  }

  public async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await userService.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(input.newPassword, salt);

    await userRepository.updateUser(userId, { passwordHash: newPasswordHash });
  }
}

export const authService = new AuthService();

