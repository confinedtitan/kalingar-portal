#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trust_portal.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import User

# Update admin user
try:
    admin_user = User.objects.get(is_superuser=True)
    print(f"Found admin user: {admin_user.username}")
    
    # Update username and password
    admin_user.username = '1234567890'
    admin_user.set_password('1234567890')
    admin_user.save()
    
    print(f"✅ Admin credentials updated successfully!")
    print(f"📱 Username: 1234567890")
    print(f"🔑 Password: 1234567890")
    print(f"✨ Admin can now login with these credentials")
    
except User.DoesNotExist:
    print("❌ No superuser found. Please create one first:")
    print("python manage.py createsuperuser")
except Exception as e:
    print(f"❌ Error: {e}")
