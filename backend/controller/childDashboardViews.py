from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Learning_Unit, User, Profile, User_Profile, Assignment
from .serializers import UserSerializer, ProfileSerializer, User_ProfileSerializer, LearningUnitSerializer, AssignmentSerializer
from rest_framework.exceptions import MethodNotAllowed

@api_view(['GET'])
def get_assigned(request, profile_id):
    return Response({'Message': 'This profile/id/activities route is unimplemented'}, status=501)
#       """
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

@api_view(['GET', 'POST'])
def mascot_items(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/mascot/items route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/mascot/items route is unimplemented'}, status=501)