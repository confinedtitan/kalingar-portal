// API Configuration for connecting React frontend to Python backend
const API_CONFIG = {
  // Development
  DEV_BASE_URL: 'http://localhost:5000/api',

  // Production (update with your deployed backend URL)
  PROD_BASE_URL: 'https://your-app.herokuapp.com/api',

  // Automatically select based on environment
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-app.herokuapp.com/api'
    : 'http://localhost:5000/api',

  // Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',

    // Members
    MEMBERS: '/members',
    MEMBER_BY_ID: (id) => `/members/${id}`,

    // Bank Accounts
    BANK_ACCOUNTS: '/bank-accounts',
    BANK_ACCOUNT_BY_ID: (id) => `/bank-accounts/${id}`,

    // Dashboard
    DASHBOARD_STATS: '/dashboard/stats',
    RECENT_MEMBERS: '/dashboard/recent-members'
  }
};

export default API_CONFIG;

// API Service class for making HTTP requests
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('token');
    console.log('API Service initialized with baseURL:', this.baseURL);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token set in localStorage');
    } else {
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`Making ${options.method || 'GET'} request to:`, url);
    console.log('Request config:', config);

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          // If we can't parse error as JSON, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to backend server. Make sure the Python backend is running at http://localhost:5000');
      }
      throw error;
    }
  }

  // Authentication methods
  async login(username, password) {
    const response = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request(API_CONFIG.ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
    this.setToken(null);
  }

  async verifyToken() {
    return await this.request(API_CONFIG.ENDPOINTS.VERIFY);
  }

  // Member methods
  async getMembers(search = '', page = 1, perPage = 10) {
    const params = new URLSearchParams({
      ...(search && { search }),
      page: page.toString(),
      per_page: perPage.toString(),
    });

    return await this.request(`${API_CONFIG.ENDPOINTS.MEMBERS}?${params}`);
  }

  async getMember(id) {
    return await this.request(API_CONFIG.ENDPOINTS.MEMBER_BY_ID(id));
  }

  async createMember(memberData) {
    console.log('Creating member with data:', memberData);
    return await this.request(API_CONFIG.ENDPOINTS.MEMBERS, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(id, memberData) {
    console.log('Updating member', id, 'with data:', memberData);
    return await this.request(API_CONFIG.ENDPOINTS.MEMBER_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteMember(id) {
    console.log('Deleting member:', id);
    return await this.request(API_CONFIG.ENDPOINTS.MEMBER_BY_ID(id), {
      method: 'DELETE',
    });
  }

  // Bank Account methods
  async getBankAccounts(search = '', page = 1, perPage = 10) {
    const params = new URLSearchParams({
      ...(search && { search }),
      page: page.toString(),
      per_page: perPage.toString(),
    });

    return await this.request(`${API_CONFIG.ENDPOINTS.BANK_ACCOUNTS}?${params}`);
  }

  async getBankAccount(id) {
    return await this.request(API_CONFIG.ENDPOINTS.BANK_ACCOUNT_BY_ID(id));
  }

  async createBankAccount(accountData) {
    console.log('Creating bank account with data:', accountData);
    return await this.request(API_CONFIG.ENDPOINTS.BANK_ACCOUNTS, {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async updateBankAccount(id, accountData) {
    console.log('Updating bank account', id, 'with data:', accountData);
    return await this.request(API_CONFIG.ENDPOINTS.BANK_ACCOUNT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  }

  async deleteBankAccount(id) {
    console.log('Deleting bank account:', id);
    return await this.request(API_CONFIG.ENDPOINTS.BANK_ACCOUNT_BY_ID(id), {
      method: 'DELETE',
    });
  }

  // Dashboard methods
  async getDashboardStats() {
    return await this.request(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
  }

  async getRecentMembers() {
    return await this.request(API_CONFIG.ENDPOINTS.RECENT_MEMBERS);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export { ApiService };