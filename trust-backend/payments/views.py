from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime, timedelta
import random
import string

from .models import Payment
from members.models import Member
from .serializers import (
    PaymentSerializer, PaymentCreateSerializer, PaymentListSerializer,
    PaymentStatisticsSerializer
)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payment CRUD operations
    """
    queryset = Payment.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'payment_method', 'member']
    search_fields = ['member__name', 'reference_number']
    ordering_fields = ['payment_date', 'amount', 'created_at']
    ordering = ['-payment_date']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return PaymentCreateSerializer
        elif self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        """Filter payments based on user role"""
        user = self.request.user
        if user.is_staff:
            # Admin sees all payments
            return Payment.objects.all()
        else:
            # Members see only their own payments
            try:
                member = Member.objects.get(user=user)
                return Payment.objects.filter(member=member)
            except Member.DoesNotExist:
                return Payment.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Create a new payment with auto-generated reference number"""
        data = request.data.copy()
        
        # Auto-generate reference number if not provided
        if 'reference_number' not in data or not data['reference_number']:
            data['reference_number'] = self.generate_reference_number()
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def generate_reference_number(self):
        """Generate a unique reference number"""
        prefix = 'TXN'
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=9))
        return f"{prefix}{random_str}"
    
    @action(detail=False, methods=['get'])
    def my_payments(self, request):
        """Get current user's payment history"""
        try:
            member = Member.objects.get(user=request.user)
            payments = Payment.objects.filter(member=member)
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Member profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get payment statistics (Admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Total payments
        total_payments = Payment.objects.filter(status='completed').count()
        total_collected = Payment.objects.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Total pending
        total_pending = Member.objects.aggregate(
            total=Sum('amount_due')
        )['total'] or 0
        
        # This month's data
        today = datetime.now()
        first_day_month = today.replace(day=1)
        
        payments_this_month = Payment.objects.filter(
            status='completed',
            payment_date__gte=first_day_month
        ).count()
        
        amount_this_month = Payment.objects.filter(
            status='completed',
            payment_date__gte=first_day_month
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        data = {
            'total_payments': total_payments,
            'total_amount_collected': total_collected,
            'total_pending': total_pending,
            'payments_this_month': payments_this_month,
            'amount_this_month': amount_this_month,
        }
        
        serializer = PaymentStatisticsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent payments (Admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        limit = int(request.query_params.get('limit', 10))
        recent_payments = Payment.objects.all()[:limit]
        serializer = PaymentSerializer(recent_payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """Export payments to Excel (Admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.http import HttpResponse
        import csv
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="payments.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Payment Date', 'Member Name', 'Member Phone', 'Amount',
            'Payment Method', 'Reference Number', 'Status'
        ])
        
        payments = Payment.objects.select_related('member').all()
        for payment in payments:
            writer.writerow([
                payment.payment_date,
                payment.member.name,
                payment.member.phone,
                payment.amount,
                payment.payment_method,
                payment.reference_number,
                payment.status
            ])
        
        return response
