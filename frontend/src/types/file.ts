import { User } from './user';
import { PaginationMeta } from './api';

export type FileType = 'image' | 'video' | 'audio' | 'pdf';

export interface MediaFile {
  _id: string;
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
  uploader: User;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilter {
  query: string;
  fileType: string;
  sortBy: 'relevance' | 'views' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  tags?: string[];
}

export interface RealtimeFileNotification {
  fileId: string;
  title: string;
  fileType: string;
  url: string;
  uploaderName: string;
  createdAt: string;
  read?: boolean;
}

export interface FilesState {
  files: MediaFile[];
  meta: PaginationMeta | null;
  selectedFile: MediaFile | null;
  filters: SearchFilter;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  activeNotification: RealtimeFileNotification | null;
  notificationsHistory: RealtimeFileNotification[];
  unreadCount: number;
}
