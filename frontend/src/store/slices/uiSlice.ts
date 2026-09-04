import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  fileId?: string;
}

export interface UiState {
  toast: ToastMessage | null;
  confirmModal: ConfirmModalState;
  theme: 'dark' | 'light';
}

const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('omni_theme') as 'dark' | 'light') || 'dark';

const initialState: UiState = {
  toast: null,
  confirmModal: {
    isOpen: false,
    title: '',
    message: '',
  },
  theme: savedTheme,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toast = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
    openConfirmModal: (state, action: PayloadAction<{ title: string; message: string; fileId: string }>) => {
      state.confirmModal = {
        isOpen: true,
        title: action.payload.title,
        message: action.payload.message,
        fileId: action.payload.fileId,
      };
    },
    closeConfirmModal: (state) => {
      state.confirmModal.isOpen = false;
      state.confirmModal.fileId = undefined;
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('omni_theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
      }
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('omni_theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },
  },
});

export const { showToast, hideToast, openConfirmModal, closeConfirmModal, toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;

