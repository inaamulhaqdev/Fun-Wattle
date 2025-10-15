from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Profile, User_ChildProfile, Activity, AssignedActivity
from .serializers import UserSerializer, ProfileSerializer, User_ChildProfileSerializer, ActivitySerializer, AssignedActivitySerializer
from firebase_admin import auth
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

class User_ChildProfileViewSet(viewsets.ModelViewSet):
	queryset = User_ChildProfile.objects.all()
	serializer_class = User_ChildProfileSerializer

	def destroy(self, request, *args, **kwargs):
		raise MethodNotAllowed('DELETE')

class ActivityViewSet(viewsets.ModelViewSet):
	queryset = Activity.objects.all()
	serializer_class = ActivitySerializer

class AssignedActivityViewSet(viewsets.ModelViewSet):
	queryset = AssignedActivity.objects.all()
	serializer_class = AssignedActivitySerializer


@api_view(['POST'])
def register_user(request):
	"""
	Register a new user (Parent or Therapist).
	Expects JSON with 'user_type', 'firebase_auth_uid', and 'email'.
	"""

	firebase_auth_uid = request.data.get('firebase_auth_uid')
	user_type = request.data.get('user_type')
	email = request.data.get('email')

	if not all([user_type, firebase_auth_uid, email]):
		return Response({'error': 'Missing required fields'}, status=400)

	if user_type not in ['parent', 'therapist']:
		return Response({'error': 'Invalid user type'}, status=400)

	if User.objects.filter(firebase_auth_uid=firebase_auth_uid).exists():
		return Response({'error': 'User already exists'}, status=400)

	user = User.objects.create(
		firebase_auth_uid=firebase_auth_uid,
		user_type=user_type,
		email=email
	)

	# Must serialize model before returning it (return the created User)
	serializer = UserSerializer(user)
	return Response(serializer.data, status=201)


@api_view(['POST'])
def create_profile(request):

	# Get firebase ID token from Authorization header to identify the profile creator (the signed in user)
	# auth_header = request.headers.get('Authorization')
	# if not auth_header or not auth_header.startswith('Bearer '):
	# 	return Response({'error': 'Missing or invalid Authorization header'}, status=401)

	# id_token = auth_header.split('Bearer ')[1]

	# try:
	# 	decoded_token = auth.verify_id_token(id_token)
	# 	uid = decoded_token['uid']
	# except Exception:
	# 	return Response({'error': 'Invalid Firebase token'}, status=401)

	# Now find the user linked to that firebase UID
	# try:
	# 	profile_creator = User.objects.get(firebase_auth_uid=uid)
	# except User.DoesNotExist:
	# 	return Response({'error': 'Profile creator not found'}, status=404)

	# Now we extract the profile creation data and continue with API logic
	profile_creator = User.objects.get(firebase_auth_uid=request.data.get('user_id'))
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

		profile = Profile.objects.create(
			user=profile_creator,
			profile_type=profile_type,
			name=name,
			profile_picture=profile_picture,
			pin_hash=pin_hash,
		)

		serializer = ProfileSerializer(profile)
		return Response(serializer.data, status=201)

	# Create a child profile and link it to the profile creator via User_ChildProfile
	if profile_type == 'child':
		child_profile = Profile.objects.create(
			user=None,
			profile_type='child',
			name=name,
			profile_picture=profile_picture,
			pin_hash=None,
		)

		User_ChildProfile.objects.create(user=profile_creator, child=child_profile)

		serializer = ProfileSerializer(child_profile)
		return Response(serializer.data, status=201)


@api_view(['GET'])
def get_profiles(request, firebase_auth_id):

	# auth_header = request.headers.get('Authorization')
	# if not auth_header or not auth_header.startswith('Bearer '):
	# 	return Response({'error': 'Missing or invalid Authorization header'}, status=401)

	# id_token = auth_header.split('Bearer ')[1]

	# try:
	# 	decoded_token = auth.verify_id_token(id_token)
	# 	uid = decoded_token['uid']
	# except Exception:
	# 	return Response({'error': 'Invalid Firebase token'}, status=401)

	# try:
	# 	profile_owner = User.objects.get(firebase_auth_uid=uid)
	# except User.DoesNotExist:
	# 	return Response({'error': 'Profile owners not found'}, status=404)

	user = User.objects.get(firebase_auth_uid=firebase_auth_id)

	main_profile = Profile.objects.filter(user=user)
	child_profiles = Profile.objects.filter(linked_users__user=user) # Find all child profiles linked to this user
	profiles = main_profile | child_profiles

	serializer = ProfileSerializer(profiles, many=True)
	return Response(serializer.data, status=200)



