from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from .serializers import *

class LoginRequestViewSet(viewsets.ModelViewSet):
    queryset = LoginRequest.objects.all()
    serializer_class = LoginRequestSerialiser
    #POST Method
    

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerialiser

    # @action(detail=True, methods=['get'])
    # def userInfo(self, request, pk=None):
    #     user = self.get_object()
    #     serializer = UserSerialiser(user, many=True)
    #     return Response(serializer.data)
