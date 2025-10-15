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

	if not all([user_type, firebase_auth_uid, email]):
		return Response({'error': 'Missing required fields'}, status=400)

	if user_type not in ['parent', 'therapist']:
		return Response({'error': 'Invalid user type'}, status=400)

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


@api_view(['POST'])
def create_profile(request):
    user_type = request.data.get('user_type')

    if user_type in ['parent', 'therapist']:
        firebase_auth_uid = request.data.get('firebase_auth_uid')
        name = request.data.get('name')
        profile_picture = request.data.get('profile_picture')
        pin_hash = request.data.get('pin_hash')
        model = Parent if user_type == 'parent' else Therapist

        try:
            user = model.objects.get(firebase_auth_uid=firebase_auth_uid)
        except model.DoesNotExist:
            return Response({'error': 'User not found, cannot create parent / therapist profile without user login'}, status=404)

        # Update fields they provided
        if name:
            user.name = name
        if profile_picture:
            user.profile_picture = profile_picture
        if pin_hash:
            user.pin_hash = pin_hash
        user.save()

        serializer = ParentSerializer(user) if user_type == 'parent' else TherapistSerializer(user)
        return Response(serializer.data, status=200)

    elif user_type == 'child':
        name = request.data.get('name')
        parent_ids = request.data.get('parent_ids', [])
        therapist_ids = request.data.get('therapist_ids', [])

        # Im assuming only at least 1 parent can create a child profile, so therapist_ids are optional
        if not name or not parent_ids:
            return Response({'error': 'Missing required fields for child, name and at least 1 parent_id are required'}, status=400)

        child = Child.objects.create(name=name)

		# This handles association tables in db (controller_child_parent and controller_child_therapist)
        if parent_ids:
            child.parent.set(parent_ids)
        if therapist_ids:
            child.therapist.set(therapist_ids)

        serializer = ChildSerializer(child)
        return Response(serializer.data, status=201)

    else:
        return Response({'error': 'Invalid user type'}, status=400)


