import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { User } from '../types/user';

export const usersApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const res = await axiosClient.get<ApiResponse<User>>('/users/profile');
    return res.data;
  },

  updateProfile: async (data: FormData | { firstName?: string; lastName?: string; avatarUrl?: string }): Promise<ApiResponse<User>> => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await axiosClient.put<ApiResponse<User>>('/users/profile', data, { headers });
    return res.data;
  },
};
