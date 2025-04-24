import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

// Use the environment variable for the base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api'; // Fallback just in case

const instance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

const api = setupCache(instance);

export const authService = {
  login: (email: string, password: string) => api.post('/login', { email, password }),
  register: (name: string, email: string, password: string, password_confirmation: string) =>
    api.post('/register', { name, email, password, password_confirmation }),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/user'),
};

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Log specific API error details
      console.error(
        `API Error: ${error.response.status} on ${error.config.method?.toUpperCase() || ''} ${error.config.url}`, 
        error.response.data
      );
    } else if (error.request) {
      console.error('Network Error - No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const getUsers = () => api.get('/users');

export const getMessages = async (userId: number) => {
  try {
    return await api.get(`/messages/${userId}`);
  } catch (error) {
    console.error(`Failed to fetch messages for user ${userId}:`, error);
    throw error;
  }
};

export const sendMessage = async (userId: number, message: string) => {
  try {
    return await api.post(`/messages/${userId}`, { message });
  } catch (error) {
    console.error(`Failed to send message to user ${userId}:`, error);
    throw error;
  }
};

export default api;