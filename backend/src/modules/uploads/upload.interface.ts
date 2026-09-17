import { FileType } from '../../infrastructure/postgres/models/file.model';

export { FileType as UploadType };

export interface IUploadStrategy {
  readonly uploadType: FileType;
  readonly maxSizeBytes: number;
  readonly allowedMimeTypes: string[];
  readonly cloudinaryFolder: string;
  readonly resourceType: 'image' | 'video' | 'raw' | 'auto';

  validate(file: Express.Multer.File): void;
}

export interface UploadInputDTO {
  uploadType: FileType;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface UploadResponseDTO {
  id: string;
  userId: string;
  originalName: string;
  title: string;
  description?: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  tags: string[];
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
  };
  createdAt: Date;
}
