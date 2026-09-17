import streamifier from 'streamifier';
import { Types } from 'mongoose';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { IFile, FileType, UploadFileInput, SearchFilesQueryInput, SearchFilesResult } from './file.interface';
import { fileRepository, FileRepository } from './files.repository';
import { cloudinary } from '../../config/cloudinary.config';
import { notificationService } from '../notifications/notification.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors/customErrors';
import { userService } from '../users/users.service';

export class FileService {
  private repo: FileRepository;

  constructor(repo: FileRepository = fileRepository) {
    this.repo = repo;
  }

  private determineFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    throw new BadRequestError(`Unsupported file MIME type: ${mimeType}`);
  }

  private uploadToCloudinary(
    buffer: Buffer,
    folderName: string,
    resourceType: 'image' | 'video' | 'raw' | 'auto',
    originalName: string
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
          filename_override: originalName,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(new BadRequestError(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`));
          }
          resolve(result);
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  public async uploadFile(input: UploadFileInput): Promise<IFile> {
    const { file, title, description = '', tags = [], uploaderId } = input;

    if (!file) {
      throw new BadRequestError('No file provided for upload.');
    }

    const fileType = this.determineFileType(file.mimetype);

    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (fileType === 'pdf') {
      resourceType = 'raw';
    } else if (fileType === 'audio' || fileType === 'video') {
      resourceType = 'video';
    } else if (fileType === 'image') {
      resourceType = 'image';
    }

    const uploadResult = await this.uploadToCloudinary(
      file.buffer,
      'multimedia_app',
      resourceType,
      file.originalname
    );

    let thumbnailUrl = uploadResult.secure_url;
    if (fileType === 'video') {
      thumbnailUrl = uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg');
    } else if (fileType === 'pdf') {
      thumbnailUrl = '';
    }

    let createdFile: IFile;
    try {
      createdFile = await this.repo.createFile({
        title,
        description,
        originalName: file.originalname,
        tags,
        fileType,
        mimeType: file.mimetype,
        size: file.size,
        cloudinaryId: uploadResult.public_id,
        url: uploadResult.url,
        secureUrl: uploadResult.secure_url,
        thumbnailUrl,
        uploader: new Types.ObjectId(uploaderId),
        viewsCount: 0,
      });
    } catch (dbError) {
      // Rollback: Delete orphan asset from Cloudinary if MongoDB save fails
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: resourceType });
        console.log(`[Rollback Success] Deleted orphan Cloudinary asset: ${uploadResult.public_id}`);
      } catch (rollbackErr) {
        console.error(`[Rollback Error] Failed to destroy Cloudinary asset ${uploadResult.public_id}:`, rollbackErr);
      }
      throw dbError;
    }

    const populatedFile = await this.repo.findById(createdFile._id.toString());
    const resultFile = populatedFile || createdFile;

    const uploaderUser = await userService.findById(uploaderId);
    notificationService.notifyFileUploaded({
      fileId: resultFile._id.toString(),
      title: resultFile.title,
      fileType: resultFile.fileType,
      url: resultFile.secureUrl,
      uploaderName: uploaderUser ? uploaderUser.name : 'Unknown User',
      createdAt: resultFile.createdAt.toISOString(),
    });

    return resultFile;
  }

  public async searchFiles(params: SearchFilesQueryInput): Promise<SearchFilesResult> {
    const {
      query = '',
      fileType = 'all',
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      tags,
    } = params;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filterConditions: Record<string, unknown> = {};

    if (fileType && fileType !== 'all') {
      filterConditions.fileType = fileType;
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      filterConditions.tags = { $in: tagList.map((t) => t.trim()) };
    }

    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(query.trim(), 'i');
      filterConditions.$or = [
        { title: searchRegex },
        { tags: searchRegex },
        { description: searchRegex },
        { originalName: searchRegex },
      ];
    }

    const sortConditions: Record<string, 1 | -1> = {};
    const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'views') {
      sortConditions.viewsCount = sortDirection;
    } else if (sortBy === 'date') {
      sortConditions.createdAt = sortDirection;
    } else if (sortBy === 'size') {
      sortConditions.size = sortDirection;
    } else {
      sortConditions.viewsCount = -1;
      sortConditions.createdAt = -1;
    }

    const total = await this.repo.countFiles(filterConditions);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const files = await this.repo.findFiles({
      filterConditions,
      sortConditions,
      skip,
      limit: limitNum,
    });

    return {
      files,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  }

  public async getFileById(id: string): Promise<IFile> {
    const file = await this.repo.findByIdAndIncrementViews(id);

    if (!file) {
      throw new NotFoundError('Multimedia file not found.');
    }

    return file;
  }

  public async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.repo.findById(id);

    if (!file) {
      throw new NotFoundError('Multimedia file not found.');
    }

    const uploaderObj = file.uploader as unknown as { _id?: Types.ObjectId };
    const fileUploaderId = uploaderObj._id ? uploaderObj._id.toString() : file.uploader.toString();

    if (fileUploaderId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this file.');
    }

    let resourceType: 'image' | 'video' | 'raw' = 'image';
    if (file.fileType === 'pdf') {
      resourceType = 'raw';
    } else if (file.fileType === 'audio' || file.fileType === 'video') {
      resourceType = 'video';
    }

    try {
      await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: resourceType });
    } catch (err: unknown) {
      console.warn(`[Cloudinary Warning] Could not destroy asset ${file.cloudinaryId}`);
    }

    await this.repo.deleteById(id);
  }
}

export const fileService = new FileService();
