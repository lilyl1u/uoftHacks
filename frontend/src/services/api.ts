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
  getTopUsers: async (limit: number = 5) => {
    const response = await api.get('/users/top', { params: { limit } });
    return response.data.users;
  },
  generatePersonality: async (userId: number) => {
    const response = await api.post(`/users/${userId}/personality/generate`);
    return response.data;
  },
  getPersonalityDescription: async (personalityType: string) => {
    const response = await api.get(`/users/personality/${encodeURIComponent(personalityType)}`);
    return response.data;
  },
};

export const washroomService = {
  getAll: async (campus?: string) => {
    const params = campus ? { campus } : {};
    const response = await api.get('/washrooms', { params });
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
  update: async (id: number, data: any) => {
    const response = await api.put(`/washrooms/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/washrooms/${id}`);
    return response.data;
  },
  getNearby: async (lat: number, lng: number, radius?: number) => {
    const response = await api.get('/washrooms/location/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },
  getTopVisited: async (limit: number = 5) => {
    const response = await api.get('/washrooms/top-visited', {
      params: { limit },
    });
    return response.data.washrooms;
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
  getFriendsReviews: async () => {
    const response = await api.get('/reviews/friends');
    return response.data.reviews;
  },
  getFriendsReviewsByWashroom: async (washroomId: number) => {
    const response = await api.get(`/reviews/friends/washroom/${washroomId}`);
    return response.data.reviews;
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

export const commentService = {
  create: async (reviewId: number, commentText: string) => {
    const response = await api.post(`/comments/review/${reviewId}`, { comment_text: commentText });
    return response.data.comment;
  },
  getByReview: async (reviewId: number) => {
    const response = await api.get(`/comments/review/${reviewId}`);
    return response.data.comments;
  },
  delete: async (commentId: number) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export const likeService = {
  like: async (reviewId: number) => {
    const response = await api.post(`/likes/review/${reviewId}`);
    return response.data;
  },
  unlike: async (reviewId: number) => {
    const response = await api.delete(`/likes/review/${reviewId}`);
    return response.data;
  },
  getCount: async (reviewId: number) => {
    const response = await api.get(`/likes/review/${reviewId}/count`);
    return response.data.like_count;
  },
  checkIfLiked: async (reviewId: number) => {
    const response = await api.get(`/likes/review/${reviewId}/check`);
    return response.data.liked;
  },
  getLikes: async (reviewId: number) => {
    const response = await api.get(`/likes/review/${reviewId}`);
    return response.data.likes;
  },
};

export const friendsService = {
  getFriends: async (userId?: number) => {
    const params = userId ? { userId } : {};
    const response = await api.get('/friends', { params });
    return response.data.friends;
  },
  followUser: async (friendId: number) => {
    const response = await api.post(`/friends/${friendId}`);
    return response.data;
  },
  unfollowUser: async (friendId: number) => {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  },
  getFriendshipStatus: async (userId: number) => {
    const response = await api.get(`/friends/status/${userId}`);
    return response.data;
  },
  searchUsers: async (query: string) => {
    const response = await api.get('/friends/search', { params: { q: query } });
    return response.data.users;
  },
};

export default api;
