import axios from 'axios';
import { getAuthToken, removeAuthToken } from './auth';

// Set base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAuthToken();
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
