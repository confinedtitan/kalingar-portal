from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Member, Announcement, Event, Meeting, TaxMaster, MemberTax, Transaction


class ChildSerializer(serializers.ModelSerializer):
    """Serializer for Child model (now backed by Member schema)"""
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = ['id', 'name', 'name_ta', 'date_of_birth', 'gender', 'marital_status']

class TaxMasterSerializer(serializers.ModelSerializer):
    account_head_name = serializers.CharField(source='account_head.name', read_only=True, default=None)
    
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
    children = ChildSerializer(source='children_set', many=True, read_only=True)
    taxes = MemberTaxSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    amount_due = serializers.SerializerMethodField()
    annual_tax = serializers.SerializerMethodField()
    amount_paid = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'id', 'member_id', 'reference_id', 'username',
            'name', 'name_ta', 'phone', 'date_of_birth',
            'address', 'address_ta',
            'father', 'fallback_father_name_en', 'fallback_father_name_ta',
            'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'annual_tax', 'amount_paid', 'amount_due', 'payment_status',
            'is_active', 'is_expired', 'is_family_head', 'password_reset_required',
            'children', 'taxes', 'transactions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['member_id', 'amount_due', 'password_reset_required', 'created_at', 'updated_at']

    def get_amount_due(self, obj):
        taxes = getattr(obj, 'taxes', None)
        if taxes and taxes.exists():
            return sum(tax.amount_due for tax in taxes.all())
        return obj.amount_due

    def get_annual_tax(self, obj):
        taxes = getattr(obj, 'taxes', None)
        if taxes and taxes.exists():
            return sum(tax.total_tax for tax in taxes.all())
        return obj.annual_tax

    def get_amount_paid(self, obj):
        taxes = getattr(obj, 'taxes', None)
        if taxes and taxes.exists():
            return sum(tax.amount_paid for tax in taxes.all())
        return obj.amount_paid

    def get_payment_status(self, obj):
        due = self.get_amount_due(obj)
        paid = self.get_amount_paid(obj)
        if due <= 0:
            return "Paid"
        elif paid > 0:
            return "Partial"
        return "Pending"


class MemberCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new member with children"""
    children = ChildSerializer(many=True, required=False)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'name', 'name_ta', 'phone', 'password', 'date_of_birth',
            'address', 'address_ta',
            'father', 'fallback_father_name_en', 'fallback_father_name_ta',
            'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'annual_tax', 'reference_id', 'children'
        ]
    
    def validate_phone(self, value):
        """Normalize phone to 10 digits and check uniqueness"""
        import re
        value = value.strip().replace(' ', '')
        if value.startswith('+91'):
            value = value[3:]
        elif value.startswith('91') and len(value) == 12:
            value = value[2:]
        
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        
        if Member.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A member with this phone number already exists.")
        return value
    
    def create(self, validated_data):
        """Create member with user account and children"""
        children_data = validated_data.pop('children', [])
        password = validated_data.pop('password')
        
        # Primary member created via the form is a family head by default
        validated_data['is_family_head'] = True
        validated_data['is_active'] = True
        validated_data['is_expired'] = False
        
        # Create member (will trigger provision_credentials automatically with user=None)
        member = Member.objects.create(**validated_data)
        
        # Update password for the automatically provisioned user
        if member.user:
            member.user.set_password(password)
            member.user.save()
        
        # Create Children as Member rows
        for child_data in children_data:
            Member.objects.create(
                father=member,
                name=child_data['name'],
                name_ta=child_data.get('name_ta', ''),
                date_of_birth=child_data['date_of_birth'],
                gender=child_data.get('gender'),
                marital_status=child_data.get('marital_status', 'Unmarried'),
                address=member.address,
                address_ta=member.address_ta,
                is_family_head=False,
                is_active=True,
                is_expired=False,
                phone=None,
                user=None,
                annual_tax=0.00
            )
        
        return member


class MemberUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating member information"""
    children = ChildSerializer(many=True, required=False)
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'name', 'name_ta', 'date_of_birth',
            'address', 'address_ta',
            'father', 'fallback_father_name_en', 'fallback_father_name_ta',
            'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'annual_tax', 'reference_id', 'is_active', 'is_expired', 'is_family_head',
            'children'
        ]

    def update(self, instance, validated_data):
        children_data = validated_data.pop('children', None)
        
        # Update normal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle nested children updates
        if children_data is not None:
            existing_children = {c.id: c for c in instance.children_set.all()}
            updated_ids = []
            
            for child_item in children_data:
                child_id = child_item.get('id')
                if child_id and child_id in existing_children:
                    child = existing_children[child_id]
                    child.name = child_item.get('name', child.name)
                    child.name_ta = child_item.get('name_ta', child.name_ta)
                    child.date_of_birth = child_item.get('date_of_birth', child.date_of_birth)
                    child.gender = child_item.get('gender', child.gender)
                    child.marital_status = child_item.get('marital_status', child.marital_status)
                    # Copy address from father
                    child.address = instance.address
                    child.address_ta = instance.address_ta
                    child.save()
                    updated_ids.append(child.id)
                else:
                    new_child = Member.objects.create(
                        father=instance,
                        name=child_item['name'],
                        name_ta=child_item.get('name_ta', ''),
                        date_of_birth=child_item['date_of_birth'],
                        gender=child_item.get('gender'),
                        marital_status=child_item.get('marital_status', 'Unmarried'),
                        address=instance.address,
                        address_ta=instance.address_ta,
                        is_family_head=False,
                        is_active=True,
                        is_expired=False,
                        phone=None,
                        user=None,
                        annual_tax=0.00
                    )
                    updated_ids.append(new_child.id)
                    
            # Delete children not in updated_ids
            for child_id, child in existing_children.items():
                if child_id not in updated_ids:
                    child.delete()
                    
        return instance


class MemberListSerializer(serializers.ModelSerializer):
    """Simplified serializer for member list view"""
    payment_status = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    children = ChildSerializer(source='children_set', many=True, read_only=True)
    taxes = MemberTaxSerializer(many=True, read_only=True)
    amount_due = serializers.SerializerMethodField()
    annual_tax = serializers.SerializerMethodField()
    amount_paid = serializers.SerializerMethodField()
    
    class Meta:  # type: ignore[assignment]
        model = Member
        fields = [
            'id', 'member_id', 'name', 'name_ta', 'phone', 'annual_tax', 'date_of_birth',
            'amount_paid', 'amount_due', 'payment_status',
            'father', 'father_name', 'father_name_ta',
            'mother_name', 'mother_name_ta',
            'spouse_name', 'spouse_name_ta',
            'children', 'children_count', 'taxes', 'is_active', 'is_expired', 'is_family_head', 'password_reset_required'
        ]
    
    def get_children_count(self, obj):
        return obj.children_set.count()

    def get_amount_due(self, obj):
        taxes = getattr(obj, 'taxes', None)
        if taxes and taxes.exists():
            return sum(tax.amount_due for tax in taxes.all())
        return obj.amount_due

    def get_annual_tax(self, obj):
        taxes = getattr(obj, 'taxes', None)
        if taxes and taxes.exists():
            return sum(tax.total_tax for tax in taxes.all())
        return obj.annual_tax

    def get_amount_paid(self, obj):
        taxes = getattr(obj, 'taxes', None)
        if taxes and taxes.exists():
            return sum(tax.amount_paid for tax in taxes.all())
        return obj.amount_paid

    def get_payment_status(self, obj):
        due = self.get_amount_due(obj)
        paid = self.get_amount_paid(obj)
        if due <= 0:
            return "Paid"
        elif paid > 0:
            return "Partial"
        return "Pending"


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
