from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *
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