import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  signup: async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
};

export const userService = {
  getProfile: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  updateProfile: async (userId: number, data: any) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },
  getBadges: async (userId: number) => {
    const response = await api.get(`/users/${userId}/badges`);
    return response.data;
  },
};

export const washroomService = {
  getAll: async () => {
    const response = await api.get('/washrooms');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/washrooms/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/washrooms', data);
    return response.data;
  },
  getNearby: async (lat: number, lng: number, radius?: number) => {
    const response = await api.get('/washrooms/location/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },
};

export const reviewService = {
  create: async (data: any) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
  getByWashroom: async (washroomId: number) => {
    const response = await api.get(`/reviews/washroom/${washroomId}`);
    return response.data;
  },
  getUserReviews: async (userId: number) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
  update: async (reviewId: number, data: any) => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },
  delete: async (reviewId: number) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default api;
