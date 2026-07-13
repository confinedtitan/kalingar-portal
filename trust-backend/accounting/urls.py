from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StaffProfileViewSet,
    AccountHeadViewSet,
    AccountTransactionViewSet,
    ReceiptViewSet,
    TrustAccountViewSet,
)

router = DefaultRouter()
router.register(r'staff', StaffProfileViewSet, basename='staff')
router.register(r'account-heads', AccountHeadViewSet, basename='accounthead')
router.register(r'transactions', AccountTransactionViewSet, basename='accounttransaction')
router.register(r'receipts', ReceiptViewSet, basename='receipt')
router.register(r'trust-accounts', TrustAccountViewSet, basename='trustaccount')

urlpatterns = [
    path('', include(router.urls)),
]
