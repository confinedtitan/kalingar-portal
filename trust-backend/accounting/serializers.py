"""
DRF serializers for the accounting app.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone

from .models import StaffProfile, AccountHead, AccountTransaction, Receipt


# ---------------------------------------------------------------------------
# StaffProfile
# ---------------------------------------------------------------------------

class StaffProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            'id', 'username', 'name', 'name_ta', 'phone', 'role',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class StaffProfileCreateSerializer(serializers.Serializer):
    """Create a Django User + StaffProfile in one step."""

    name = serializers.CharField(max_length=200)
    name_ta = serializers.CharField(max_length=200, allow_blank=True, default='')
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(
        choices=StaffProfile.ROLE_CHOICES, default='ACCOUNTANT',
    )

    def validate_phone(self, value):
        import re
        value = value.strip().replace(' ', '')
        if value.startswith('+91'):
            value = value[3:]
        elif value.startswith('91') and len(value) == 12:
            value = value[2:]
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError(
                "Phone number must be exactly 10 digits."
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this phone number already exists."
            )
        return value

    def create(self, validated_data):
        phone = validated_data['phone']
        user = User.objects.create_user(
            username=phone,
            password=validated_data['password'],
            is_staff=False,
        )
        profile = StaffProfile.objects.create(
            user=user,
            name=validated_data['name'],
            name_ta=validated_data.get('name_ta', ''),
            phone=phone,
            role=validated_data.get('role', 'ACCOUNTANT'),
        )
        return profile


# ---------------------------------------------------------------------------
# AccountHead
# ---------------------------------------------------------------------------

class AccountHeadSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AccountHead
        fields = [
            'id', 'name', 'name_ta', 'description', 'description_ta', 'head_type',
            'is_active', 'created_by', 'created_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return None
        # Try StaffProfile first, then Member, then username
        try:
            return obj.created_by.staff_profile.name
        except Exception:
            pass
        try:
            return obj.created_by.member_profile.name
        except Exception:
            pass
        return obj.created_by.get_username()


# ---------------------------------------------------------------------------
# AccountTransaction
# ---------------------------------------------------------------------------

class AccountTransactionSerializer(serializers.ModelSerializer):
    """Read serializer with nested display fields."""

    account_head_name = serializers.CharField(
        source='account_head.name', read_only=True,
    )
    entered_by_name = serializers.SerializerMethodField()
    member_name = serializers.CharField(
        source='member.name', read_only=True, default=None,
    )
    member_id_display = serializers.CharField(
        source='member.member_id', read_only=True, default=None,
    )
    receipt_number = serializers.CharField(
        source='receipt.receipt_number', read_only=True, default=None,
    )
    receipt_id = serializers.IntegerField(
        source='receipt.id', read_only=True, default=None,
    )

    class Meta:
        model = AccountTransaction
        fields = [
            'id', 'account_head', 'account_head_name',
            'transaction_type', 'amount', 'transaction_date',
            'payment_mode',
            # Income fields
            'donor_name', 'donor_name_ta', 'donor_contact', 'member', 'member_name',
            'member_id_display', 'purpose', 'purpose_ta',
            # Expense fields
            'paid_to', 'paid_to_ta', 'purpose_description', 'purpose_description_ta', 'bill_reference',
            # Tracking
            'proof_document', 'entered_by', 'entered_by_name',
            'is_deleted', 'change_log',
            'receipt_number', 'receipt_id',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'entered_by', 'is_deleted', 'change_log',
            'created_at', 'updated_at',
        ]

    def get_entered_by_name(self, obj):
        if not obj.entered_by:
            return None
        try:
            return obj.entered_by.staff_profile.name
        except Exception:
            pass
        try:
            return obj.entered_by.member_profile.name
        except Exception:
            pass
        return obj.entered_by.get_username()


class AccountTransactionCreateSerializer(serializers.ModelSerializer):
    """Write serializer with validation."""

    class Meta:
        model = AccountTransaction
        fields = [
            'account_head', 'transaction_type', 'amount',
            'transaction_date', 'payment_mode',
            'donor_name', 'donor_name_ta', 'donor_contact', 'member', 'purpose', 'purpose_ta',
            'paid_to', 'paid_to_ta', 'purpose_description', 'purpose_description_ta', 'bill_reference',
            'proof_document',
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )
        return value

    def validate_transaction_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError(
                "Transaction date cannot be in the future."
            )
        return value

    def validate_account_head(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "Cannot create a transaction under a deactivated Account Head."
            )
        return value


# ---------------------------------------------------------------------------
# Receipt
# ---------------------------------------------------------------------------

class ReceiptSerializer(serializers.ModelSerializer):
    transaction_id = serializers.IntegerField(
        source='transaction.id', read_only=True,
    )

    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'transaction_id',
            'generated_at', 'pdf_file',
        ]
        read_only_fields = ['receipt_number', 'generated_at', 'pdf_file']
