import { executeGraphQL } from './graphqlClient';
import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { User } from '../types/user';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  profileImage?: string;
  avatarFile?: File;
}

export const usersApi = {
  /**
   * Fetch authenticated user profile via GraphQL
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    const query = `
      query GetMe {
        me {
          id
          email
          firstName
          lastName
          mobileNumber
          role
          status
          profileImage
          profileImageUrl
          createdAt
        }
      }
    `;
    const res = await executeGraphQL<{ me: User }>(query);
    const data = res.me
      ? { ...res.me, avatarUrl: res.me.profileImageUrl || res.me.profileImage || res.me.avatarUrl }
      : res.me;

    return {
      success: true,
      statusCode: 200,
      message: 'User profile fetched via GraphQL',
      data,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Update authenticated user profile via REST PUT /api/v1/users/profile
   * Supports JSON body or multipart/form-data with avatar image file
   */
  updateProfile: async (input: UpdateProfileInput): Promise<ApiResponse<User>> => {
    if (input.avatarFile) {
      const formData = new FormData();
      if (input.firstName) formData.append('firstName', input.firstName);
      if (input.lastName) formData.append('lastName', input.lastName);
      if (input.mobileNumber) formData.append('mobileNumber', input.mobileNumber);
      if (input.profileImage) formData.append('profileImage', input.profileImage);
      formData.append('avatar', input.avatarFile);

      const res = await axiosClient.put<ApiResponse<User>>('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } else {
      const res = await axiosClient.put<ApiResponse<User>>('/users/profile', {
        firstName: input.firstName,
        lastName: input.lastName,
        mobileNumber: input.mobileNumber,
        profileImage: input.profileImage,
      });
      return res.data;
    }
  },
};
