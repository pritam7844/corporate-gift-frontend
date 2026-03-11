import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // Make sure this matches your backend port!
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  // baseURL: 'https://corporate-gift-backend.vercel.app',
});

// Automatically attach the token and optionally log requests
api.interceptors.request.use((config) => {
  let token = useAuthStore.getState().token;

  // Fallback if Zustand hasn't hydrated yet (common in Next.js first render effects)
  if (!token && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('corporate-gift-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.token;
      }
    } catch (err) {
      console.error('Failed to parse auth token from localStorage');
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

// Response interceptor for logging
// Keep track of consecutive 401 errors
let unauthorizedCount = 0;

api.interceptors.response.use((response) => {
  // Reset count on successful request
  unauthorizedCount = 0;

  if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
    console.log(`[<<< FRONTEND RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  }
  return response;
}, (error) => {
  if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
    console.log(`[!!! FRONTEND ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
    console.log('Error Data:', JSON.stringify(error.response?.data || error.message, null, 2));
  }

  // Handle 401 Unauthorized errors
  if (error.response?.status === 401) {
    unauthorizedCount += 1;

    // If we get 3 consecutive 401 errors, aggressively logout
    if (unauthorizedCount >= 3) {
      console.warn('Multiple 401 Unauthorized errors detected. Forcing logout.');
      unauthorizedCount = 0; // Reset before redirect

      const authStore = useAuthStore.getState();
      authStore.logout();

      // Redirect to admin login if we're in the admin section, otherwise regular login
      if (typeof window !== 'undefined') {
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin-login';
        } else {
          // Can be modified if there's a specific employee login page
          window.location.href = '/login';
        }
      }
    }
  }

  return Promise.reject(error);
});

export default api;