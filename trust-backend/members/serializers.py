from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Member, Child, Announcement, Event, Meeting, TaxMaster, MemberTax, Transaction


class ChildSerializer(serializers.ModelSerializer):
    """Serializer for Child model"""
    
    class Meta:  # type: ignore[assignment]
        model = Child
        fields = ['id', 'name', 'name_ta', 'date_of_birth', 'gender', 'marital_status']

class TaxMasterSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore[assignment]
        model = TaxMaster
        fields = '__all__'

class MemberTaxSerializer(serializers.ModelSerializer):
    tax_name = serializers.CharField(source='tax.name', read_only=True)
    base_amount = serializers.DecimalField(source='tax.base_amount', read_only=True, max_digits=10, decimal_places=2)
    payment_status = serializers.ReadOnlyField()
    
    class Meta:  # type: ignore[assignment]
        model = MemberTax
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore[assignment]
        model = Transaction
        fields = '__all__'


class MemberSerializer(serializers.ModelSerializer):
    """Serializer for Member model"""
    children = ChildSerializer(many=True, read_only=True)
    taxes = MemberTaxSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    payment_status = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'id', 'member_id', 'username',
            'name', 'name_ta', 'phone', 'date_of_birth',
            'address', 'address_ta',
            'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'annual_tax', 'amount_paid', 'amount_due', 'payment_status',
            'is_active', 'password_reset_required', 'children', 'taxes', 'transactions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['member_id', 'amount_due', 'password_reset_required', 'created_at', 'updated_at']


class MemberCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new member with children"""
    children = ChildSerializer(many=True, required=False)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'name', 'name_ta', 'phone', 'password', 'date_of_birth',
            'address', 'address_ta',
            'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'annual_tax', 'children'
        ]
    
    def validate_phone(self, value):
        """Normalize phone to 10 digits and check uniqueness"""
        import re
        # Strip whitespace and any +91 or 91 prefix
        value = value.strip().replace(' ', '')
        if value.startswith('+91'):
            value = value[3:]
        elif value.startswith('91') and len(value) == 12:
            value = value[2:]
        
        # Must be exactly 10 digits
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A member with this phone number already exists.")
        return value
    

    def create(self, validated_data):
        """Create member with user account and children"""
        children_data = validated_data.pop('children', [])
        password = validated_data.pop('password')
        
        # Create Django User
        user = User.objects.create_user(
            username=validated_data['phone'],
            password=password
        )
        
        # Create Member
        member = Member.objects.create(user=user, **validated_data)
        
        # Create Children
        for child_data in children_data:
            Child.objects.create(member=member, **child_data)
        
        return member


class MemberUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating member information"""
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'name', 'name_ta', 'date_of_birth',
            'address', 'address_ta',
            'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'annual_tax', 'is_active'
        ]


class MemberListSerializer(serializers.ModelSerializer):
    """Simplified serializer for member list view"""
    payment_status = serializers.ReadOnlyField()
    children_count = serializers.SerializerMethodField()
    children = ChildSerializer(many=True, read_only=True)
    taxes = MemberTaxSerializer(many=True, read_only=True)
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'id', 'member_id', 'name', 'name_ta', 'phone', 'annual_tax',
            'amount_paid', 'amount_due', 'payment_status',
            'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'children', 'children_count', 'taxes', 'is_active', 'password_reset_required'
        ]
    
    def get_children_count(self, obj):
        return obj.children.count()


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    phone = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate_phone(self, value):
        """Normalize phone to 10 digits"""
        value = value.strip().replace(' ', '')
        if value.startswith('+91'):
            value = value[3:]
        elif value.startswith('91') and len(value) == 12:
            value = value[2:]
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)


class AdminPasswordResetSerializer(serializers.Serializer):
    """Serializer for admin to reset member password to default (phone number)"""
    member_id = serializers.IntegerField(required=True)
    
    def validate_member_id(self, value):
        """Validate that member exists"""
        try:
            Member.objects.get(id=value)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Member not found")
        return value


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore[assignment]
        model = Announcement
        fields = ['id', 'title', 'description', 'date', 'is_active', 'created_at', 'updated_at']


class EventSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore[assignment]
        model = Event
        fields = ['id', 'title', 'date', 'time', 'location', 'description', 'is_active', 'created_at', 'updated_at']


class MeetingSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore[assignment]
        model = Meeting
        fields = ['id', 'title', 'date', 'time', 'agenda', 'is_active', 'created_at', 'updated_at']
