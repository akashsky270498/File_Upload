import crypto from 'crypto';
import { UserRole, UserStatus } from '../../infrastructure/postgres/models/user.model';
import { OtpType } from '../../infrastructure/postgres/models/otp-verification.model';
import { hashPassword, comparePassword } from '../../common/utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../../common/errors/app-error';
import { logger } from '../../common/logger';
import { authRepository, AuthRepository } from './auth.repository';
import {
  RegisterDTO,
  AuthTokensResponse,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from './auth.interface';
import { rabbitMQProducer } from '../../infrastructure/rabbitmq/rabbitmq.producer';
import { kafkaProducerService } from '../../infrastructure/kafka/kafka.producer';

export class AuthService {
  constructor(private readonly repository: AuthRepository = authRepository) {}

  /**
   * Register a new User
   */
  public async register(dto: RegisterDTO): Promise<{ id: string; email: string; message: string }> {
    const existingUser = await this.repository.findByEmailOrMobile(dto.email, dto.mobileNumber);
    if (existingUser) {
      throw new ConflictError('A user with this email or mobile number already exists');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.repository.createUser({
      email: dto.email.toLowerCase(),
      passwordHash: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      mobileNumber: dto.mobileNumber || null,
      status: UserStatus.ACTIVE,
      role: UserRole.USER,
    });

    logger.info({ userId: user.id, email: user.email }, 'User registered successfully. Queuing welcome email job...');

    // 1. Publish background job to RabbitMQ email.queue
    await rabbitMQProducer.publishEmailJob('send-welcome-email', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
    });

    // 2. Publish Domain Event to Kafka omnimedia.user.events
    await kafkaProducerService.publishUserEvent('USER_REGISTERED', user.id, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // 3. Publish Audit Event to Kafka omnimedia.audit.events
    await kafkaProducerService.publishAuditEvent('USER_REGISTERED', user.id, {
      resource: 'user',
      resourceId: user.id,
    });

    return {
      id: user.id,
      email: user.email,
      message: 'Registration successful. Welcome email queued.',
    };
  }

  /**
   * Login with Email & Password
   */
  public async login(email: string, password: string): Promise<AuthTokensResponse> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError('Your account has been suspended');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.repository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.repository.updateLastLogin(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Request Login OTP
   */
  public async requestLoginOtp(email: string): Promise<{ message: string }> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new NotFoundError('No user account found with this email address');
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.repository.deleteOtpByIdentifier(email, OtpType.EMAIL_LOGIN);

    await this.repository.createOtpVerification({
      userId: user.id,
      identifier: email.toLowerCase(),
      otpHash,
      type: OtpType.EMAIL_LOGIN,
      expiresAt,
      attempts: 0,
    });

    logger.info({ email, rawOtp }, 'OTP generated for login. Queuing email delivery job...');

    // Publish background job to RabbitMQ email.queue
    await rabbitMQProducer.publishEmailJob('send-login-otp', {
      email,
      otp: rawOtp,
    });

    return {
      message: 'OTP sent to your email address.',
    };
  }

  /**
   * Verify Login OTP & Issue Tokens
   */
  public async verifyLoginOtp(email: string, rawOtp: string): Promise<AuthTokensResponse> {
    const otpRecord = await this.repository.findOtp(email, OtpType.EMAIL_LOGIN);

    if (!otpRecord) {
      throw new ValidationError('No active OTP verification request found');
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.repository.deleteOtp(otpRecord);
      throw new ValidationError('OTP has expired. Please request a new OTP');
    }

    if (otpRecord.attempts >= 3) {
      await this.repository.deleteOtp(otpRecord);
      throw new ValidationError('Maximum OTP verification attempts exceeded. Request a new OTP');
    }

    const inputOtpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    if (inputOtpHash !== otpRecord.otpHash) {
      await this.repository.incrementOtpAttempts(otpRecord);
      throw new ValidationError(`Invalid OTP code. Attempts remaining: ${3 - (otpRecord.attempts + 1)}`);
    }

    const user = await this.repository.findById(otpRecord.userId!);
    if (!user) {
      throw new NotFoundError('User associated with OTP not found');
    }

    await this.repository.deleteOtp(otpRecord);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.repository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.repository.updateLastLogin(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Refresh Token Rotation
   */
  public async refreshTokens(incomingRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const incomingHash = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');

    const storedToken = await this.repository.findRefreshToken(payload.userId, incomingHash);

    if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token has been revoked or expired');
    }

    await this.repository.revokeRefreshToken(storedToken);

    const user = await this.repository.findById(payload.userId);
    if (!user || user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError('User account suspended or not found');
    }

    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.repository.createRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout (Revoke Refresh Token)
   */
  public async logout(incomingRefreshToken: string): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(incomingRefreshToken).digest('hex');

    const storedToken = await this.repository.findRefreshTokenByHash(tokenHash);
    if (storedToken && !storedToken.revokedAt) {
      await this.repository.revokeRefreshToken(storedToken);
    }

    return { message: 'Logout successful' };
  }

  /**
   * Request Password Reset OTP (Forgot Password)
   */
  public async forgotPassword(dto: ForgotPasswordDTO): Promise<{ message: string }> {
    const user = await this.repository.findByEmail(dto.email);

    // Generic response to prevent email enumeration attack
    if (!user) {
      logger.warn({ email: dto.email }, 'Forgot password requested for non-existing email');
      return {
        message: 'If an account with this email exists, a password reset OTP has been sent.',
      };
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.repository.saveOtp({
      userId: user.id,
      identifier: user.email.toLowerCase(),
      otpHash,
      type: OtpType.PASSWORD_RESET,
      expiresAt,
    });

    logger.info({ email: user.email, rawOtp }, 'Password reset OTP generated. Queuing email delivery...');

    // Publish background job to RabbitMQ email.queue
    await rabbitMQProducer.publishEmailJob('send-password-reset-otp', {
      email: user.email,
      otp: rawOtp,
      firstName: user.firstName,
    });

    return {
      message: 'If an account with this email exists, a password reset OTP has been sent.',
    };
  }

  /**
   * Reset Password using OTP
   */
  public async resetPassword(dto: ResetPasswordDTO): Promise<{ message: string }> {
    const otpRecord = await this.repository.findOtp(dto.email, OtpType.PASSWORD_RESET);

    if (!otpRecord) {
      throw new ValidationError('No active password reset request found or OTP is invalid');
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.repository.deleteOtp(otpRecord);
      throw new ValidationError('Password reset OTP has expired. Please request a new OTP');
    }

    if (otpRecord.attempts >= 3) {
      await this.repository.deleteOtp(otpRecord);
      throw new ValidationError('Maximum OTP verification attempts exceeded. Please request a new OTP');
    }

    const inputOtpHash = crypto.createHash('sha256').update(dto.otp).digest('hex');

    if (inputOtpHash !== otpRecord.otpHash) {
      await this.repository.incrementOtpAttempts(otpRecord);
      throw new ValidationError(`Invalid OTP code. Attempts remaining: ${3 - (otpRecord.attempts + 1)}`);
    }

    const user = await this.repository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundError('User associated with OTP not found');
    }

    // Hash new password & update
    const newPasswordHash = await hashPassword(dto.newPassword);
    await this.repository.updateUserPassword(user, newPasswordHash);

    // Security requirement: Revoke all active refresh tokens for this user
    await this.repository.revokeAllUserRefreshTokens(user.id);

    // Delete OTP record after successful use
    await this.repository.deleteOtp(otpRecord);

    logger.info({ userId: user.id, email: user.email }, 'User password successfully reset. Revoked all sessions.');

    // Audit event
    await kafkaProducerService.publishAuditEvent('PASSWORD_RESET', user.id, {
      resource: 'user',
      resourceId: user.id,
    });

    return {
      message: 'Password reset successful. You can now log in with your new password.',
    };
  }

  /**
   * Change Password (Authenticated User)
   */
  public async changePassword(userId: string, dto: ChangePasswordDTO): Promise<{ message: string }> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError('Your account has been suspended');
    }

    const isCurrentPasswordValid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new ValidationError('New password must be different from current password');
    }

    const newPasswordHash = await hashPassword(dto.newPassword);
    await this.repository.updateUserPassword(user, newPasswordHash);

    // Revoke all active refresh tokens for security
    await this.repository.revokeAllUserRefreshTokens(user.id);

    logger.info({ userId: user.id, email: user.email }, 'User successfully changed password.');

    // Audit event
    await kafkaProducerService.publishAuditEvent('PASSWORD_CHANGED', user.id, {
      resource: 'user',
      resourceId: user.id,
    });

    return {
      message: 'Password changed successfully. Please log in again with your new password.',
    };
  }
}

export const authService = new AuthService();

