from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *


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