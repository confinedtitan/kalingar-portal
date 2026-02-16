from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(ImportExportModelAdmin):
    """Admin interface for Payment model with import/export"""
    
    list_display = [
        'reference_number', 'member', 'amount', 'payment_method',
        'payment_date', 'status'
    ]
    
    list_filter = ['status', 'payment_method', 'payment_date']
    
    search_fields = ['member__name', 'reference_number', 'member__phone']
    
    readonly_fields = ['payment_date', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('member', 'amount', 'payment_method', 'reference_number')
        }),
        ('Status & Date', {
            'fields': ('status', 'payment_date')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    autocomplete_fields = ['member']
    
    def get_readonly_fields(self, request, obj=None):
        """Make member and amount readonly after creation"""
        if obj:  # Editing an existing object
            return self.readonly_fields + ['member', 'amount']
        return self.readonly_fields
