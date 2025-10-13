from rest_framework import serializers
from .models import *

class LoginRequestSerialiser(serializers.ModelSerializer):
    class Meta:
        model = LoginRequest
        fields = ['email', 'password']

class UserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'name', 'id', 'accountType']
