import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types/user';
import {
  authApi,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  AuthResponseData,
} from '../../services/authApi';

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isAuthenticated: false,
  isLoading: Boolean(initialToken),
  error: null,
  otpSent: false,
  forgotPasswordStep: 'REQUEST',
};

export const loginUser = createAsyncThunk<AuthResponseData, LoginPayload, { rejectValue: string }>(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Authentication error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const registerUser = createAsyncThunk<{ id: string; email: string; message: string }, RegisterPayload, { rejectValue: string }>(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Registration failed');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration error';
      return rejectWithValue(errorMsg);
    }
  }
);

export const requestLoginOtp = createAsyncThunk<string, string, { rejectValue: string }>(
  'auth/requestLoginOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.requestLoginOtp(email);
      if (response.success) {
        return response.message || 'OTP sent to your email address.';
      }
      return rejectWithValue(response.message || 'Failed to send OTP');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to send OTP';
      return rejectWithValue(errorMsg);
    }
  }
);

export const verifyLoginOtp = createAsyncThunk<AuthResponseData, VerifyOtpPayload, { rejectValue: string }>(
  'auth/verifyLoginOtp',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyLoginOtp(payload);
      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
      }
      return rejectWithValue(response.message || 'OTP verification failed');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid or expired OTP';
      return rejectWithValue(errorMsg);
    }
  }
);

export const forgotPassword = createAsyncThunk<string, string, { rejectValue: string }>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      if (response.success) {
        return response.message || 'OTP sent if email exists';
      }
      return rejectWithValue(response.message || 'Request failed');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Password reset request failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const resetPassword = createAsyncThunk<string, ResetPasswordPayload, { rejectValue: string }>(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(payload);
      if (response.success) {
        return response.message || 'Password reset successful';
      }
      return rejectWithValue(response.message || 'Reset failed');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Password reset failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const changePassword = createAsyncThunk<string, ChangePasswordPayload, { rejectValue: string }>(
  'auth/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(payload);
      if (response.success) {
        return response.message || 'Password changed successfully';
      }
      return rejectWithValue(response.message || 'Failed to change password');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Password change failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch user');
    } catch (err: unknown) {
      return rejectWithValue('Session expired');
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>('auth/logoutUser', async () => {
  try {
    await authApi.logout();
  } catch {
    // Ignore error on logout
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
    },
    setForgotPasswordStep: (state, action: PayloadAction<'REQUEST' | 'VERIFY' | 'SUCCESS'>) => {
      state.forgotPasswordStep = action.payload;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.otpSent = false;
      state.forgotPasswordStep = 'REQUEST';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      })

      // OTP Login Request
      .addCase(requestLoginOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestLoginOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(requestLoginOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to send OTP';
      })

      // OTP Login Verify
      .addCase(verifyLoginOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.otpSent = false;
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Invalid OTP';
      })

      // Forgot Password Request
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.forgotPasswordStep = 'VERIFY';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset request failed';
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.forgotPasswordStep = 'SUCCESS';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset failed';
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password change failed';
      })

      // Fetch Me
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.otpSent = false;
        state.forgotPasswordStep = 'REQUEST';
      });
  },
});

export const { clearError, resetOtpState, setForgotPasswordStep, resetAuth } = authSlice.actions;
export default authSlice.reducer;
