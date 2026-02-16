# Kalinga Temple Trust Portal - Django Backend

Professional Django REST API backend for the Trust Membership Portal.

## 🚀 Features

### ✅ Complete REST API
- Member management (CRUD)
- Payment processing and tracking
- Family tree management (children)
- User authentication (phone + password)
- Admin panel with Excel import/export
- Role-based permissions (Admin/Member)

### ✅ Admin Features
- Auto-generated Django admin panel
- Search, filter, and sort members
- Payment tracking and statistics
- Excel export for reports
- User management

### ✅ Security
- Token-based authentication
- CORS protection
- Password hashing
- SQL injection protection
- CSRF protection
- Role-based access control

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## 🛠️ Installation

### 1. Create Virtual Environment

```bash
# Navigate to backend folder
cd trust-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Setup

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings (optional for development)
```

### 4. Database Setup

```bash
# Create database tables
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser
# Enter: username (can use 'admin'), email, password
```

### 5. Load Sample Data (Optional)

```bash
python manage.py create_sample_data
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

## 🔑 Default Credentials

### Admin Panel
- URL: `http://localhost:8000/admin/`
- Username: (your superuser username)
- Password: (your superuser password)

### Sample Member (after loading sample data)
- Phone: `+919876543210`
- Password: `member123`

## 📡 API Endpoints

### Authentication

```
POST /api/members/auth/login/
Body: {
  "phone": "+919876543210",
  "password": "member123"
}
Response: {
  "token": "abc123...",
  "is_admin": false,
  "member_id": 1,
  "name": "Member Name"
}

POST /api/members/auth/logout/
Headers: Authorization: Token <your-token>

POST /api/members/auth/change_password/
Headers: Authorization: Token <your-token>
Body: {
  "old_password": "current",
  "new_password": "newpassword"
}
```

### Members

```
GET /api/members/
GET /api/members/{id}/
POST /api/members/
PUT /api/members/{id}/
DELETE /api/members/{id}/
GET /api/members/me/
GET /api/members/statistics/
GET /api/members/export_excel/
```

### Payments

```
GET /api/payments/
GET /api/payments/{id}/
POST /api/payments/
GET /api/payments/my_payments/
GET /api/payments/statistics/
GET /api/payments/recent/
GET /api/payments/export_excel/
```

### Example API Call

```bash
# Login
curl -X POST http://localhost:8000/api/members/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "password": "member123"}'

# Get member profile (use token from login)
curl -X GET http://localhost:8000/api/members/me/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Create payment
curl -X POST http://localhost:8000/api/payments/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "member": 1,
    "amount": 5000,
    "payment_method": "UPI",
    "reference_number": "TXN123456789"
  }'
```

## 🎨 Admin Panel Features

Access at: `http://localhost:8000/admin/`

### Members Section
- ✅ Add/Edit/Delete members
- ✅ View family details (inline children)
- ✅ Search by name, phone, email
- ✅ Filter by payment status
- ✅ Export to Excel/CSV
- ✅ Import from Excel/CSV

### Payments Section
- ✅ View all transactions
- ✅ Filter by status, method, date
- ✅ Search by member name, reference
- ✅ Export payment reports

### User Management
- ✅ Create admin users
- ✅ Manage permissions
- ✅ Password reset

## 📊 Database Models

### Member
- Personal info (name, phone, email, DOB)
- Family info (father, mother, spouse)
- Financial info (annual tax, amount paid/due)
- User account linkage

### Child
- Name, DOB, gender
- Linked to parent member

### Payment
- Amount, method, reference number
- Status tracking
- Payment date
- Linked to member

## 🔧 Configuration

### Switch to PostgreSQL (Production)

1. Install PostgreSQL

2. Update `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'trust_portal_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

3. Run migrations:
```bash
python manage.py migrate
```

### Enable Email Notifications

Update `.env` file:
```
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@kalingatemple.org
```

Update `settings.py`:
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
```

## 🚀 Deployment

### Option 1: PythonAnywhere (Free)

1. Sign up at pythonanywhere.com
2. Upload your code
3. Create virtual environment
4. Configure WSGI
5. Set environment variables

### Option 2: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create trust-portal-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### Option 3: Railway

1. Connect GitHub repo
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically

## 📦 Project Structure

```
trust-backend/
├── manage.py
├── requirements.txt
├── .env.example
├── trust_portal/
│   ├── settings.py      # Django settings
│   ├── urls.py          # Main URL routing
│   └── wsgi.py          # WSGI config
├── members/
│   ├── models.py        # Member & Child models
│   ├── views.py         # API views
│   ├── serializers.py   # Data serializers
│   ├── admin.py         # Admin config
│   └── urls.py          # Member routes
└── payments/
    ├── models.py        # Payment model
    ├── views.py         # API views
    ├── serializers.py   # Data serializers
    ├── admin.py         # Admin config
    └── urls.py          # Payment routes
```

## 🔐 Security Best Practices

1. **Change SECRET_KEY** in production
2. **Set DEBUG=False** in production
3. **Use HTTPS** in production
4. **Regular backups** of database
5. **Update dependencies** regularly
6. **Use environment variables** for secrets
7. **Implement rate limiting** (django-ratelimit)
8. **Enable logging** for monitoring

## 🧪 Testing

```bash
# Run tests
python manage.py test

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## 📝 Common Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Open Django shell
python manage.py shell

# Create database backup
python manage.py dumpdata > backup.json

# Restore database
python manage.py loaddata backup.json
```

## 🐛 Troubleshooting

### Import Error
```bash
pip install -r requirements.txt
```

### Migration Issues
```bash
python manage.py migrate --run-syncdb
```

### Port Already in Use
```bash
python manage.py runserver 8001
```

### CORS Issues
Add your React app URL to `CORS_ALLOWED_ORIGINS` in `settings.py`

## 📚 Next Steps

1. ✅ Connect React frontend to this API
2. ✅ Test all endpoints with Postman
3. ✅ Configure email notifications
4. ✅ Set up SMS notifications (optional)
5. ✅ Deploy to production server
6. ✅ Set up automatic backups
7. ✅ Add monitoring and logging

## 🤝 Support

For issues or questions:
- Check Django documentation: https://docs.djangoproject.com/
- Check DRF documentation: https://www.django-rest-framework.org/
- Review API with Postman

## 📄 License

Private project for Kalinga Temple Trust
