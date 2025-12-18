import axios from 'axios';
import { getToken } from './authToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = getToken();
    console.log('Token in request:', token ? 'Present' : 'Missing'); // Debug log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      console.error('403 Forbidden - Token might be invalid or missing');
    }
    return Promise.reject(error);
  }
);

export default api;