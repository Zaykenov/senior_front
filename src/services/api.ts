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
  withCredentials: true
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

// Event Services
export const eventService = {
  // Admin routes
  getAdminEvents: () => api.get('/admin/events'),
  createEvent: (data: any) => api.post('/events', data),
  updateEvent: (id: string, data: any) => api.put(`/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
  getEventAttendees: (id: string) => api.get(`/events/${id}/attendees`),

  // Alumni routes
  getEvents: () => api.get('/events'),
  getEvent: (id: string) => api.get(`/events/${id}`),
  registerForEvent: (id: string) => api.post(`/events/${id}/register`),
  cancelEventRegistration: (id: string) => api.delete(`/events/${id}/register`),
  getMyEvents: () => api.get('/my-events'),
};

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