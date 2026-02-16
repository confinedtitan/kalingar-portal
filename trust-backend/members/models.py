from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

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
    phone_regex = RegexValidator(
        regex=r'^\d{10}$',
        message="Phone number must be exactly 10 digits."
    )
    phone = models.CharField(validators=[phone_regex], max_length=10, unique=True, verbose_name="Phone Number")

    date_of_birth = models.DateField(verbose_name="Date of Birth")
    address = models.TextField(verbose_name="Address")
    
    # Family Information
    father_name = models.CharField(max_length=200, verbose_name="Father's Name")
    mother_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Mother's Name")
    spouse_name = models.CharField(max_length=200, blank=True, null=True, verbose_name="Spouse's Name")
    
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
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='children')
    name = models.CharField(max_length=200, verbose_name="Child Name")
    date_of_birth = models.DateField(verbose_name="Date of Birth")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name="Gender")
    
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
