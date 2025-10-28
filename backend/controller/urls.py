from django.urls import path
from .views import get_all_learning_units, get_user_profiles, get_profile, register_user, create_profile, subscribe_user, manage_assignment

urlpatterns = [
    path('create/', register_user, name='register_user'),
    path('profile/', create_profile, name='create_profile'),
    path('subscribe/', subscribe_user, name='subscribe_user'),
    path('profiles/<str:user_id>/', get_user_profiles, name='get_user_profiles'),
    path('profile/<str:profile_id>/', get_profile, name='get_profile'),
    path('learning_units/', get_all_learning_units, name='get_all_learning_units'),
    path('assignments/', manage_assignment, name='manage_assignment'),
    path("assess/", assess_speech, name="assess_speech"),
    # path('modules/<int:child_id>/', get_child_assigned_activities, name='get_child_activities'),
    # path('modules/', get_activities, name='get_activities'),
    # path('modules/<int:id>/', assign_activity_to_child, name='assign_activity_to_child'),
]