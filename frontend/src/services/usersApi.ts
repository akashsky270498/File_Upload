// ==========================================
// 👤 USER PROFILE API SERVICES
// ==========================================
// User profile fetch karne ke liye GraphQL Queries aur Profile Update/Avatar Upload ke liye REST APIs.

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
   * 1. Current Authenticated Logged-In User Profile fetcher via GraphQL (`me` query)
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
          coverImageUrl
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
   * 2. ID se kisi bhi User ka Public Profile fetcher via GraphQL (`user` query)
   */
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const query = `
      query GetUserById($id: ID!) {
        user(id: $id) {
          id
          email
          firstName
          lastName
          mobileNumber
          role
          status
          profileImage
          profileImageUrl
          coverImageUrl
          createdAt
        }
      }
    `;
    const res = await executeGraphQL<{ user: User }>(query, { id });
    const data = res.user
      ? { ...res.user, avatarUrl: res.user.profileImageUrl || res.user.profileImage || res.user.avatarUrl }
      : res.user;

    return {
      success: true,
      statusCode: 200,
      message: 'User profile fetched via GraphQL',
      data,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * 3. Profile update handler via REST API (PUT /api/v1/users/profile)
   * Supports textual fields (Name, Mobile) as well as direct Avatar image file upload to Cloudinary.
   */
  updateProfile: async (input: UpdateProfileInput): Promise<ApiResponse<User>> => {
    if (input.avatarFile) {
      // Form-Data upload for image file
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
      // Standard JSON update for text fields
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

