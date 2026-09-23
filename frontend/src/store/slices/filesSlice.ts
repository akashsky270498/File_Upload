// ==========================================
// 📁 REDUX FILES SLICE (State Management)
// ==========================================
// Ye file Files Feed, Search & Filter Filters, Uploads Progress, Real-time WebSockets Live Additions/Deletions, aur Notification History manage karti hai.

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FilesState, MediaFile, SearchFilter, RealtimeFileNotification } from '../../types/file';
import { filesApi } from '../../services/filesApi';
import { ApiResponse } from '../../types/api';

const initialState: FilesState = {
  files: [],
  meta: null,
  selectedFile: null,
  filters: {
    query: '',
    fileType: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
  },
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  activeNotification: null,
  notificationsHistory: [],
  unreadCount: 0,
};

/**
 * 1. Fetch Files Async Thunk (Elasticsearch Search & Filter API)
 */
export const fetchFiles = createAsyncThunk<ApiResponse<MediaFile[]>, SearchFilter, { rejectValue: string }>(
  'files/fetchFiles',
  async (filter, { rejectWithValue }) => {
    try {
      return await filesApi.searchFiles(filter);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error loading files';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * 2. Upload Single File Async Thunk (Cloudinary Stream Upload with Progress)
 */
export const uploadFileThunk = createAsyncThunk<MediaFile, { formData: FormData; onProgress?: (p: number) => void }, { rejectValue: string }>(
  'files/uploadFile',
  async ({ formData, onProgress }, { rejectWithValue }) => {
    try {
      const response = await filesApi.uploadFile(formData, onProgress);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Upload failed');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Upload error';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * 3. Upload Batch Files Async Thunk (Up to 5 files simultaneously)
 */
export const uploadBatchThunk = createAsyncThunk<MediaFile[], { formData: FormData; onProgress?: (p: number) => void }, { rejectValue: string }>(
  'files/uploadBatch',
  async ({ formData, onProgress }, { rejectWithValue }) => {
    try {
      const response = await filesApi.uploadBatchFiles(formData, onProgress);
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Batch upload failed');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Batch upload error';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * 4. Fetch File Details Async Thunk (View Counter Increments via REST / GraphQL)
 */
export const fetchFileDetails = createAsyncThunk<MediaFile, string, { rejectValue: string }>(
  'files/fetchFileDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await filesApi.getFileById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('File not found');
    } catch (err: unknown) {
      return rejectWithValue('Could not load file details');
    }
  }
);

/**
 * 5. Delete File Async Thunk (PostgreSQL, Cloudinary, & ES deletion)
 */
export const deleteFileThunk = createAsyncThunk<string, string, { rejectValue: string }>(
  'files/deleteFile',
  async (id, { rejectWithValue }) => {
    try {
      await filesApi.deleteFile(id);
      return id;
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Delete error';
      return rejectWithValue(errorMsg);
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.query = action.payload;
      state.filters.page = 1;
    },
    setFileTypeFilter: (state, action: PayloadAction<string>) => {
      state.filters.fileType = action.payload;
      state.filters.page = 1;
    },
    setSortBy: (state, action: PayloadAction<'relevance' | 'views' | 'date' | 'size'>) => {
      state.filters.sortBy = action.payload;
      state.filters.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    setSelectedFile: (state, action: PayloadAction<MediaFile | null>) => {
      state.selectedFile = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setActiveNotification: (state, action: PayloadAction<RealtimeFileNotification | null>) => {
      state.activeNotification = action.payload;
    },
    addNotificationToHistory: (state, action: PayloadAction<RealtimeFileNotification>) => {
      state.notificationsHistory.unshift(action.payload);
      state.unreadCount += 1;
    },
    markNotificationsRead: (state) => {
      state.unreadCount = 0;
      state.notificationsHistory.forEach((n) => {
        n.read = true;
      });
    },
    clearNotificationsHistory: (state) => {
      state.notificationsHistory = [];
      state.unreadCount = 0;
    },
    // Real-time Socket.io Sync: Insert new file to feed instantly without refresh
    addLiveFile: (state, action: PayloadAction<MediaFile>) => {
      const incomingId = action.payload.id || action.payload._id;
      const existing = state.files.some((f) => (f.id || f._id) === incomingId);
      if (!existing) {
        state.files.unshift(action.payload);
      }
    },
    // Real-time Socket.io Sync: Remove deleted file from feed instantly
    removeLiveFile: (state, action: PayloadAction<string>) => {
      const targetId = action.payload;
      state.files = state.files.filter((f) => (f.id || f._id) !== targetId);
      if (state.selectedFile && (state.selectedFile.id || state.selectedFile._id) === targetId) {
        state.selectedFile = null;
      }
    },
    clearFileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Files reducers
      .addCase(fetchFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as any;
        const resData = payload?.data;
        let incomingFiles: MediaFile[] = [];

        if (Array.isArray(resData)) {
          incomingFiles = resData;
          state.meta = payload.meta || null;
        } else if (resData && Array.isArray(resData.results)) {
          incomingFiles = resData.results;
          state.meta = {
            total: resData.total || 0,
            page: resData.page || 1,
            limit: resData.limit || 12,
            totalPages: resData.totalPages || 0,
          };
        } else {
          incomingFiles = [];
          state.meta = null;
        }

        if (state.filters.page === 1) {
          state.files = incomingFiles;
        } else {
          const existingIds = new Set(state.files.map((f) => f._id || f.id));
          const newUniqueFiles = incomingFiles.filter((f) => !existingIds.has(f._id || f.id));
          state.files = [...state.files, ...newUniqueFiles];
        }
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.isLoading = false;
        if (state.filters.page === 1) {
          state.files = [];
        }
        state.error = action.payload || 'Failed to fetch media files';
      })

      // Upload Single File reducers
      .addCase(uploadFileThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadFileThunk.fulfilled, (state, action: PayloadAction<MediaFile>) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        const incomingId = action.payload.id || action.payload._id;
        const existing = state.files.some((f) => (f.id || f._id) === incomingId);
        if (!existing) {
          state.files.unshift(action.payload);
        }
      })
      .addCase(uploadFileThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload || 'Upload failed';
      })

      // Upload Batch Files reducers
      .addCase(uploadBatchThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadBatchThunk.fulfilled, (state, action: PayloadAction<MediaFile[]>) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        if (Array.isArray(action.payload)) {
          action.payload.forEach((f) => {
            const incId = f.id || f._id;
            if (!state.files.some((existing) => (existing.id || existing._id) === incId)) {
              state.files.unshift(f);
            }
          });
        }
      })
      .addCase(uploadBatchThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload || 'Batch upload failed';
      })

      // Fetch File Details reducers
      .addCase(fetchFileDetails.fulfilled, (state, action: PayloadAction<MediaFile>) => {
        state.selectedFile = action.payload;
        const targetId = action.payload.id || action.payload._id;
        const index = state.files.findIndex((f) => (f.id || f._id) === targetId);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
      })

      // Delete File reducers
      .addCase(deleteFileThunk.fulfilled, (state, action: PayloadAction<string>) => {
        const deletedId = action.payload;
        state.files = state.files.filter((f) => (f.id || f._id) !== deletedId);
        if (state.selectedFile && (state.selectedFile.id || state.selectedFile._id) === deletedId) {
          state.selectedFile = null;
        }
      });
  },
});

export const {
  setSearchQuery,
  setFileTypeFilter,
  setSortBy,
  setPage,
  setSelectedFile,
  setUploadProgress,
  setActiveNotification,
  addNotificationToHistory,
  markNotificationsRead,
  clearNotificationsHistory,
  addLiveFile,
  removeLiveFile,
  clearFileError,
} = filesSlice.actions;

export default filesSlice.reducer;

