from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Member, Child


class ChildInline(admin.TabularInline):
    """Inline admin for children"""
    model = Child
    extra = 1
    fields = ['name', 'date_of_birth', 'gender']


@admin.register(Member)
class MemberAdmin(ImportExportModelAdmin):
    """Admin interface for Member model with import/export"""
    
    list_display = [
        'name', 'phone', 'payment_status', 
        'annual_tax', 'amount_paid', 'amount_due', 'is_active'
    ]
    
    list_filter = ['is_active', 'created_at']
    
    search_fields = ['name', 'phone', 'father_name']
    
    readonly_fields = ['amount_due', 'payment_status', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User Account', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('name', 'phone', 'date_of_birth', 'address')
        }),
        ('Family Information', {
            'fields': ('father_name', 'mother_name', 'spouse_name')
        }),
        ('Financial Information', {
            'fields': ('annual_tax', 'amount_paid', 'amount_due', 'payment_status')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ChildInline]
    
    def get_readonly_fields(self, request, obj=None):
        """Make user field readonly after creation"""
        if obj:  # Editing an existing object
            return self.readonly_fields + ['user']
        return self.readonly_fields


@admin.register(Child)
class ChildAdmin(admin.ModelAdmin):
    """Admin interface for Child model"""
    
    list_display = ['name', 'member', 'date_of_birth', 'gender']
    
    list_filter = ['gender', 'date_of_birth']
    
    search_fields = ['name', 'member__name']
    
    autocomplete_fields = ['member']
