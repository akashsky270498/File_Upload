import axios, { InternalAxiosRequestConfig } from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
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

    // Bypass automatic token refresh for login, register, and refresh endpoints
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
