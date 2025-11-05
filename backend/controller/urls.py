from django.urls import path

from .views.userViews import *
from .views.learningViews import *
from .views.parentDashboardViews import *
from .views.childDashboardViews import *

urlpatterns = [
    # User Routes
    path('create/', register_user, name='register_user'), # POST
    path('subscribe/', subscribe_user, name='subscribe_user'), # POST
    path('profile/', create_profile, name='create_profile'), # POST
    path('profile/<str:profile_id>/', get_profile, name='get_profile'), # GET
    path('profiles/<str:user_id>/', get_user_profiles, name='get_user_profiles'), # GET
    path('profiles/<str:profile_id>/coins/', coins, name='manage_coins'), # TODO
    path('profiles/<str:profile_id>/streak/', get_streak, name='get_streak'), # TODO
    path('profiles/<str:profile_id>/mascot/', mascot, name='manage_mascot'), # TODO
    path('profiles/<str:profile_id>/mascot/items/', mascot_items, name='manage_mascot_items'), # TODO

    # Learning Activity Routes
    path('learning_units/', get_all_learning_units, name='get_all_learning_units'), # GET
    path('exercises/<str:learning_unit_id>/', get_exercises_for_learning_unit, name='get_exercises_for_learning_unit'), # GET
    path('questions/<str:exercise_id>/', get_questions_for_exercise, name='get_questions_for_exercise'), # GET
    path('activities/<str:user_id>/', get_assigned, name='get_assigned_activities'), # GET
    path('assignments/<str:child_id>', manage_assignment, name='manage_assignment'), # GET, POST
    path('assignments/<str:child_id>/learning_unit/<str:learning_unit_id>/', unassign_learning_unit, name='unassign_learning_unit'), # DELETE
    path('results/<str:child_id>/', get_exercise_results, name='get_exercise_results'), # GET
    path('results/<str:child_id>/exercise/<str:exercise_id>/', results_for_exercise, name='results_for_exercise'), # POST, GET
    path("assess/", assess_speech, name="assess_speech"), # POST
    path('text-to-speech/', text_to_speech), # POST

    # Parent Dashboard Routes
    # path('dashboard/parent/<str:child_id>/', get_child_dashboard, name='get_child_dashboard'),
]
