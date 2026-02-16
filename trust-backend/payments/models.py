from django.db import models
from members.models import Member


class Payment(models.Model):
    """
    Model representing a payment made by a member
    """
    PAYMENT_METHOD_CHOICES = [
        ('UPI', 'UPI'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Cash', 'Cash'),
        ('Cheque', 'Cheque'),
        ('Card', 'Debit/Credit Card'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Payment Amount")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, verbose_name="Payment Method")
    reference_number = models.CharField(max_length=100, unique=True, verbose_name="Transaction Reference")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed', verbose_name="Payment Status")
    
    payment_date = models.DateField(auto_now_add=True, verbose_name="Payment Date")
    notes = models.TextField(blank=True, null=True, verbose_name="Notes")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-payment_date', '-created_at']
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
    
    def __str__(self):
        return f"₹{self.amount} by {self.member.name} on {self.payment_date}"
    
    def save(self, *args, **kwargs):
        """Update member's payment totals when payment is saved"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update member's amount paid if payment is completed
        if self.status == 'completed':
            if is_new:
                self.member.amount_paid += self.amount
            self.member.save()
