from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Learning_Unit, User, Profile, User_Profile, Assignment
from .serializers import UserSerializer, ProfileSerializer, User_ProfileSerializer, LearningUnitSerializer, AssignmentSerializer
from rest_framework.exceptions import MethodNotAllowed
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import tempfile
import json
from pydub import AudioSegment
from rest_framework.decorators import api_view
from rest_framework.response import Response
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI

class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer

	def destroy(self, request, *args, **kwargs):
		raise MethodNotAllowed('DELETE')

class ProfileViewSet(viewsets.ModelViewSet):
	queryset = Profile.objects.all()
	serializer_class = ProfileSerializer

	def destroy(self, request, *args, **kwargs):
		raise MethodNotAllowed('DELETE')

class User_ProfileViewSet(viewsets.ModelViewSet):
	queryset = User_Profile.objects.all()
	serializer_class = User_ProfileSerializer

	def destroy(self, request, *args, **kwargs):
		raise MethodNotAllowed('DELETE')

# class ActivityViewSet(viewsets.ModelViewSet):
# 	queryset = Activity.objects.all()
# 	serializer_class = ActivitySerializer

# class AssignedActivityViewSet(viewsets.ModelViewSet):
# 	queryset = AssignedActivity.objects.all()
# 	serializer_class = AssignedActivitySerializer


@api_view(['POST'])
def register_user(request):
	"""
	Register a new user (Parent or Therapist).
	Expects JSON with 'user_type', 'id', and 'email'.
	"""

	id = request.data.get('id')
	user_type = request.data.get('user_type')
	email = request.data.get('email')

	if not all([user_type, id, email]):
		return Response({'error': 'Missing required fields'}, status=400)

	if user_type not in ['parent', 'therapist']:
		return Response({'error': 'Invalid user type'}, status=400)

	if User.objects.filter(id=id).exists():
		return Response({'error': 'User already exists'}, status=400)

	user = User.objects.create(
		id=id,
		user_type=user_type,
		email=email
	)

	# Must serialize model before returning it (return the created User)
	serializer = UserSerializer(user)
	return Response(serializer.data, status=201)


@api_view(['POST'])
def subscribe_user(request):
	id = request.data.get('id')
	subscription_type = request.data.get('subscription_type')
	subscription_end = request.data.get('subscription_end')

	if not id or not subscription_type:
		return Response({'error': 'Missing required fields: id, subscription_type'}, status=400)

	if subscription_type == 'free_trial' and not subscription_end:
		return Response({'error': 'subscription_end is required for free_trial'}, status=400)

	try:
		user = User.objects.get(id=id)
	except User.DoesNotExist:
		return Response({'error': 'User not found'}, status=404)

	user.subscription_type = subscription_type
	user.subscription_end = subscription_end

	user.save()

	serializer = UserSerializer(user)
	return Response(serializer.data, status=200)


@api_view(['POST'])
def create_profile(request):
	user_id = request.data.get('user_id')
	name = request.data.get('name')
	creating_child_profile = request.data.get('creating_child_profile')
	profile_picture = request.data.get('profile_picture')
	pin_hash = request.data.get('pin_hash')
	child_details = request.data.get('child_details', None)

	if not name or not user_id or creating_child_profile is None:
		return Response({'error': 'Missing required fields: name, user_id, creating_child_profile'}, status=400)

	user = User.objects.get(id=user_id)
	if not user:
		return Response({'error': 'User not found'}, status=404)

	if creating_child_profile:
		profile_type = 'child'
	else:
		profile_type = user.user_type

	if profile_type == 'parent' and not pin_hash:
		return Response({'error': 'pin_hash is required for parent profile'}, status=400)

	# Create the profile
	profile = Profile.objects.create(
		profile_type=profile_type,
		name=name,
		profile_picture=profile_picture,
		pin_hash=pin_hash,
		child_details=child_details
	)

	# Link profile to user
	user_profile = User_Profile.objects.create(user=user, profile=profile)

	profile_serializer = ProfileSerializer(profile)
	user_profile_serializer = User_ProfileSerializer(user_profile)

	return Response({
		'profile': profile_serializer.data,
		'user_profile': user_profile_serializer.data
	}, status=201)


@api_view(['GET'])
def get_user_profiles(request, user_id):
	try:
		user = User.objects.get(id=user_id)
	except User.DoesNotExist:
		return Response({'error': 'User not found. Please complete registration first.'}, status=404)

	profile_ids = User_Profile.objects.filter(user=user).values_list('profile', flat=True)
	profiles = Profile.objects.filter(id__in=profile_ids)

	serializer = ProfileSerializer(profiles, many=True)
	return Response(serializer.data, status=200)


@api_view(['GET'])
def get_profile(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=200)


@api_view(['GET'])
def get_all_learning_units(request):
	child_id = request.query_params.get('child_id')
	learning_units = Learning_Unit.objects.all()
	serializer = LearningUnitSerializer(
    	learning_units,
    	many=True,
    	context={'child_id': child_id}
	)
	return Response(serializer.data, status=200)


@api_view(['POST', 'DELETE'])
def manage_assignment(request):
	learning_unit_id = request.data.get('learning_unit_id')
	child_id = request.data.get('child_id')
	user_id = request.data.get('user_id')
	participation_type = request.data.get('participation_type')

	if not all([learning_unit_id, child_id, user_id]):
		return Response({'error': 'learning_unit_id, child_id, and user_id are required'}, status=400)

	# Verify all required entities exist
	try:
		learning_unit = Learning_Unit.objects.get(id=learning_unit_id)
	except Learning_Unit.DoesNotExist:
		return Response({'error': 'Learning unit not found'}, status=404)

	try:
		child_profile = Profile.objects.get(id=child_id, profile_type='child')
	except Profile.DoesNotExist:
		return Response({'error': 'Child profile not found'}, status=404)

	try:
		user = User.objects.get(id=user_id)
	except User.DoesNotExist:
		return Response({'error': 'User not found'}, status=404)

	if request.method == 'POST':
		# If post or put, we are either creating or updating assignment
		if not participation_type or participation_type not in ['required', 'recommended']:
			return Response({'error': 'participation_type must be "required" or "recommended"'}, status=400)

		assignment, created = Assignment.objects.update_or_create(
			# These two are the "lookup" fields
			learning_unit=learning_unit,
			assigned_to=child_profile,
   			# these are the "update" fields
			defaults={
				'participation_type': participation_type,
				'assigned_by': user,
			}
		)

		serializer = AssignmentSerializer(assignment)
		return Response(serializer.data, status=201 if created else 200)

	elif request.method == 'DELETE':
		# Delete assignment if we select unassigned and an assignment exists
		assignment = Assignment.objects.get(
			learning_unit=learning_unit,
			assigned_to=child_profile
		)
		if assignment:
			assignment.delete()
			return Response({'message': 'Assignment removed successfully'}, status=200)


AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "australiaeast")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")

@api_view(['POST'])
def assess_speech(request):
    audio_file = request.FILES.get('audio_file')

    if not audio_file:
        return Response({'error': 'audio_file is required'}, status=400)

    temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".m4a")
    for chunk in audio_file.chunks():
        temp_input.write(chunk)
    temp_input.close()

    temp_output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
    try:
        sound = AudioSegment.from_file(temp_input.name)
        sound.export(temp_output_path, format="wav")

        # Azure Speech config
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        audio_input = speechsdk.AudioConfig(filename=temp_output_path)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_input)

        result = recognizer.recognize_once()
        if result.reason != speechsdk.ResultReason.RecognizedSpeech:
            return Response({'error': 'Speech recognition failed'}, status=400)

		###
		### response = client.embeddings.create(
		###	input = result.text,
		###	model= "text-embedding-3-small"
		### )
		### 
		# Pronunciation assessment
        pron_config = speechsdk.PronunciationAssessmentConfig(
            reference_text=result.text,
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
            enable_miscue=True
        )
        pron_config.apply_to(recognizer)

        pron_result = speechsdk.PronunciationAssessmentResult(result)
        pron_data = {
            "recognized_text": result.text,
            "accuracy_score": pron_result.accuracy_score,
            "fluency_score": pron_result.fluency_score,
            "completeness_score": pron_result.completeness_score,
            "pronunciation_score": pron_result.pronunciation_score,
        }

        # GPT Feedback
        client = AzureOpenAI(
            api_version="2024-12-01-preview",
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_KEY,
        )

        system_prompt = "You are a friendly speech therapist helping children practice pronunciation."
        user_prompt = f"""
        Child's speech: "{result.text}"
        Pronunciation Assessment Results: {json.dumps(pron_data, indent=2)}
        Give:
        1. A short encouraging summary
        2. One area to improve
        3. A fun motivational line
        """

        response_gpt = client.chat.completions.create(
            model="feedback-gpt4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=300,
            temperature=0.8,
        )

        feedback_text = response_gpt.choices[0].message.content

        return Response({
            "transcript": result.text,
            "pronunciation": pron_data,
            "feedback": feedback_text
        }, status=200)

    finally:
        os.remove(temp_input.name)
        os.remove(temp_output_path)

# @api_view(['GET'])
# def get_activities(request):
#     """
#     Get all activities
#     Endpoint: GET /modules/
#     """

#     activities = Activity.objects.all()
#     serializer = ActivitySerializer(activities, many=True)
#     return Response(serializer.data, status=200)

# @api_view(['GET'])
# def get_child_assigned_activities(request, child_id):
#     """
#     Get all assigned activities for a child profile.
#     Endpoint: GET /modules/{child_id}
#     """

#     try:
#         child_profile = Profile.objects.get(id=child_id, profile_type='child')
#     except Profile.DoesNotExist:
#         return Response({'error': 'Child profile not found'}, status=404)

#     assigned_activities = AssignedActivity.objects.filter(child_assigned_to=child_profile)
#     serializer = AssignedActivitySerializer(assigned_activities, many=True)
#     return Response(serializer.data)

# @api_view(['POST'])
# def assign_activity_to_child(request, id):
#     """
#     Assign an activity (by id) to a child profile.
#     Endpoint: POST /modules/{id}/
#     """

#     try:
#         activity = Activity.objects.get(id=id)
#     except Activity.DoesNotExist:
#         return Response({"error": "Activity not found"}, status=400)

#     child_id = request.data.get('child_id')
#     user_id = request.data.get('user_id')

#     if not child_id or not user_id:
#         return Response({"error": "child_id and user_id are required"}, status=400)

# 	# Get child and user
#     try:
#         child = Profile.objects.get(id=child_id, profile_type='child')
#         user = User.objects.get(id=user_id)
#     except Profile.DoesNotExist:
#         return Response({"error": "Child profile not found"}, status=404)
#     except User.DoesNotExist:
#         return Response({"error": "User not found"}, status=404)

# 	# Set activity, child, and user
#     assigned_activity = AssignedActivity.objects.create(
#         activity=activity,
#         child_assigned_to=child,
#         user_assigned_by=user
#     )

#     serializer = AssignedActivitySerializer(assigned_activity)
#     return Response(serializer.data, status=201)
