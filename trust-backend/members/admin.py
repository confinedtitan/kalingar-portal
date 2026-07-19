from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Member, TaxMaster, MemberTax, Transaction


class ChildInline(admin.TabularInline):
    """Inline admin for children"""
    model = Member
    fk_name = 'father'
    extra = 1
    fields = ('name', 'name_ta', 'date_of_birth', 'gender', 'marital_status', 'is_family_head')


@admin.register(Member)
class MemberAdmin(ImportExportModelAdmin):
    """Admin interface for Member model with import/export"""
    
    list_display = (  # type: ignore[assignment]
        'name', 'name_ta', 'phone', 'payment_status',
        'annual_tax', 'amount_paid', 'amount_due', 'tax_count', 'old_balance', 'is_active'
    )
    
    list_filter = ('is_active', 'created_at')
    
    search_fields = ('name', 'name_ta', 'phone', 'father_name', 'father_name_ta')
    
    readonly_fields = ('amount_due', 'payment_status', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User Account', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('name', 'name_ta', 'phone', 'date_of_birth', 'address', 'address_ta', 'address_city', 'address_city_ta')
        }),
        ('Family Information', {
            'fields': ('father_name', 'father_name_ta', 'mother_name', 'mother_name_ta', 'spouse_name', 'spouse_name_ta')
        }),
        ('Financial Information', {
            'fields': ('annual_tax', 'amount_paid', 'amount_due', 'payment_status', 'tax_count', 'old_balance')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = (ChildInline,)
    
    def get_readonly_fields(self, request, obj=None):
        """Make user field readonly after creation"""
        if obj:  # Editing an existing object
            return (*self.readonly_fields, 'user')
        return self.readonly_fields


@admin.register(TaxMaster)
class TaxMasterAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_amount', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)
    actions = ['generate_taxes']

    @admin.action(description='Generate taxes for all active family heads')
    def generate_taxes(self, request, queryset):
        from .utils import calculate_member_tax_count
        for tax_master in queryset:
            members = Member.objects.filter(is_family_head=True, is_active=True)
            created_count = 0
            for member in members:
                tax_count = calculate_member_tax_count(member)
                total_tax = tax_count * tax_master.base_amount
                
                # Check if tax already exists
                obj, created = MemberTax.objects.update_or_create(
                    member=member,
                    tax=tax_master,
                    defaults={
                        'tax_count': tax_count,
                        'total_tax': total_tax,
                    }
                )
                if created:
                    created_count += 1
            self.message_user(request, f"Generated {created_count} new taxes for '{tax_master.name}'.")

@admin.register(MemberTax)
class MemberTaxAdmin(admin.ModelAdmin):
    list_display = ('member', 'tax', 'tax_count', 'total_tax', 'amount_due', 'payment_status')
    list_filter = ('tax', 'created_at')
    search_fields = ('member__name', 'member__phone')
    readonly_fields = ('amount_due',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'member', 'amount', 'transaction_type', 'payment_date')
    list_filter = ('transaction_type', 'payment_date')
    search_fields = ('receipt_number', 'member__name', 'member__phone')
    readonly_fields = ('receipt_number',)
