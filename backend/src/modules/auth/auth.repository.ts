import { Op } from 'sequelize';
import { User, UserRole, UserStatus } from '../../infrastructure/postgres/models/user.model';
import { RefreshToken } from '../../infrastructure/postgres/models/refresh-token.model';
import { OtpVerification, OtpType } from '../../infrastructure/postgres/models/otp-verification.model';

export class AuthRepository {
  /**
   * Find user by email or mobile number
   */
  public async findByEmailOrMobile(email: string, mobileNumber?: string): Promise<User | null> {
    return User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          ...(mobileNumber ? [{ mobileNumber }] : []),
        ],
      },
    });
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by primary key ID
   */
  public async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Create a new User
   */
  public async createUser(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    status: UserStatus;
    role: UserRole;
  }): Promise<User> {
    return User.create(userData);
  }

  /**
   * Update last login timestamp for a user
   */
  public async updateLastLogin(user: User): Promise<void> {
    user.lastLoginAt = new Date();
    await user.save();
  }

  /**
   * Update password hash for a user
   */
  public async updateUserPassword(user: User, passwordHash: string): Promise<void> {
    user.passwordHash = passwordHash;
    await user.save();
  }

  /**
   * Create a Refresh Token record
   */
  public async createRefreshToken(tokenData: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return RefreshToken.create(tokenData);
  }

  /**
   * Find active Refresh Token by user and token hash
   */
  public async findRefreshToken(userId: string, tokenHash: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { userId, tokenHash },
    });
  }

  /**
   * Find Refresh Token by token hash alone
   */
  public async findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return RefreshToken.findOne({
      where: { tokenHash },
    });
  }

  /**
   * Revoke a Refresh Token
   */
  public async revokeRefreshToken(refreshToken: RefreshToken): Promise<void> {
    refreshToken.revokedAt = new Date();
    await refreshToken.save();
  }

  /**
   * Clean/delete active OTPs for a given identifier and type
   */
  public async deleteOtpByIdentifier(identifier: string, type: OtpType): Promise<number> {
    return OtpVerification.destroy({
      where: { identifier: identifier.toLowerCase(), type },
    });
  }

  /**
   * Create a new OTP record
   */
  public async createOtpVerification(otpData: {
    userId?: string;
    identifier: string;
    otpHash: string;
    type: OtpType;
    expiresAt: Date;
    attempts: number;
  }): Promise<OtpVerification> {
    return OtpVerification.create(otpData);
  }

  /**
   * Find OTP record by identifier and type
   */
  public async findOtp(identifier: string, type: OtpType): Promise<OtpVerification | null> {
    return OtpVerification.findOne({
      where: { identifier: identifier.toLowerCase(), type },
    });
  }

  /**
   * Increment failed attempts for an OTP
   */
  public async incrementOtpAttempts(otpRecord: OtpVerification): Promise<void> {
    otpRecord.attempts += 1;
    await otpRecord.save();
  }

  /**
   * Delete an OTP record after verification or expiry
   */
  public async deleteOtp(otpRecord: OtpVerification): Promise<void> {
    await otpRecord.destroy();
  }

  /**
   * Revoke all active refresh tokens for a user (on password reset)
   */
  public async revokeAllUserRefreshTokens(userId: string): Promise<number> {
    const [affectedCount] = await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } }
    );
    return affectedCount;
  }

  /**
   * Save OTP record by clearing old active OTPs for the identifier/type and creating new
   */
  public async saveOtp(otpData: {
    userId?: string;
    identifier: string;
    otpHash: string;
    type: OtpType;
    expiresAt: Date;
  }): Promise<OtpVerification> {
    await this.deleteOtpByIdentifier(otpData.identifier, otpData.type);
    return this.createOtpVerification({
      ...otpData,
      attempts: 0,
    });
  }
}

export const authRepository = new AuthRepository();
