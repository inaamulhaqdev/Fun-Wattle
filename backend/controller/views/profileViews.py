from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *
from datetime import datetime
from .chatViews import create_chats

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

	# Check if user already has a parent/therapist profile to prevent duplicates
	if not creating_child_profile:
		existing_profile = User_Profile.objects.filter(
			user=user, 
			profile__profile_type=profile_type
		).first()
		if existing_profile:
			return Response({'error': 'Profile already exists for this user'}, status=400)

	# Create the profile
	profile = Profile.objects.create(
		profile_type=profile_type,
		name=name,
		profile_picture=profile_picture,
		pin_hash=pin_hash,
		child_details=child_details,
		coins=0,
		streak=0
	)

	if not profile:
		return Response({'error':'Failed to create profile'}, status=500)

	# Link profile to user
	user_profile = User_Profile.objects.create(user=user, profile=profile)

	if not user_profile:
		return Response({'error':'Failed to link profile to user'}, status=500)

	# If we are creating a child profile, check if another user is connected to that child
 	# If so, create a chat room between them
	if creating_child_profile:
		existing_user_profiles = User_Profile.objects.filter(profile__child_details=child_details).exclude(user=user)
		for existing_user_profile in existing_user_profile:
			# Get the other user's parent/therapist profile
			other_profile = existing_user_profile.profile
			
			# Get current user's parent/therapist profile
			current_user_profile = User_Profile.objects.filter(user=user, profile__profile_type__in=['parent', 'therapist']).first()
			if not current_user_profile:
				continue
				
			# Create chat room
			new_room = Chat_Room.objects.create(
				messenger_1=current_user_profile.profile,
				messenger_2=other_profile,
				child=profile,
				room_name=f"{profile.name}'s care team"
			)

			if not new_room:
				return Response({'error':'Failed to create chat room for linked profiles'}, status=500)

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
def get_profile_by_email(request, email):
	"""Get therapist or parent profile by email"""
	try:
		user = User.objects.get(email=email)
	except User.DoesNotExist:
		return Response({'error': 'User not found with this email'}, status=404)

	# Get the parent or therapist profile for this user
	user_profile = User_Profile.objects.filter(
		user=user,
		profile__profile_type__in=['parent', 'therapist']
	).first()
	
	if not user_profile:
		return Response({'error': 'No parent or therapist profile found for this user'}, status=404)

	serializer = ProfileSerializer(user_profile.profile)
	return Response(serializer.data, status=200)


def calc_streak(profile):
	completed_units = Exercise_Result.objects.filter(
		assignment__assigned_to=profile,
		completed_at__isnull=False
	).order_by('-completed_at')
	if not completed_units.exists():
		profile.streak = 0
		profile.save()
		return
	now = datetime.now()
	streak = 0
	for result in completed_units:
		completion_date = result.completed_at
		delta_days = (now.date() - completion_date.date()).days
		if delta_days == streak + 1:
			streak += 1
		else:
			break
	profile.streak = streak
	profile.save()


@api_view(['GET'])
def get_profile(request, profile_id):
    try:
        profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

    if profile.profile_type == "child":
    	calc_streak(profile)
    # else:
    # 	create_chats(profile)

    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=200)

@api_view(['GET', 'POST'])
def therapist(request):
	if request.method == 'GET':
		therapist = Profile.objects.filter(profile_type='therapist')
		serializer = ProfileSerializer(therapist, many=True)
		return Response(serializer.data, status=200)
	elif request.method == 'POST':
		child_profile = request.data.get('child')
		therapist_profile = request.data.get('therapist')
		# Therapist User ID
		try:
			profile = Profile.objects.get(id=child_profile)
			therapist = Profile.objects.get(id=therapist_profile)
		except (Profile.DoesNotExist):
			return Response({'error': 'Either not found'}, status=404)
		try:
			# Get the therapist user by finding the User_Profile entry where:
			# - profile is the therapist profile
			# - user has user_type='therapist'
			user_profile = User_Profile.objects.select_related('user').get(
				profile=therapist,
				user__user_type='therapist'
			)
			therapist_user = user_profile.user
		except (User_Profile.DoesNotExist):
			return Response({'error': 'Therapist user not found'}, status=404)
		try:
			User_Profile.objects.get(user=therapist_user, profile=profile)
		except (User_Profile.DoesNotExist):
			User_Profile.objects.create(user=therapist_user, profile=profile)
			return Response({'message':'Therapist set successfully'}, status=200)
		return Response({'error':'Profile connection exists'}, status=400)
