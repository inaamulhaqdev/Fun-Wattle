from django.urls import path

from .questionViews import *
from .parentDashboardViews import *
from .childDashboardViews import *
from .views import get_all_learning_units, get_user_profiles, get_profile, register_user, create_profile, subscribe_user, manage_assignment

urlpatterns = [
    path('create/', register_user, name='register_user'),
    path('profile/', create_profile, name='create_profile'),
    path('subscribe/', subscribe_user, name='subscribe_user'),
    path('profiles/<str:user_id>/', get_user_profiles, name='get_user_profiles'),
    path('profile/<str:profile_id>/', get_profile, name='get_profile'),
    path('learning_units/', get_all_learning_units, name='get_all_learning_units'),
    path('assignments/', manage_assignment, name='manage_assignment'),
    path('profiles/<str:user_id>/activites/', get_assigned, name='get_assigned_activities'),
    path('profiles/<str:profile_id>/coins/', coins, name='manage_coins'),
    path('profiles/<str:profile_id>/streak/', get_streak, name='get_streak'),
    path('profiles/<str:profile_id>/mascot/', mascot, name='manage_mascot'),
    path('profiles/<str:profile_id>/mascot/items/', mascot_items, name='manage_mascot_items'),
    path('profiles/<str:profile_id>/exercise/', exercise_data, name='exercise_data'),
    path('profiles/<str:profile_id>/exercise/mc/', exercise_data_mc, name='exercise_data_mc'),
    path('profiles/<str:profile_id>/exercise/scene/', exercise_data_scene, name='exercise_data_scene'),
    path('profiles/<str:profile_id>/exercise/mc_image/', exercise_data_mc_image, name='exercise_data_mc_image'),
    path('profiles/<str:profile_id>/exercise/sentence/', exercise_data_sentence, name='exercise_data_sentence'),
    path('dashboard/parent/<str:child_id>/', get_child_dashboard, name='get_child_dashboard'),
    # path('modules/<int:child_id>/', get_child_assigned_activities, name='get_child_activities'),
    # path('modules/', get_activities, name='get_activities'),
    # path('modules/<int:id>/', assign_activity_to_child, name='assign_activity_to_child'),
]