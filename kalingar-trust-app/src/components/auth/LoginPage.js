import React, { useState } from 'react';

// Embedded API service with debug information
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  async login(username, password) {
    console.log('🔐 Attempting login to:', `${API_BASE_URL}/auth/login`);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    console.log('🔐 Login response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('🔐 Login error:', error);
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    console.log('🔐 Login response data:', data);

    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      console.log('🔐 Token saved to localStorage:', data.access_token.substring(0, 50) + '...');
    } else {
      console.error('🔐 No access_token in response!');
    }

    return data;
  }
};

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('shamganesh');
  const [password, setPassword] = useState('123456789');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug function to check token
  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔍 Current token in localStorage:', token.substring(0, 50) + '...');
      alert('Token exists: ' + token.substring(0, 50) + '...');
    } else {
      console.log('🔍 No token found in localStorage');
      alert('No token found in localStorage');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login with:', username);
      const response = await apiService.login(username, password);
      console.log('🔐 Login successful:', response);

      // Check if token was actually saved
      setTimeout(() => {
        checkToken();
      }, 100);

      onLogin(response.user);
    } catch (error) {
      console.error('🔐 Login error:', error);
      setError(error.message || 'Login failed. Please check your backend server is running at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">Kalingar Trust</h1>
          <p className="login-subtitle">Admin Portal Login - DEBUG MODE</p>
        </div>
        {error && <div className="error-message">{error}</div>}

        <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
          <p style={{margin: '0', fontSize: '12px', color: '#000'}}>
            <strong>Debug:</strong> Check browser console (F12) for detailed logs
          </p>
          <button 
            type="button" 
            onClick={checkToken}
            style={{
              marginTop: '5px',
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Check Token
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666'}}>
          <p><strong>Backend Status:</strong> Make sure Python backend is running at http://localhost:5000</p>
          <p><strong>Test Backend:</strong> Visit http://localhost:5000/api/dashboard/stats</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;