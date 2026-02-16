from rest_framework import serializers
from .models import Payment
from members.models import Member


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    member_phone = serializers.CharField(source='member.phone', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'member', 'member_name', 'member_phone',
            'amount', 'payment_method', 'reference_number', 'status',
            'payment_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['payment_date', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new payment"""
    
    class Meta:
        model = Payment
        fields = ['member', 'amount', 'payment_method', 'reference_number', 'notes']
    
    def create(self, validated_data):
        """Create payment and update member balance"""
        validated_data['status'] = 'completed'
        payment = Payment.objects.create(**validated_data)
        return payment


class PaymentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for payment list view"""
    member_name = serializers.CharField(source='member.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'member_name', 'amount', 'payment_method',
            'reference_number', 'status', 'payment_date'
        ]


class PaymentStatisticsSerializer(serializers.Serializer):
    """Serializer for payment statistics"""
    total_payments = serializers.IntegerField()
    total_amount_collected = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_pending = serializers.DecimalField(max_digits=15, decimal_places=2)
    payments_this_month = serializers.IntegerField()
    amount_this_month = serializers.DecimalField(max_digits=15, decimal_places=2)
