from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import (
    MemberViewSet, ChildViewSet, AuthViewSet,
    AnnouncementViewSet, EventViewSet, MeetingViewSet
)

# Use SimpleRouter (no API root view) so it doesn't shadow the member list at ^$
content_router = SimpleRouter()
content_router.register(r'announcements', AnnouncementViewSet, basename='announcement')
content_router.register(r'events', EventViewSet, basename='event')
content_router.register(r'meetings', MeetingViewSet, basename='meeting')
content_router.register(r'children', ChildViewSet, basename='child')
content_router.register(r'auth', AuthViewSet, basename='auth')

# Member router — r'' catch-all must come LAST
member_router = DefaultRouter()
member_router.register(r'', MemberViewSet, basename='member')

urlpatterns = [
    # Content/auth/children URLs first (specific prefixes)
    path('', include(content_router.urls)),
    # Member URLs last (catch-all prefix)
    path('', include(member_router.urls)),
]
