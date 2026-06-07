"""
Trust Portal URL Configuration
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, Http404
from rest_framework.authtoken.views import obtain_auth_token
from django.views.generic import TemplateView


def react_app_view(request):
    """Serve React's index.html if the build exists, otherwise return 404."""
    react_index = settings.REACT_BUILD_DIR / 'index.html'
    if react_index.exists():
        return TemplateView.as_view(template_name='index.html')(request)
    # During development (npm start), the React dev server handles the frontend.
    # Return a simple 404 instead of a 500 for non-API, non-file routes.
    raise Http404("React build not found. Run 'npm run build' or use 'npm start' dev server.")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', obtain_auth_token, name='api_token_auth'),
    path('api/members/', include('members.urls')),
    path('api/payments/', include('payments.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve React's index.html for any non-API route.
# Excludes common browser-requested static files (favicon, serviceWorker, manifest)
# to avoid 500 errors when the React build folder doesn't exist (during dev).
# This must be LAST so API and admin routes take priority.
urlpatterns += [
    re_path(
        r'^(?!api/|admin/|static/|media/|favicon\.ico|serviceWorker\.js|manifest\.json|logo\d+\.png).*$',
        react_app_view,
        name='react_app',
    ),
]

# Admin site customization
admin.site.site_header = "Kalinga Temple Trust Portal"
admin.site.site_title = "Trust Admin"
admin.site.index_title = "Welcome to Trust Management Portal"

