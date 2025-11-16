import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from Zustand persist storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear Zustand persist storage
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Competitors API
export const competitorsAPI = {
  getAll: (params) => api.get('/competitors', { params }),
  getById: (id) => api.get(`/competitors/${id}`),
  create: (data) => api.post('/competitors', data),
  update: (id, data) => api.put(`/competitors/${id}`, data),
  delete: (id) => api.delete(`/competitors/${id}`),
  getStats: (id) => api.get(`/competitors/${id}/stats`),
};

// Updates API
export const updatesAPI = {
  getAll: (params) => api.get('/updates', { params }),
  getById: (id) => api.get(`/updates/${id}`),
  refresh: (competitorId) => api.post('/updates/refresh', { competitorId }),
  getTimeline: (params) => api.get('/updates/timeline', { params }),
  delete: (id) => api.delete(`/updates/${id}`),
};

// Alerts API
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  markAllAsRead: () => api.put('/alerts/read-all'),
  delete: (id) => api.delete(`/alerts/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getCategoryStats: (params) => api.get('/analytics/categories', { params }),
  getSpikes: () => api.get('/analytics/spikes'),
  getTimeline: (params) => api.get('/analytics/timeline', { params }),
};

// Digest API
export const digestAPI = {
  getLatestDaily: () => api.get('/digest/daily/latest'),
  getLatestWeekly: () => api.get('/digest/weekly/latest'),
  generateDaily: () => api.post('/digest/daily/generate'),
  generateWeekly: () => api.post('/digest/weekly/generate'),
  getHistory: (params) => api.get('/digest/history', { params }),
};

// Comparison Matrix API
export const comparisonAPI = {
  getLatest: () => api.get('/comparison/latest'),
  generate: () => api.post('/comparison/generate'),
  getHistory: (params) => api.get('/comparison/history', { params }),
};

export default api;
