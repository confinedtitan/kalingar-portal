from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from members.models import Member
from payments.models import Payment
from datetime import date


class Command(BaseCommand):
    help = 'Creates sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create sample member 1
        user1 = User.objects.create_user(
            username='9876543210',
            password='member123'
        )
        
        member1 = Member.objects.create(
            user=user1,
            name='Rajesh Kumar',
            phone='9876543210',
            date_of_birth=date(1975, 5, 15),
            address='123 Temple Street, Chennai',
            father_name='Venkatesh Kumar',
            mother_name='Lakshmi Kumar',
            spouse_name='Priya Rajesh',
            annual_tax=25000,
            amount_paid=15000,
            is_family_head=True,
            is_active=True,
            is_expired=False,
        )
        
        Member.objects.create(
            father=member1,
            name='Arjun Rajesh',
            date_of_birth=date(2005, 8, 20),
            gender='Male',
            marital_status='Unmarried',
            address=member1.address,
            address_ta=member1.address_ta,
            is_family_head=False,
            is_active=True,
            is_expired=False,
            annual_tax=0.00
        )
        
        Member.objects.create(
            father=member1,
            name='Anjali Rajesh',
            date_of_birth=date(2008, 3, 12),
            gender='Female',
            marital_status='Unmarried',
            address=member1.address,
            address_ta=member1.address_ta,
            is_family_head=False,
            is_active=True,
            is_expired=False,
            annual_tax=0.00
        )
        
        # Create payment for member 1
        Payment.objects.create(
            member=member1,
            amount=15000,
            payment_method='UPI',
            reference_number='TXN123456',
            status='completed'
        )
        
        # Create sample member 2
        user2 = User.objects.create_user(
            username='9876543211',
            password='member123'
        )
        
        member2 = Member.objects.create(
            user=user2,
            name='Suresh Babu',
            phone='9876543211',
            date_of_birth=date(1980, 11, 23),
            address='456 Gandhi Road, Chennai',
            father_name='Ramesh Babu',
            mother_name='Saraswathi Babu',
            spouse_name='Meena Suresh',
            annual_tax=20000,
            amount_paid=20000,
            is_family_head=True,
            is_active=True,
            is_expired=False,
        )
        
        Member.objects.create(
            father=member2,
            name='Karthik Suresh',
            date_of_birth=date(2010, 6, 15),
            gender='Male',
            marital_status='Unmarried',
            address=member2.address,
            address_ta=member2.address_ta,
            is_family_head=False,
            is_active=True,
            is_expired=False,
            annual_tax=0.00
        )
        
        # Create payment for member 2
        Payment.objects.create(
            member=member2,
            amount=20000,
            payment_method='Bank Transfer',
            reference_number='TXN123457',
            status='completed'
        )
        
        self.stdout.write(self.style.SUCCESS('[OK] Sample data created successfully!'))
        self.stdout.write(self.style.SUCCESS(''))
        self.stdout.write(self.style.SUCCESS('Test Login Credentials:'))
        self.stdout.write(self.style.SUCCESS('Phone: 9876543210'))
        self.stdout.write(self.style.SUCCESS('Password: member123'))
