from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *

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


@api_view(['GET', 'POST'])
def coins(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/coins route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/coins route is unimplemented'}, status=501)


@api_view(['GET'])
def get_streak(request, profile_id):
    return Response({'Message': 'This profile/id/streak route is unimplemented'}, status=501)


@api_view(['GET', 'POST'])
def mascot(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/mascot route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/mascot route is unimplemented'}, status=501)