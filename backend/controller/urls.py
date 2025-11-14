from django.urls import path
from .views.userViews import *
from .views.profileViews import *
from .views.contentViews import *
from .views.assignmentViews import *
from .views.resultViews import *
from .views.azureAIViews import *

urlpatterns = [
    # User Routes
    path('user/create/', register_user, name='register_user'), # POST
    path('user/subscribe/', subscribe_user, name='subscribe_user'), # POST

    # Profile Routes
    path('profile/create/', create_profile, name='create_profile'), # POST
    path('profile/<str:user_id>/list/', get_user_profiles, name='get_user_profiles'), # GET
    path('profile/<str:profile_id>/data/', get_profile, name='get_profile'), # GET
    path('profile/<str:profile_id>/coins/', coins, name='manage_coins'), # GET
    path('profile/<str:profile_id>/streak/', get_streak, name='get_streak'), # GET
    path('profile/shop/', shop, name='shop'), # GET
    path('profile/<str:profile_id>/inv', get_inv, name='get_inventory'), # GET
    path('profile/<str:profile_id>/inv/<str:item_id>/', update_inv, name='update_inventory'), # POST
    path('profile/<str:profile_id>/mascot/', mascot, name='manage_mascot'), # GET, PUT

    # Content Library Routes
    path('content/learning_units/', get_all_learning_units, name='get_all_learning_units'), # GET
    path('content/<str:learning_unit_id>/exercises/', get_exercises_for_learning_unit, name='get_exercises_for_learning_unit'), # GET
    path('content/<str:exercise_id>/questions/', get_questions_for_exercise, name='get_questions_for_exercise'), # GET

    # Assignment Routes
    path('assignment/create/', create_assignment, name='create_assignment'), # POST
    path('assignment/complete/', complete_assignment, name='complete_assignment'), # POST
    path('assignment/<str:user_id>/assigned_by/', assigned_by_assignments, name='get_assigned_by_assignments'), # GET
    path('assignment/<str:child_id>/assigned_to/', assigned_to_assignments, name='get_assigned_to_assignments'), # GET
    path('assignment/<str:child_id>/unassign/<str:learning_unit_id>/', unassign_assignment, name='unassign_assignment'), # DELETE

    # Child Results Routes
    path('result/<str:child_id>/all/', get_exercise_results, name='get_exercise_results'), # GET
    path('result/<str:child_id>/learning_unit_overall/<str:participation_type>', results_for_learning_unit_overall, name='results_for_learning_unit_overall'), # GET
    path('result/<str:child_id>/exercise/<str:exercise_id>/', results_for_exercise, name='results_for_exercise'), # POST, GET
    path('result/<str:child_id>/question/<str:question_id>/', results_for_question, name='results_for_question'), # POST, GET

    # Azure AI Routes
    path("AI/assess_speech/", assess_speech, name="assess_speech"), # POST
    path('AI/text_to_speech/', text_to_speech), # POST

    # Dashboard Routes
]
