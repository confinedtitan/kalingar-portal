from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Member, Child, Announcement, Event, Meeting
from .serializers import (
    MemberSerializer, MemberCreateSerializer, MemberUpdateSerializer,
    MemberListSerializer, ChildSerializer, UserLoginSerializer,
    PasswordChangeSerializer, AdminPasswordResetSerializer,
    AnnouncementSerializer, EventSerializer, MeetingSerializer
)


class IsAdminOrOwner(permissions.BasePermission):
    """
    Custom permission: Admin can access everything, members can only access their own data
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.is_staff:
            return True
        # Members can only access their own profile
        return obj.user == request.user


class MemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Member CRUD operations
    """
    queryset = Member.objects.all()
    permission_classes = [IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'phone', 'father_name']
    ordering_fields = ['name', 'created_at', 'annual_tax', 'amount_due']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return MemberCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MemberUpdateSerializer
        elif self.action == 'list':
            return MemberListSerializer
        return MemberSerializer
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        if user.is_staff:
            # Admin sees all members
            return Member.objects.all()
        else:
            # Members see only their own profile
            return Member.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's member profile"""
        try:
            member = Member.objects.get(user=request.user)
            serializer = MemberSerializer(member)
            return Response(serializer.data)
        except Member.DoesNotExist:
            return Response(
                {'error': 'Member profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get member statistics (Admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        total_members = Member.objects.filter(is_active=True).count()
        total_paid = Member.objects.filter(amount_due=0).count()
        total_pending = Member.objects.filter(amount_due__gt=0).count()
        
        return Response({
            'total_members': total_members,
            'members_paid': total_paid,
            'members_pending': total_pending,
        })
    
    @action(detail=True, methods=['post'])
    def add_child(self, request, pk=None):
        """Add a child to a member"""
        member = self.get_object()
        serializer = ChildSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(member=member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """Export members to Excel (Admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from django.http import HttpResponse
        import csv
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="members.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Member ID', 'Name', 'Phone', 'DOB', 'Address',
            'Father Name', 'Mother Name', 'Spouse Name',
            'Children',
            'Annual Tax', 'Amount Paid', 'Amount Due', 'Status'
        ])
        
        members = Member.objects.prefetch_related('children').all()
        for member in members:
            children_list = '; '.join([
                f"{c.name} ({c.date_of_birth}, {c.gender})"
                for c in member.children.all()
            ])
            writer.writerow([
                member.member_id,
                member.name, member.phone,
                member.date_of_birth, member.address,
                member.father_name, member.mother_name, member.spouse_name,
                children_list,
                member.annual_tax, member.amount_paid, member.amount_due,
                member.payment_status
            ])
        
        return response


class ChildViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Child CRUD operations
    """
    queryset = Child.objects.all()
    serializer_class = ChildSerializer
    permission_classes = [IsAdminOrOwner]
    
    def get_queryset(self):
        """Filter children based on user role"""
        user = self.request.user
        if user.is_staff:
            return Child.objects.all()
        else:
            try:
                member = Member.objects.get(user=user)
                return Child.objects.filter(member=member)
            except Member.DoesNotExist:
                return Child.objects.none()


class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet for authentication operations
    """
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login with phone and password"""
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            password = serializer.validated_data['password']
            
            # Authenticate user
            user = authenticate(username=phone, password=password)
            
            if user:
                # Get or create token
                token, created = Token.objects.get_or_create(user=user)
                
                # Get member profile
                try:
                    member = Member.objects.get(user=user)
                    is_admin = user.is_staff
                    
                    return Response({
                        'token': token.key,
                        'user_id': user.id,
                        'phone': phone,
                        'is_admin': is_admin,
                        'member_id': member.id,
                        'name': member.name,
                        'password_reset_required': member.password_reset_required,
                    })
                except Member.DoesNotExist:
                    # Admin user without member profile
                    return Response({
                        'token': token.key,
                        'user_id': user.id,
                        'phone': phone,
                        'is_admin': user.is_staff,
                        'name': user.username,
                        'password_reset_required': False,
                    })
            else:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """Logout user"""
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        """Change user password"""
        serializer = PasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            if user.check_password(old_password):
                user.set_password(new_password)
                user.save()
                
                # Clear password reset required flag for member
                try:
                    member = Member.objects.get(user=user)
                    member.password_reset_required = False
                    member.save()
                except Member.DoesNotExist:
                    pass
                
                return Response({'message': 'Password changed successfully'})
            else:
                return Response(
                    {'error': 'Old password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reset_password(self, request):
        """Admin only: Reset member password to default (phone number)"""
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AdminPasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            member_id = serializer.validated_data['member_id']
            
            try:
                member = Member.objects.get(id=member_id)
                user = member.user
                
                # Reset password to phone number
                new_password = member.phone
                user.set_password(new_password)
                user.save()
                
                # Set password reset required flag
                member.password_reset_required = True
                member.save()
                
                return Response({
                    'message': f'Password reset successfully for {member.name}',
                    'temporary_password': new_password,
                    'member_id': member.id,
                })
            except Member.DoesNotExist:
                return Response(
                    {'error': 'Member not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin can do anything, others can only read"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Announcement.objects.all()
        return Announcement.objects.filter(is_active=True)


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Event.objects.all()
        return Event.objects.filter(is_active=True)


class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Meeting.objects.all()
        return Meeting.objects.filter(is_active=True)
