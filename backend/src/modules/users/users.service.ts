import { usersRepository, UsersRepository } from './users.repository';
import { UserProfileResponse, UpdateProfileDTO } from './users.interface';
import { NotFoundError, ConflictError, ValidationError } from '../../common/errors/app-error';
import { cloudinaryService, CloudinaryService } from '../../config/cloudinary';
import { logger } from '../../common/logger';
import { User } from '../../infrastructure/postgres/models/user.model';

export class UsersService {
  constructor(
    private readonly repository: UsersRepository = usersRepository,
    private readonly cloudinary: CloudinaryService = cloudinaryService
  ) {}

  /**
   * Update user profile information & optional avatar
   */
  public async updateProfile(
    userId: string,
    dto: UpdateProfileDTO,
    avatarFile?: Express.Multer.File
  ): Promise<UserProfileResponse> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const updates: Partial<User> = {};

    if (dto.firstName !== undefined && dto.firstName !== null) {
      const trimmed = dto.firstName.trim();
      if (!trimmed) throw new ValidationError('First name cannot be empty');
      updates.firstName = trimmed;
    }

    if (dto.lastName !== undefined && dto.lastName !== null) {
      const trimmed = dto.lastName.trim();
      if (!trimmed) throw new ValidationError('Last name cannot be empty');
      updates.lastName = trimmed;
    }

    if (dto.mobileNumber !== undefined && dto.mobileNumber !== null) {
      const trimmedMobile = dto.mobileNumber.trim();
      if (trimmedMobile && trimmedMobile !== user.mobileNumber) {
        const existing = await this.repository.findByMobileNumber(trimmedMobile);
        if (existing && existing.id !== userId) {
          throw new ConflictError('Mobile number is already associated with another account');
        }
        updates.mobileNumber = trimmedMobile;
      }
    }

    // Direct profile image URL update if passed in body
    if (dto.profileImage) {
      updates.profileImage = dto.profileImage;
    }

    // File avatar upload takes precedence if uploaded via multipart/form-data
    if (avatarFile) {
      try {
        const result = await this.cloudinary.uploadStream(avatarFile.buffer, 'avatars', 'image');
        updates.profileImage = result.secure_url;
        logger.info({ userId, publicId: result.public_id }, 'Avatar image uploaded successfully to Cloudinary');
      } catch (err) {
        logger.warn({ userId, err }, 'Cloudinary avatar upload failed, continuing with other updates if present');
      }
    }

    const updatedUser = await this.repository.updateUser(userId, updates);
    if (!updatedUser) {
      throw new NotFoundError('User not found after update');
    }

    return this.mapToResponse(updatedUser);
  }

  /**
   * Map database User model to UserProfileResponse DTO
   */
  private mapToResponse(user: User): UserProfileResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber || undefined,
      role: user.role,
      status: user.status,
      profileImage: user.profileImage || undefined,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}

export const usersService = new UsersService();
