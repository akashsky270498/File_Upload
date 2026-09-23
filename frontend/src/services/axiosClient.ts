// ==========================================
// 🌐 AXIOS HTTP CLIENT (REST API Interceptor)
// ==========================================
// Ye file Frontend Rest API Calls (Axios) ko handle karti hai.
// Isme Automatic 401 Unauthorized Interceptor + Refresh Token Retry handling enabled hai.

import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env.config';

// Axios instance with default settings (Credentials true for HttpOnly cookies)
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Server ko HttpOnly cookies (accessToken / refreshToken) send karne ke liye
});

// Request Interceptor: Pass-through (Authentication state HttpOnly cookie dwara automatic pass hota hai)
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: unknown) => Promise.reject(error)
);

// Response Interceptor: 401 Unauthorized aane par Refresh Token se automatic Session Renew karta hai
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const errObj = error as {
      config?: InternalAxiosRequestConfig & { _retry?: boolean };
      response?: { status?: number };
    };
    const originalRequest = errObj.config;
    const status = errObj.response?.status;
    const requestUrl = originalRequest?.url || '';

    // Auth endpoints par automatic refresh token loop prevent karte hain
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    // Agar 401 Unauthorized response aaya toh 1 baar refresh token request bhej kar token rotate karte hain
    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        // Backend HttpOnly cookie se Refresh Token padhkar naya Access Token set kar deta hai
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Naye Cookie ke saath original API request retry karte hain
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        // Refresh Token fail hone par Auth Logout event broadcast karte hain
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

