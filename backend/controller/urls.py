from django.urls import path
from .views import get_profiles, register_user, create_profile, subscribe_user

urlpatterns = [
    path('create/', register_user, name='register_user'),
    path('profile/', create_profile, name='create_profile'),
    path('subscribe/', subscribe_user, name='subscribe_user'),
    path('profile/<str:firebase_auth_id>/', get_profiles, name='get_profiles'),
    # path('modules/<int:child_id>/', get_child_assigned_activities, name='get_child_activities'),
    # path('modules/', get_activities, name='get_activities'),
    # path('modules/<int:id>/', assign_activity_to_child, name='assign_activity_to_child'),
]