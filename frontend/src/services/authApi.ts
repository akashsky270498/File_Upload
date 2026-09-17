import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { User, AuthTokens } from '../types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<{ id: string; email: string; message: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ id: string; email: string; message: string }>>('/auth/register', payload);
    return res.data;
  },

  requestLoginOtp: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ message: string }>>('/auth/request-login-otp', { email });
    return res.data;
  },

  verifyLoginOtp: async (payload: VerifyOtpPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponseData>>('/auth/verify-login-otp', payload);
    return res.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload);
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ message: string }>>('/auth/change-password', payload);
    return res.data;
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const res = await axiosClient.post<ApiResponse<{ message: string }>>('/auth/logout', {
      refreshToken: localStorage.getItem('refreshToken') || '',
    });
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
