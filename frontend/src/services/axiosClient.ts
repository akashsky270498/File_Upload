import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env.config';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


// Remove Authorization header injection from localStorage (using HttpOnly cookies)
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: unknown) => Promise.reject(error)
);

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

    // Bypass automatic token refresh for auth endpoints
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        // Send empty body; backend reads refreshToken from HttpOnly cookie
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Re-execute original request with new HttpOnly cookie attached
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
