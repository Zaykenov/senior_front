import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const API_URL = '/api'; // As per API docs

// Create axios instance
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const api = setupCache(instance);

// Authentication services
export const authService = {
  login: async (email: string, password: string) => {
    return api.post('/login', { email, password });
  },
  
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    return api.post('/register', { 
      name, 
      email,
      password,
      password_confirmation
    });
  },
};

// Add an interceptor to include the token in all future requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 