import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin-login', credentials),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  uploadAvatar: (formData) => api.post('/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Course API
export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  getCoursesWithStats: () => api.get('/courses/stats'),
};

// Feedback API
export const feedbackAPI = {
  createFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  getMyFeedback: (params) => api.get('/feedback/my-feedback', { params }),
  updateFeedback: (id, feedbackData) => api.put(`/feedback/${id}`, feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
  getAllFeedback: (params) => api.get('/feedback/all', { params }),
  exportFeedback: (params) => api.get('/feedback/export', { 
    params,
    responseType: 'blob'
  }),
  getFeedbackStats: () => api.get('/feedback/stats'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/toggle-block`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};