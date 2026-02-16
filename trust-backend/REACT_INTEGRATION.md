# React Frontend Integration Guide

## How to Connect Your React App to Django Backend

### 1. Install Axios in React Project

```bash
cd trust-portal
npm install axios
```

### 2. Create API Service File

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (phone, password) => 
    api.post('/members/auth/login/', { phone, password }),
  
  logout: () => 
    api.post('/members/auth/logout/'),
  
  changePassword: (oldPassword, newPassword) => 
    api.post('/members/auth/change_password/', {
      old_password: oldPassword,
      new_password: newPassword
    }),
};

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

export default api;
```

### 3. Update Your App.jsx Login Function

Replace the mock login with real API:

```javascript
import { authAPI } from './services/api';

const handleLogin = async (phone, password) => {
  try {
    const response = await authAPI.login(phone, password);
    const data = response.data;
    
    // Store token
    localStorage.setItem('auth_token', data.token);
    
    // Set user state
    if (data.is_admin) {
      setIsAdmin(true);
      setCurrentUser({ name: data.name || 'Admin', role: 'Administrator' });
    } else {
      setIsAdmin(false);
      // Fetch full member profile
      const memberResponse = await memberAPI.getMe();
      setCurrentUser(memberResponse.data);
    }
    
    setIsLoggedIn(true);
    showNotification(t.emailConfirmation);
  } catch (error) {
    alert('Invalid credentials');
    console.error('Login error:', error);
  }
};
```

### 4. Update Dashboard to Fetch Real Data

```javascript
import { useEffect, useState } from 'react';
import { memberAPI, paymentAPI } from './services/api';

function DashboardPage({ isAdmin, t, exportToExcel }) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalCollected: 0,
    pendingAmount: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          // Fetch statistics
          const memberStats = await memberAPI.getStatistics();
          const paymentStats = await paymentAPI.getStatistics();
          
          setStats({
            totalMembers: memberStats.data.total_members,
            totalCollected: paymentStats.data.total_amount_collected,
            pendingAmount: paymentStats.data.total_pending
          });
          
          // Fetch recent payments
          const payments = await paymentAPI.getRecent(5);
          setRecentPayments(payments.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  if (loading) return <div>Loading...</div>;

  // Rest of your component...
}
```

### 5. Update Members Page

```javascript
import { useEffect, useState } from 'react';
import { memberAPI } from './services/api';

function MembersPage({ t, onViewMember }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, [searchTerm, filterStatus]);

  const fetchMembers = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== 'all') params.payment_status = filterStatus;
      
      const response = await memberAPI.getAll(params);
      setMembers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
}
```

### 6. Update Add Member Page

```javascript
import { memberAPI } from './services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    await memberAPI.create({
      ...formData,
      password: 'member123' // Default password
    });
    
    showNotification(t.memberAdded);
    // Reset form
  } catch (error) {
    console.error('Error creating member:', error);
    alert('Error creating member');
  }
};
```

### 7. Update Payment Page

```javascript
import { paymentAPI } from './services/api';

const handlePayment = async () => {
  try {
    await paymentAPI.create({
      member: currentUser.id,
      amount: paymentAmount,
      payment_method: 'UPI',
      reference_number: '', // Backend will auto-generate
    });
    
    showNotification(t.paymentSuccess);
    setShowConfirm(false);
    
    // Refresh user data
    const response = await memberAPI.getMe();
    setCurrentUser(response.data);
  } catch (error) {
    console.error('Error processing payment:', error);
    alert('Payment failed');
  }
};
```

### 8. Update Excel Export

```javascript
const exportToExcel = async () => {
  try {
    const response = await memberAPI.exportExcel();
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'members.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    showNotification('Excel report downloaded');
  } catch (error) {
    console.error('Error exporting:', error);
  }
};
```

### 9. Handle Logout

```javascript
const handleLogout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('auth_token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
  }
};
```

### 10. Update package.json

Add proxy for development:

```json
{
  "name": "trust-portal",
  "version": "1.0.0",
  "proxy": "http://localhost:8000",
  ...
}
```

## Testing Checklist

- [ ] Start Django backend: `python manage.py runserver`
- [ ] Start React frontend: `npm start`
- [ ] Test admin login
- [ ] Test member login
- [ ] Test viewing member list
- [ ] Test adding new member
- [ ] Test making payment
- [ ] Test Excel export
- [ ] Test logout

## Common Issues

### CORS Errors
Make sure Django backend has correct CORS settings in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### 401 Unauthorized
Check that token is being sent in headers:
```javascript
Authorization: Token <your-token>
```

### Network Errors
Ensure Django backend is running on port 8000.

## Production Deployment

1. Update API_BASE_URL to production URL
2. Build React app: `npm run build`
3. Serve static files with Django or separate hosting
4. Use environment variables for API URL

## Environment Variables

Create `.env` in React project:
```
REACT_APP_API_URL=http://localhost:8000/api
```

Update api.js:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```
