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
    clearFileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Files
      .addCase(fetchFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload.data || [];
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch media files';
      })

      // Upload File
      .addCase(uploadFileThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadFileThunk.fulfilled, (state, action: PayloadAction<MediaFile>) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.files.unshift(action.payload);
      })
      .addCase(uploadFileThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload || 'Upload failed';
      })

      // Fetch File Details
      .addCase(fetchFileDetails.fulfilled, (state, action: PayloadAction<MediaFile>) => {
        state.selectedFile = action.payload;
        const index = state.files.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
      })

      // Delete File
      .addCase(deleteFileThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.files = state.files.filter((f) => f._id !== action.payload);
        if (state.selectedFile && state.selectedFile._id === action.payload) {
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
  clearFileError,
} = filesSlice.actions;

export default filesSlice.reducer;
