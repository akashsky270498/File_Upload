import { FileType } from '../../infrastructure/postgres/models/file.model';
import { IUploadStrategy } from './upload.interface';
import { ValidationError } from '../../common/errors/app-error';

export abstract class BaseUploadStrategy implements IUploadStrategy {
  abstract readonly uploadType: FileType;
  abstract readonly maxSizeBytes: number;
  abstract readonly allowedMimeTypes: string[];
  abstract readonly cloudinaryFolder: string;
  abstract readonly resourceType: 'image' | 'video' | 'raw' | 'auto';

  public validate(file: Express.Multer.File): void {
    if (!file) {
      throw new ValidationError('No file uploaded in the request payload');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      throw new ValidationError(
        `Invalid file MIME type '${file.mimetype}' for upload type ${this.uploadType}. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    if (file.size > this.maxSizeBytes) {
      const maxSizeMB = (this.maxSizeBytes / (1024 * 1024)).toFixed(1);
      throw new ValidationError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${maxSizeMB}MB for ${this.uploadType}`
      );
    }
  }
}

export class ProfileImageStrategy extends BaseUploadStrategy {
  readonly uploadType = FileType.PROFILE_IMAGE;
  readonly maxSizeBytes = 5 * 1024 * 1024; // 5MB
  readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  readonly cloudinaryFolder = 'profiles';
  readonly resourceType = 'image' as const;
}

export class CoverImageStrategy extends BaseUploadStrategy {
  readonly uploadType = FileType.COVER_IMAGE;
  readonly maxSizeBytes = 10 * 1024 * 1024; // 10MB
  readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  readonly cloudinaryFolder = 'covers';
  readonly resourceType = 'image' as const;
}

export class PostMediaStrategy extends BaseUploadStrategy {
  readonly uploadType = FileType.POST_MEDIA;
  readonly maxSizeBytes = 20 * 1024 * 1024; // 20MB
  readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  readonly cloudinaryFolder = 'posts';
  readonly resourceType = 'image' as const;
}

export class DocumentStrategy extends BaseUploadStrategy {
  readonly uploadType = FileType.DOCUMENT;
  readonly maxSizeBytes = 25 * 1024 * 1024; // 25MB
  readonly allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  readonly cloudinaryFolder = 'documents';
  readonly resourceType = 'raw' as const;
}

export class AudioStrategy extends BaseUploadStrategy {
  readonly uploadType = FileType.AUDIO;
  readonly maxSizeBytes = 50 * 1024 * 1024; // 50MB
  readonly allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/mp4'];
  readonly cloudinaryFolder = 'audio';
  readonly resourceType = 'video' as const; // Cloudinary processes audio under video resource_type
}

export class VideoStrategy extends BaseUploadStrategy {
  readonly uploadType = FileType.VIDEO;
  readonly maxSizeBytes = 100 * 1024 * 1024; // 100MB
  readonly allowedMimeTypes = ['video/mp4', 'video/mkv', 'video/webm', 'video/quicktime'];
  readonly cloudinaryFolder = 'videos';
  readonly resourceType = 'video' as const;
}

export class UploadStrategyFactory {
  private static readonly strategies: Map<FileType, IUploadStrategy> = new Map([
    [FileType.PROFILE_IMAGE, new ProfileImageStrategy()],
    [FileType.COVER_IMAGE, new CoverImageStrategy()],
    [FileType.POST_MEDIA, new PostMediaStrategy()],
    [FileType.DOCUMENT, new DocumentStrategy()],
    [FileType.AUDIO, new AudioStrategy()],
    [FileType.VIDEO, new VideoStrategy()],
  ]);

  public static getStrategy(uploadType: FileType): IUploadStrategy {
    const strategy = this.strategies.get(uploadType);
    if (!strategy) {
      throw new ValidationError(
        `Unsupported uploadType '${uploadType}'. Valid upload types: ${Array.from(this.strategies.keys()).join(', ')}`
      );
    }
    return strategy;
  }
}
