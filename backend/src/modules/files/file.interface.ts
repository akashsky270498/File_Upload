import { Document, Types } from 'mongoose';
import { PaginationMeta } from '../../common/types/apiResponse.interface';

export type FileType = 'image' | 'video' | 'audio' | 'pdf';

export interface IFile extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  originalName: string;
  tags: string[];
  fileType: FileType;
  mimeType: string;
  size: number;
  cloudinaryId: string;
  url: string;
  secureUrl: string;
  thumbnailUrl?: string;
  uploader: Types.ObjectId;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadFileInput {
  file: Express.Multer.File;
  title: string;
  description?: string;
  tags?: string[];
  uploaderId: string;
}

export interface SearchFilesQueryInput {
  query?: string;
  fileType?: string;
  sortBy?: 'relevance' | 'views' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  tags?: string | string[];
}

export interface SearchFilesResult {
  files: IFile[];
  meta: PaginationMeta;
}

export interface FileQueryOptions {
  filterConditions: Record<string, unknown>;
  sortConditions: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}
