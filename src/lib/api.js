import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // Make sure this matches your backend port!
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  // baseURL: 'https://corporate-gift-backend.vercel.app',
});

// Automatically attach the token and optionally log requests
api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().accessToken;

  // Fallback if Zustand hasn't hydrated yet
  if (!token && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('corporate-gift-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.accessToken;
      }
    } catch (err) {
      console.error('Failed to parse auth token');
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
    console.log(`\n[>>> FRONTEND REQUEST] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
    if (config.data) console.log('Data:', JSON.stringify(config.data, null, 2));
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Variables to handle token refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use((response) => {
  if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
    console.log(`[<<< FRONTEND RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
  }
  return response;
}, async (error) => {
  const originalRequest = error.config;

  if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
    console.log(`[!!! FRONTEND ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
  }

  // Handle 401 Unauthorized errors and attempt refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, logout, setAccessToken } = useAuthStore.getState();

    if (!refreshToken) {
      logout();
      if (typeof window !== 'undefined') window.location.href = '/admin-login';
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
      const { accessToken } = response.data.data;

      setAccessToken(accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      if (typeof window !== 'undefined') {
        const isAdmin = window.location.pathname.startsWith('/admin') || window.location.pathname.includes('/dashboard');
        window.location.href = isAdmin ? '/admin-login' : '/';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
});

export default api;
