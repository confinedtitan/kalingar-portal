"""
Custom DRF permission classes for accounting views.
"""

from rest_framework import permissions
from django.contrib.auth.models import User


class IsAccountant(permissions.BasePermission):
    """
    Allow access to users who have an active StaffProfile with role=ACCOUNTANT.
    Admin users (is_staff=True) also pass this check.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin always passes
        if isinstance(request.user, User) and request.user.is_staff:
            return True
        # Check for StaffProfile with ACCOUNTANT role
        try:
            profile = request.user.staff_profile
            return profile.role == 'ACCOUNTANT' and profile.is_active
        except Exception:
            return False


class IsAccountantOrAdmin(permissions.BasePermission):
    """
    Combined permission: Accountant OR Admin.
    Identical logic to IsAccountant because Admin is already included.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if isinstance(request.user, User) and request.user.is_staff:
            return True
        try:
            profile = request.user.staff_profile
            return profile.role == 'ACCOUNTANT' and profile.is_active
        except Exception:
            return False


class IsAdmin(permissions.BasePermission):
    """Restrict access to Admin users only (is_staff=True)."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and isinstance(request.user, User)
            and request.user.is_staff
        )
