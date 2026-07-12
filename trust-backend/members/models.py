from __future__ import annotations
from typing import TYPE_CHECKING
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

if TYPE_CHECKING:
    from django.db.models import QuerySet

class Member(models.Model):
    """
    Model representing a Trust Member (Family Head)
    """
    # Link to Django User for authentication
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='member_profile')
    
    # Unique Member ID (auto-generated)
    member_id = models.CharField(max_length=20, unique=True, blank=True, verbose_name="Member ID")
    
    # Personal Information
    name = models.CharField(max_length=200, verbose_name="Member Name")
    name_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Member Name (Tamil)")
    phone_regex = RegexValidator(
        regex=r'^\d{10}$',
        message="Phone number must be exactly 10 digits."
    )
    phone = models.CharField(validators=[phone_regex], max_length=10, unique=True, verbose_name="Phone Number")

    date_of_birth = models.DateField(verbose_name="Date of Birth")
    address = models.TextField(verbose_name="Address")
    address_ta = models.TextField(blank=True, default='', verbose_name="Address (Tamil)")
    
    # Family Information
    father_name = models.CharField(max_length=200, verbose_name="Father's Name")
    father_name_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Father's Name (Tamil)")
    mother_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Mother's Name")
    mother_name_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Mother's Name (Tamil)")
    spouse_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Spouse's Name")
    spouse_name_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Spouse's Name (Tamil)")
    
    # Financial Information
    annual_tax = models.DecimalField(max_digits=10, decimal_places=2, default=20000.00, verbose_name="Annual Tax Amount")
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Amount Paid")
    amount_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Amount Due")
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Active Member")
    password_reset_required = models.BooleanField(default=True, verbose_name="Password Reset Required", help_text="Set to True when admin resets password")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Reverse relation — annotated explicitly so Pyright knows about it
    # (django-stubs cannot infer reverse relations from related_name strings)
    if TYPE_CHECKING:
        children: models.Manager[Child]
    
    class Meta:
        ordering = ['name']
        verbose_name = "Trust Member"
        verbose_name_plural = "Trust Members"
    
    def __str__(self):
        return f"{self.name} ({self.phone})"
    
    def save(self, *args, **kwargs):
        """Auto-generate member_id and calculate amount due before saving"""
        if not self.member_id:
            # Generate next member ID
            last = Member.objects.order_by('-id').first()
            if last and last.member_id:
                try:
                    num = int(last.member_id.split('-')[1]) + 1
                except (IndexError, ValueError):
                    num = 1
            else:
                num = 1
            self.member_id = f'KT-{num:04d}'
        from decimal import Decimal
        self.amount_due = Decimal(str(self.annual_tax)) - Decimal(str(self.amount_paid))
        super().save(*args, **kwargs)
    
    @property
    def payment_status(self):
        """Return payment status"""
        if self.amount_due <= 0:
            return "Paid"
        elif self.amount_paid > 0:
            return "Partial"
        else:
            return "Pending"


class Child(models.Model):
    """
    Model representing children of a member
    """
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('Unmarried', 'Unmarried'),
        ('Married', 'Married'),
    ]
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='children')
    name = models.CharField(max_length=200, verbose_name="Child Name")
    name_ta = models.CharField(max_length=200, blank=True, default='', verbose_name="Child Name (Tamil)")
    date_of_birth = models.DateField(verbose_name="Date of Birth")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name="Gender")
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, default='Unmarried', verbose_name="Marital Status")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date_of_birth']
        verbose_name = "Child"
        verbose_name_plural = "Children"
    
    def __str__(self):
        return f"{self.name} (Child of {self.member.name})"


class Announcement(models.Model):
    """Trust announcements managed by admin"""
    title = models.CharField(max_length=300)
    description = models.TextField()
    date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return self.title


class Event(models.Model):
    """Upcoming events managed by admin"""
    title = models.CharField(max_length=300)
    date = models.DateField()
    time = models.CharField(max_length=50, blank=True, default='')
    location = models.CharField(max_length=300, blank=True, default='')
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return self.title


class Meeting(models.Model):
    """Meetings managed by admin"""
    title = models.CharField(max_length=300)
    date = models.DateField()
    time = models.CharField(max_length=50, blank=True, default='')
    agenda = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return self.title


class TaxMaster(models.Model):
    """Admin defined tax events"""
    name = models.CharField(max_length=300, verbose_name="Tax Name")
    description = models.TextField(blank=True, default='')
    base_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Base Tax Amount per Count")
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=[('Open', 'Open'), ('Generated', 'Generated')], default='Open')
    generated_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.name} (Base: {self.base_amount})"


class MemberTax(models.Model):
    """Tax generated for a member based on a TaxMaster"""
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='taxes')
    tax = models.ForeignKey(TaxMaster, on_delete=models.CASCADE, related_name='member_taxes')
    tax_count = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Calculated Tax Count")
    total_tax = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total Tax Amount")
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Amount Paid")
    amount_due = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Amount Due")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('member', 'tax')
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.member.name} - {self.tax.name}"
        
    def save(self, *args, **kwargs):
        from decimal import Decimal
        self.amount_due = Decimal(str(self.total_tax)) - Decimal(str(self.amount_paid))
        super().save(*args, **kwargs)
        
    @property
    def payment_status(self):
        if self.amount_due <= 0:
            return "Paid"
        elif self.amount_paid > 0:
            return "Partial"
        else:
            return "Pending"


class Transaction(models.Model):
    """Payments made by members"""
    TRANSACTION_TYPES = [
        ('Payment', 'Payment'),
        ('Refund', 'Refund'),
    ]
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='transactions')
    member_tax = models.ForeignKey(MemberTax, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, default='Payment')
    receipt_number = models.CharField(max_length=100, unique=True, blank=True)
    payment_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.transaction_type} of {self.amount} by {self.member.name}"
        
    def save(self, *args, **kwargs):
        if not self.receipt_number:
            import uuid
            self.receipt_number = f"RCPT-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
