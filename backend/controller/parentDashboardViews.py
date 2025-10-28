from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Learning_Unit, User, Profile, User_Profile, Assignment
from .serializers import UserSerializer, ProfileSerializer, User_ProfileSerializer, LearningUnitSerializer, AssignmentSerializer
from rest_framework.exceptions import MethodNotAllowed

@api_view(['GET'])
def get_child_dashboard(request, child_id):
    return Response({'Message': 'This post profile/id/parent route is unimplemented'}, status=501)