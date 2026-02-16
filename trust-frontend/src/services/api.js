import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (phone, password) =>
    api.post('/members/auth/login/', { phone, password }),

  logout: () =>
    api.post('/members/auth/logout/'),

  changePassword: (oldPassword, newPassword) =>
    api.post('/members/auth/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
    }),

  resetPassword: (memberId) =>
    api.post('/members/auth/reset_password/', {
      member_id: memberId,
    }),
};

// Members API
export const memberAPI = {
  getAll: (params) =>
    api.get('/members/', { params }),

  getById: (id) =>
    api.get(`/members/${id}/`),

  getMe: () =>
    api.get('/members/me/'),

  create: (data) =>
    api.post('/members/', data),

  update: (id, data) =>
    api.put(`/members/${id}/`, data),

  delete: (id) =>
    api.delete(`/members/${id}/`),

  getStatistics: () =>
    api.get('/members/statistics/'),

  exportExcel: () =>
    api.get('/members/export_excel/', { responseType: 'blob' }),
};

// Payments API
export const paymentAPI = {
  getAll: (params) =>
    api.get('/payments/', { params }),

  getById: (id) =>
    api.get(`/payments/${id}/`),

  getMyPayments: () =>
    api.get('/payments/my_payments/'),

  create: (data) =>
    api.post('/payments/', data),

  getStatistics: () =>
    api.get('/payments/statistics/'),

  getRecent: (limit = 10) =>
    api.get(`/payments/recent/?limit=${limit}`),

  exportExcel: () =>
    api.get('/payments/export_excel/', { responseType: 'blob' }),
};

// Content API (Announcements, Events, Meetings)
export const contentAPI = {
  // Announcements
  getAnnouncements: () => api.get('/members/announcements/'),
  createAnnouncement: (data) => api.post('/members/announcements/', data),
  updateAnnouncement: (id, data) => api.put(`/members/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/members/announcements/${id}/`),

  // Events
  getEvents: () => api.get('/members/events/'),
  createEvent: (data) => api.post('/members/events/', data),
  updateEvent: (id, data) => api.put(`/members/events/${id}/`, data),
  deleteEvent: (id) => api.delete(`/members/events/${id}/`),

  // Meetings
  getMeetings: () => api.get('/members/meetings/'),
  createMeeting: (data) => api.post('/members/meetings/', data),
  updateMeeting: (id, data) => api.put(`/members/meetings/${id}/`, data),
  deleteMeeting: (id) => api.delete(`/members/meetings/${id}/`),
};

export default api;
