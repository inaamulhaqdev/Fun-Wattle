from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

""" Sample URL directiosn
router = DefaultRouter()
router.register(r'user', UserViewSet)

urlpatterns = [
    path('', include(router.urls))
] """