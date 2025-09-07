import React, { useState, useEffect } from 'react';
import './styles/App.css';

// Import components
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/pages/Dashboard';
import MembersList from './components/pages/MembersList';
import MemberForm from './components/pages/MemberForm';
import BankAccountsList from './components/pages/BankAccountsList';
import BankAccountForm from './components/pages/BankAccountForm';

// Embedded API service with debug and proper token handling
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  getToken() {
    const token = localStorage.getItem('token');
    console.log('🔍 Getting token from localStorage:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
    return token;
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
      console.log('💾 Token saved to localStorage:', token.substring(0, 50) + '...');
    } else {
      localStorage.removeItem('token');
      console.log('🗑️ Token removed from localStorage');
    }
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);
    console.log('📝 Request headers:', config.headers);
    if (options.body) {
      console.log('📦 Request body:', options.body);
    }

    try {
      const response = await fetch(url, config);
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = await response.json();
          console.error('❌ Error response:', error);
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          console.error('❌ Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error) {
      console.error('🚨 Request failed:', error);
      throw error;
    }
  },

  async login(username, password) {
    console.log('🔐 Logging in with username:', username);
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.access_token) {
      this.setToken(response.access_token);
    } else {
      console.error('🚨 No access_token in login response!');
    }
    return response;
  },

  async getMembers() {
    console.log('👥 Fetching members...');
    const response = await this.request('/members?per_page=-1');
    return response;
  },

  async createMember(memberData) {
    console.log('➕ Creating member with data:', memberData);
    return await this.request('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  async updateMember(id, memberData) {
    console.log('✏️ Updating member', id, 'with data:', memberData);
    return await this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },

  async deleteMember(id) {
    console.log('🗑️ Deleting member:', id);
    return await this.request(`/members/${id}`, {
      method: 'DELETE',
    });
  },

  async getBankAccounts() {
    console.log('🏦 Fetching bank accounts...');
    const response = await this.request('/bank-accounts?per_page=-1');
    return response;
  },

  async createBankAccount(accountData) {
    console.log('➕ Creating bank account with data:', accountData);
    return await this.request('/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },

  async updateBankAccount(id, accountData) {
    console.log('✏️ Updating bank account', id, 'with data:', accountData);
    return await this.request(`/bank-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  },

  async deleteBankAccount(id) {
    console.log('🗑️ Deleting bank account:', id);
    return await this.request(`/bank-accounts/${id}`, {
      method: 'DELETE',
    });
  },

  async logout() {
    console.log('🚪 Logging out...');
    this.setToken(null);
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [editingBankAccount, setEditingBankAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 App starting, checking for existing token:', token ? 'Found' : 'Not found');
  }, []);

  // Load data functions
  const loadMembers = async () => {
    try {
      console.log('📊 Loading members from backend...');
      const response = await apiService.getMembers();
      setMembers(response.members || []);
      console.log('✅ Members loaded:', response.members?.length || 0);
    } catch (error) {
      console.error('❌ Failed to load members:', error);
      setError('Failed to load members: ' + error.message);
    }
  };

  const loadBankAccounts = async () => {
    try {
      console.log('📊 Loading bank accounts from backend...');
      const response = await apiService.getBankAccounts();
      setBankAccounts(response.bankAccounts || []);
      console.log('✅ Bank accounts loaded:', response.bankAccounts?.length || 0);
    } catch (error) {
      console.error('❌ Failed to load bank accounts:', error);
      setError('Failed to load bank accounts: ' + error.message);
    }
  };

  const handleLogin = async (userData) => {
    console.log('🔐 Handling login for user:', userData);
    setUser(userData);
    await loadMembers();
    await loadBankAccounts();
  };

  const handleLogout = async () => {
    console.log('🚪 Handling logout');
    await apiService.logout();
    setUser(null);
    setMembers([]);
    setBankAccounts([]);
    setCurrentView('dashboard');
  };

  const addMember = async (memberData) => {
    try {
      console.log('➕ Adding member:', memberData);
      setLoading(true);
      setError('');

      // Check token before making request
      const token = apiService.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      await apiService.createMember(memberData);
      console.log('✅ Member added successfully');
      await loadMembers();
    } catch (error) {
      console.error('❌ Failed to add member:', error);
      const errorMessage = 'Failed to add member: ' + error.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (memberData) => {
    try {
      console.log('✏️ Updating member:', memberData);
      setLoading(true);
      setError('');

      const token = apiService.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      await apiService.updateMember(memberData.id, memberData);
      console.log('✅ Member updated successfully');
      await loadMembers();
    } catch (error) {
      console.error('❌ Failed to update member:', error);
      const errorMessage = 'Failed to update member: ' + error.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (memberId) => {
    try {
      console.log('🗑️ Deleting member:', memberId);
      setLoading(true);
      setError('');

      const token = apiService.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      await apiService.deleteMember(memberId);
      console.log('✅ Member deleted successfully');
      await loadMembers();
    } catch (error) {
      console.error('❌ Failed to delete member:', error);
      setError('Failed to delete member: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addBankAccount = async (accountData) => {
    try {
      console.log('➕ Adding bank account:', accountData);
      setLoading(true);
      setError('');

      const token = apiService.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      await apiService.createBankAccount(accountData);
      console.log('✅ Bank account added successfully');
      await loadBankAccounts();
    } catch (error) {
      console.error('❌ Failed to add bank account:', error);
      const errorMessage = 'Failed to add bank account: ' + error.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateBankAccount = async (accountData) => {
    try {
      console.log('✏️ Updating bank account:', accountData);
      setLoading(true);
      setError('');

      const token = apiService.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      await apiService.updateBankAccount(accountData.id, accountData);
      console.log('✅ Bank account updated successfully');
      await loadBankAccounts();
    } catch (error) {
      console.error('❌ Failed to update bank account:', error);
      const errorMessage = 'Failed to update bank account: ' + error.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteBankAccount = async (accountId) => {
    try {
      console.log('🗑️ Deleting bank account:', accountId);
      setLoading(true);
      setError('');

      const token = apiService.getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      await apiService.deleteBankAccount(accountId);
      console.log('✅ Bank account deleted successfully');
      await loadBankAccounts();
    } catch (error) {
      console.error('❌ Failed to delete bank account:', error);
      setError('Failed to delete bank account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch(currentView) {
      case 'dashboard':
        return (
          <Dashboard
            members={members}
            bankAccounts={bankAccounts}
            setCurrentView={setCurrentView}
          />
        );
      case 'members-list':
        return (
          <MembersList
            members={members}
            setCurrentView={setCurrentView}
            setEditingMember={setEditingMember}
            deleteMember={deleteMember}
          />
        );
      case 'member-form':
        return (
          <MemberForm
            member={editingMember}
            onSave={editingMember ? updateMember : addMember}
            onCancel={() => {
              setEditingMember(null);
              setCurrentView('members-list');
            }}
          />
        );
      case 'bank-accounts-list':
        return (
          <BankAccountsList
            bankAccounts={bankAccounts}
            setCurrentView={setCurrentView}
            setEditingBankAccount={setEditingBankAccount}
            deleteBankAccount={deleteBankAccount}
          />
        );
      case 'bank-account-form':
        return (
          <BankAccountForm
            account={editingBankAccount}
            onSave={editingBankAccount ? updateBankAccount : addBankAccount}
            onCancel={() => {
              setEditingBankAccount(null);
              setCurrentView('bank-accounts-list');
            }}
          />
        );
      default:
        return (
          <Dashboard
            members={members}
            bankAccounts={bankAccounts}
            setCurrentView={setCurrentView}
          />
        );
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setEditingMember={setEditingMember}
        setEditingBankAccount={setEditingBankAccount}
      />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            color: '#000000',
            padding: '10px 20px',
            margin: '10px 20px',
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#000000',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;