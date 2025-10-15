from django.urls import path
from .views import get_profiles, register_user, create_profile

urlpatterns = [
    path('create/', register_user, name='register_user'),
    path('profile/', create_profile, name='create_profile'),
    path('profile/<str:firebase_auth_id>/', get_profiles, name='get_profiles'),
    path('modules/<int:child_id>/', get_child_assigned_activities, name='get_child_activities'),
]