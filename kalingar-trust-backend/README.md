# Kalingar Trust Backend API

A robust Flask-based REST API for managing temple trust membership and financial data.

## 🏗️ Architecture

- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens
- **Deployment**: Docker, Heroku, Railway, Vercel ready

## 📁 Project Structure

```
kalingar-trust-backend/
├── app/
│   ├── __init__.py          # App factory and configuration
│   ├── models/              # Database models
│   │   ├── user.py         # User authentication model
│   │   ├── member.py       # Member management model
│   │   └── bank_account.py # Bank account model
│   ├── routes/              # API endpoints
│   │   ├── auth.py         # Authentication routes
│   │   ├── members.py      # Member CRUD operations
│   │   ├── bank_accounts.py # Bank account operations
│   │   └── dashboard.py    # Dashboard statistics
│   └── utils/               # Utility functions
│       ├── validators.py   # Data validation
│       └── helpers.py      # Helper functions
├── config/
│   └── config.py           # Application configuration
├── migrations/             # Database migrations
├── tests/                  # Unit tests
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Multi-container setup
└── app.py                 # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip
- Virtual environment (recommended)

### Local Development Setup

1. **Clone and navigate to backend directory**:
   ```bash
   cd kalingar-trust-backend
   ```

2. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Manual setup (alternative)**:
   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Initialize database
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   ```

4. **Start the development server**:
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

### Using Docker

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

2. **Or build manually**:
   ```bash
   docker build -t kalingar-backend .
   docker run -p 5000:5000 kalingar-backend
   ```

## 📊 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/verify` | Verify JWT token |
| POST | `/api/auth/logout` | User logout |

### Members Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members (with pagination & search) |
| GET | `/api/members/{id}` | Get specific member |
| POST | `/api/members` | Create new member |
| PUT | `/api/members/{id}` | Update member |
| DELETE | `/api/members/{id}` | Delete member (soft delete) |

### Bank Accounts Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bank-accounts` | Get all bank accounts |
| GET | `/api/bank-accounts/{id}` | Get specific bank account |
| POST | `/api/bank-accounts` | Create new bank account |
| PUT | `/api/bank-accounts/{id}` | Update bank account |
| DELETE | `/api/bank-accounts/{id}` | Delete bank account |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/recent-members` | Get recent members |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

**Default Login Credentials:**
- Username: `shamganesh`
- Password: `123456789`

## 📝 API Usage Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "shamganesh", "password": "123456789"}'
```

### Get Members
```bash
curl -X GET http://localhost:5000/api/members \
  -H "Authorization: Bearer <your-token>"
```

### Create Member
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "memberId": "KT003",
    "name": "John Doe",
    "fatherName": "Robert Doe",
    "mobile": "9876543213",
    "email": "john@example.com",
    "address": "123 Street, City",
    "gender": "Male",
    "headOfFamily": "Yes"
  }'
```

## 🌐 Deployment Options

### 1. Heroku Deployment

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   heroku create kalingar-trust-api
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set JWT_SECRET_KEY=your-secret-key
   heroku config:set SECRET_KEY=your-flask-secret
   ```

4. **Add PostgreSQL addon**:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

5. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### 2. Railway Deployment

1. **Connect to Railway**:
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Deploy automatically

2. **Add PostgreSQL**:
   - Add PostgreSQL service in Railway dashboard
   - Environment variables will be set automatically

### 3. Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

### 4. DigitalOcean App Platform

1. **Create app** on DigitalOcean App Platform
2. **Connect repository** and select backend folder
3. **Set environment variables** in the dashboard
4. **Deploy** automatically

## 🗄️ Database Configuration

### SQLite (Development)
```python
DATABASE_URL=sqlite:///kalingar_trust.db
```

### PostgreSQL (Production)
```python
DATABASE_URL=postgresql://username:password@localhost/kalingar_trust_db
```

### Environment Variables

Create a `.env` file with:
```env
DATABASE_URL=your-database-url
JWT_SECRET_KEY=your-jwt-secret
SECRET_KEY=your-flask-secret
FLASK_ENV=production
ADMIN_USERNAME=shamganesh
ADMIN_PASSWORD=123456789
```

## 🧪 Testing

Run tests with:
```bash
python -m pytest tests/
```

## 🔧 Configuration

Key configuration options in `config/config.py`:

- **Database URL**: Set via `DATABASE_URL` environment variable
- **JWT Settings**: Token expiration and secret key
- **CORS**: Allowed origins for frontend connections
- **Admin Credentials**: Default superuser account

## 📈 Monitoring & Logging

The application includes:
- Error handling and logging
- Request validation
- Database connection pooling
- Health check endpoints

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection protection (SQLAlchemy ORM)
- CORS configuration
- Rate limiting ready (can be added)

## 🤝 Frontend Integration

Update your React frontend to connect to the backend:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';  // Development
// const API_BASE_URL = 'https://your-app.herokuapp.com/api';  // Production

// Example API call
const response = await fetch(`${API_BASE_URL}/members`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 📋 Production Checklist

- [ ] Set strong JWT secret keys
- [ ] Configure PostgreSQL database
- [ ] Set up proper environment variables
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check DATABASE_URL configuration
   - Ensure database server is running

2. **JWT Token Issues**:
   - Verify JWT_SECRET_KEY is set
   - Check token expiration

3. **CORS Errors**:
   - Update CORS_ORIGINS in configuration
   - Ensure frontend URL is included

4. **Import Errors**:
   - Ensure virtual environment is activated
   - Install all dependencies from requirements.txt

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Ensure all environment variables are properly set

## 🔄 Updates & Maintenance

To update the application:
1. Pull latest changes
2. Update dependencies: `pip install -r requirements.txt --upgrade`
3. Run database migrations if any
4. Restart the application

---

**Backend API is now ready for production deployment! 🚀**