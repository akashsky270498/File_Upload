import streamifier from 'streamifier';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { IUser, UpdateUserProfileInput } from './user.interface';
import { userRepository, UserRepository } from './users.repository';
import { NotFoundError, BadRequestError } from '../../common/errors/customErrors';
import { cloudinary } from '../../config/cloudinary.config';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}

export class UserService {
  private repo: UserRepository;

  constructor(repo: UserRepository = userRepository) {
    this.repo = repo;
  }

  private uploadAvatarToCloudinary(buffer: Buffer, originalName: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'multimedia_app/avatars',
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          filename_override: originalName,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(new BadRequestError(`Avatar upload failed: ${error?.message || 'Unknown error'}`));
          }
          resolve(result);
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  public async findById(id: string): Promise<IUser | null> {
    return this.repo.findById(id);
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.repo.findByEmail(email);
  }

  public async createUser(data: CreateUserData): Promise<IUser> {
    return this.repo.createUser(data);
  }

  public async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.repo.addRefreshToken(userId, refreshToken);
  }

  public async removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.repo.removeRefreshToken(userId, refreshToken);
  }

  public async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    return this.repo.verifyRefreshToken(userId, refreshToken);
  }

  public async getProfile(userId: string): Promise<IUser> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }
    return user;
  }

  public async updateProfile(
    userId: string,
    input: UpdateUserProfileInput,
    avatarFile?: Express.Multer.File
  ): Promise<IUser> {
    let avatarUrl = input.avatarUrl;

    if (avatarFile) {
      const uploadResult = await this.uploadAvatarToCloudinary(avatarFile.buffer, avatarFile.originalname);
      avatarUrl = uploadResult.secure_url;
    }

    const updatedUser = await this.repo.updateUser(userId, {
      name: input.name,
      avatarUrl,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found.');
    }

    return updatedUser;
  }
}

export const userService = new UserService();
