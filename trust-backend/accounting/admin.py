from django.contrib import admin
from .models import StaffProfile, AccountHead, AccountTransaction, Receipt


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('name', 'phone')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AccountHead)
class AccountHeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'head_type', 'is_active', 'created_by', 'created_at')
    list_filter = ('is_active', 'head_type')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AccountTransaction)
class AccountTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'account_head', 'transaction_type', 'amount',
        'transaction_date', 'payment_mode', 'entered_by', 'is_deleted',
    )
    list_filter = ('transaction_type', 'payment_mode', 'is_deleted', 'account_head')
    search_fields = ('donor_name', 'paid_to', 'purpose', 'purpose_description')
    readonly_fields = ('entered_by', 'change_log', 'created_at', 'updated_at')
    raw_id_fields = ('member',)


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'transaction', 'generated_at')
    search_fields = ('receipt_number',)
    readonly_fields = ('receipt_number', 'generated_at')
    raw_id_fields = ('transaction',)
