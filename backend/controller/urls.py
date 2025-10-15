from django.urls import path
from .views import register_user, create_profile

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('create_profile/', create_profile, name='create_profile'),
]