import axiosClient from './axiosClient';
import { executeGraphQL } from './graphqlClient';
import { ApiResponse } from '../types/api';
import { MediaFile, SearchFilter } from '../types/file';

export const filesApi = {
  /**
   * Upload single file via REST multipart/form-data
   */
  uploadFile: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<MediaFile>> => {
    const res = await axiosClient.post<ApiResponse<MediaFile>>('/uploads', formData, {
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

  /**
   * Upload batch files (up to 5 files) via REST multipart/form-data
   */
  uploadBatchFiles: async (
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<MediaFile[]>> => {
    const res = await axiosClient.post<ApiResponse<MediaFile[]>>('/uploads/batch', formData, {
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

  /**
   * Search / query files via POST /api/v1/search
   */
  searchFiles: async (filter: SearchFilter): Promise<ApiResponse<MediaFile[]>> => {
    const params: Record<string, unknown> = {
      q: filter.query || undefined,
      fileType: filter.fileType !== 'all' ? filter.fileType : undefined,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
      page: filter.page,
      limit: filter.limit,
    };

    if (filter.tags && filter.tags.length > 0) {
      params.tags = filter.tags.join(',');
    }

    const res = await axiosClient.post<ApiResponse<MediaFile[]>>('/search', params);
    return res.data;
  },

  /**
   * Fetch single file details via GraphQL Query file(id: ID!)
   */
  getFileById: async (id: string): Promise<ApiResponse<MediaFile>> => {
    const query = `
      query GetFile($id: ID!) {
        file(id: $id) {
          id
          userId
          originalName
          title
          description
          fileType
          mimeType
          size
          cloudinaryUrl
          cloudinaryPublicId
          viewsCount
          createdAt
          user {
            id
            firstName
            lastName
            email
            profileImage
          }
        }
      }
    `;
    const res = await executeGraphQL<{ file: MediaFile }>(query, { id });
    const fileData = res.file ? { ...res.file, _id: res.file.id || id } : res.file;
    return {
      success: true,
      statusCode: 200,
      message: 'File fetched via GraphQL',
      data: fileData,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Delete file via REST DELETE /api/v1/uploads/:id
   */
  deleteFile: async (id: string): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`/uploads/${id}`);
    return res.data;
  },
};
