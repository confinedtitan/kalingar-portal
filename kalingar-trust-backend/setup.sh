#!/bin/bash

# Kalingar Trust Backend Setup Script

echo "🚀 Setting up Kalingar Trust Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📋 Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
python3 -c "
from app import create_app, db
from app.models import User, Member, BankAccount

app = create_app()
with app.app_context():
    db.create_all()
    print('Database tables created successfully!')
"

echo "✅ Setup complete!"
echo ""
echo "To start the server:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run the server: python app.py"
echo ""
echo "The API will be available at: http://localhost:5000"
echo "Login credentials: shamganesh / 123456789"
