import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { MediaFile, SearchFilter } from '../types/file';

export const filesApi = {
  uploadFile: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<MediaFile>> => {
    const res = await axiosClient.post<ApiResponse<MediaFile>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  searchFiles: async (filter: SearchFilter): Promise<ApiResponse<MediaFile[]>> => {
    const params: Record<string, unknown> = {
      query: filter.query || undefined,
      fileType: filter.fileType !== 'all' ? filter.fileType : undefined,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
      page: filter.page,
      limit: filter.limit,
    };

    if (filter.tags && filter.tags.length > 0) {
      params.tags = filter.tags.join(',');
    }

    const res = await axiosClient.get<ApiResponse<MediaFile[]>>('/files/search', { params });
    return res.data;
  },

  getFileById: async (id: string): Promise<ApiResponse<MediaFile>> => {
    const res = await axiosClient.get<ApiResponse<MediaFile>>(`/files/${id}`);
    return res.data;
  },

  deleteFile: async (id: string): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/files/${id}`);
    return res.data;
  },
};
