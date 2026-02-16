from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from members.models import Member, Child
from payments.models import Payment
from datetime import date


class Command(BaseCommand):
    help = 'Creates sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create sample member 1
        user1 = User.objects.create_user(
            username='+919876543210',
            email='rajesh@email.com',
            password='member123'
        )
        
        member1 = Member.objects.create(
            user=user1,
            name='Rajesh Kumar',
            phone='+919876543210',
            email='rajesh@email.com',
            date_of_birth=date(1975, 5, 15),
            address='123 Temple Street, Chennai',
            father_name='Venkatesh Kumar',
            mother_name='Lakshmi Kumar',
            spouse_name='Priya Rajesh',
            annual_tax=25000,
            amount_paid=15000
        )
        
        Child.objects.create(
            member=member1,
            name='Arjun Rajesh',
            date_of_birth=date(2005, 8, 20),
            gender='Male'
        )
        
        Child.objects.create(
            member=member1,
            name='Anjali Rajesh',
            date_of_birth=date(2008, 3, 12),
            gender='Female'
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
            username='+919876543211',
            email='suresh@email.com',
            password='member123'
        )
        
        member2 = Member.objects.create(
            user=user2,
            name='Suresh Babu',
            phone='+919876543211',
            email='suresh@email.com',
            date_of_birth=date(1980, 11, 23),
            address='456 Gandhi Road, Chennai',
            father_name='Ramesh Babu',
            mother_name='Saraswathi Babu',
            spouse_name='Meena Suresh',
            annual_tax=20000,
            amount_paid=20000
        )
        
        Child.objects.create(
            member=member2,
            name='Karthik Suresh',
            date_of_birth=date(2010, 6, 15),
            gender='Male'
        )
        
        # Create payment for member 2
        Payment.objects.create(
            member=member2,
            amount=20000,
            payment_method='Bank Transfer',
            reference_number='TXN123457',
            status='completed'
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Sample data created successfully!'))
        self.stdout.write(self.style.SUCCESS(''))
        self.stdout.write(self.style.SUCCESS('Test Login Credentials:'))
        self.stdout.write(self.style.SUCCESS('Phone: +919876543210'))
        self.stdout.write(self.style.SUCCESS('Password: member123'))
