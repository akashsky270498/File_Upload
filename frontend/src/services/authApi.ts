import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { User, AuthTokens } from '../types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/auth/logout');
    return res.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/auth/change-password', payload);
    return res.data;
  },
};

