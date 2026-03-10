import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  // Make sure this matches your backend port!
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  // baseURL: 'https://corporate-gift-backend.vercel.app',
});

// Automatically attach the token and optionally log requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
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
api.interceptors.response.use((response) => {
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
  return Promise.reject(error);
});

export default api;