from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Parent, Therapist, Child, Activity, AssignedActivity
from .serializers import ParentSerializer, TherapistSerializer, ChildSerializer, ActivitySerializer, AssignedActivitySerializer
from rest_framework.exceptions import MethodNotAllowed


class ParentViewSet(viewsets.ModelViewSet):
	queryset = Parent.objects.all()
	serializer_class = ParentSerializer

	def destroy(self, request, *args, **kwargs):
		raise MethodNotAllowed('DELETE')

class TherapistViewSet(viewsets.ModelViewSet):
	queryset = Therapist.objects.all()
	serializer_class = TherapistSerializer

class ChildViewSet(viewsets.ModelViewSet):
	queryset = Child.objects.all()
	serializer_class = ChildSerializer


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

	user_type = request.data.get('user_type')
	firebase_auth_uid = request.data.get('firebase_auth_uid')
	email = request.data.get('email')
	# name = request.data.get('name')
	# profile_picture = request.data.get('profile_picture', None)
	# pin_hash = request.data.get('pin_hash')

	if not all([user_type, firebase_auth_uid, email]):
		return Response({'error': 'Missing required fields'}, status=400)

	if user_type not in ['parent', 'therapist']:
		return Response({'error': 'Invalid user type'}, status=400)

	# if user_type == 'parent' and not pin_hash:
	# 	return Response({'error': 'Pin hash is required for parent registration'}, status=400)

	model = Parent if user_type == 'parent' else Therapist

	if model.objects.filter(firebase_auth_uid=firebase_auth_uid).exists():
		return Response({'error': 'User already exists'}, status=400)

	user = model.objects.create(
		firebase_auth_uid=firebase_auth_uid,
		email=email
	)

	# Must serialize model before returning it
	serializer = ParentSerializer(user) if user_type == 'parent' else TherapistSerializer(user)
	return Response(serializer.data, status=201)


