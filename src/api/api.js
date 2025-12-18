import axios from 'axios';
import { getToken } from './authToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});


api.interceptors.request.use(config => {
  const token = getToken(); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export default api;
