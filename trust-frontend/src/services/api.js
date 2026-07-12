import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

  importExcel: (formData) =>
    api.post('/members/import-excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
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

// Accounting API (Account Heads, Transactions, Receipts, Staff)
export const accountingAPI = {
  // Staff (Accountant) management — Admin only
  getStaff: (params) => api.get('/accounting/staff/', { params }),
  createStaff: (data) => api.post('/accounting/staff/', data),
  updateStaff: (id, data) => api.put(`/accounting/staff/${id}/`, data),
  deactivateStaff: (id) => api.post(`/accounting/staff/${id}/deactivate/`),
  activateStaff: (id) => api.post(`/accounting/staff/${id}/activate/`),

  // Account Heads
  getAccountHeads: (params) => api.get('/accounting/account-heads/', { params }),
  createAccountHead: (data) => api.post('/accounting/account-heads/', data),
  updateAccountHead: (id, data) => api.put(`/accounting/account-heads/${id}/`, data),
  deactivateAccountHead: (id) =>
    api.post(`/accounting/account-heads/${id}/deactivate/`),
  getHeadSummary: (id) => api.get(`/accounting/account-heads/${id}/summary/`),
  exportAccountHead: (id, params) =>
    api.get(`/accounting/account-heads/${id}/export/`, {
      params,
      responseType: 'blob',
    }),
  exportAllAccountHeads: (params) =>
    api.get('/accounting/account-heads/export-all/', {
      params,
      responseType: 'blob',
    }),

  // Transactions
  getTransactions: (params) => api.get('/accounting/transactions/', { params }),
  createTransaction: (data, config) =>
    api.post('/accounting/transactions/', data, config),
  updateTransaction: (id, data) =>
    api.put(`/accounting/transactions/${id}/`, data),
  deleteTransaction: (id) => api.delete(`/accounting/transactions/${id}/`),
  getTransactionSummary: () => api.get('/accounting/transactions/summary/'),

  // My Donations (for linked members)
  getMyDonations: () => api.get('/accounting/transactions/my-donations/'),

  // Receipts
  downloadReceipt: (id) =>
    api.get(`/accounting/receipts/${id}/download/`, { responseType: 'blob' }),
};

export default api;
