from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Profile, User_Profile #, Activity, AssignedActivity
from .serializers import UserSerializer, ProfileSerializer, User_ProfileSerializer #, ActivitySerializer, AssignedActivitySerializer
from rest_framework.exceptions import MethodNotAllowed

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
	profile_creator = User.objects.get(id=request.data.get('id'))
	if not profile_creator:
		return Response({'error': 'User not found'}, status=404)

	profile_type = profile_creator.user_type
	name = request.data.get('name')
	profile_picture = request.data.get('profile_picture')
	pin_hash = request.data.get('pin_hash')

	if not name or not profile_type:
		return Response({'error': 'Missing required fields: name, profile_type'}, status=400)

	if profile_type not in ['parent', 'therapist', 'child']:
		return Response({'error': 'Invalid profile_type'}, status=400)

	if profile_type in ['parent', 'therapist']:

		if profile_creator.user_type != profile_type:
			return Response({'error': 'User type does not match requested profile_type'}, status=403)

		if profile_type == 'parent' and not pin_hash:
			return Response({'error': 'pin_hash is required for parent profile'}, status=400)

		if Profile.objects.filter(user=profile_creator).exists():
			return Response({'error': 'Profile already exists for this user'}, status=400)

	# Create the profile
	profile = Profile.objects.create(
		profile_type=profile_type,
		name=name,
		profile_picture=profile_picture,
		pin_hash=pin_hash,
	)

 	# ONLY if child profile, link it to the profile creator via User_Profile
	if profile_type == 'child':
		User_Profile.objects.create(user=profile_creator, child=profile)

	serializer = ProfileSerializer(profile)
	return Response(serializer.data, status=201)


@api_view(['GET'])
def get_profiles(request, id):
	user = User.objects.get(id=id)

	main_profile = Profile.objects.filter(user=user)
	child_profiles = Profile.objects.filter(linked_users__user=user) # Find all child profiles linked to this user
	profiles = main_profile | child_profiles

	serializer = ProfileSerializer(profiles, many=True)
	return Response(serializer.data, status=200)

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
