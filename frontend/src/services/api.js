import axios from 'axios';
import { storage } from '../utils/storage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((config) => {
  const token = storage.get('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && storage.get('auth_token')) storage.remove('auth_token');
  return Promise.reject(error);
});
export const payload = response => response.data?.data ?? response.data;
