from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Learning_Unit, User, Profile, User_Profile, Assignment
from .serializers import UserSerializer, ProfileSerializer, User_ProfileSerializer, LearningUnitSerializer, AssignmentSerializer
from rest_framework.exceptions import MethodNotAllowed



# CURRENTLY EACH QUESTION TYPE HAS ITS OWN ENDPOINT

# Can either go from a direct URL or from a "parent" method

@api_view(['GET', 'POST'])
def exercise_data(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/exercise route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/exercise route is unimplemented'}, status=501)

@api_view(['GET', 'POST'])
def exercise_data_mc(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/exercise/mc route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/exercise/mc route is unimplemented'}, status=501)
    

@api_view(['GET', 'POST'])
def exercise_data_scene(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/exercise/scene route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/exercise/scene route is unimplemented'}, status=501)
    
@api_view(['GET', 'POST'])
def exercise_data_mc_image(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/exercise/mc_image route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/exercise/mc_image route is unimplemented'}, status=501)
    
@api_view(['GET', 'POST'])
def exercise_data_sentence(request, profile_id):
    if request.method == 'GET':
        return Response({'Message': 'This get profile/id/exercise/sentence route is unimplemented'}, status=501)
    elif request.method == 'POST':
        return Response({'Message': 'This post profile/id/exercise/sentence route is unimplemented'}, status=501)