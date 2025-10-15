from rest_framework import serializers
from .models import User, Profile, User_ChildProfile, Activity, AssignedActivity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class User_ChildProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_ChildProfile
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
	class Meta:
		model = Activity
		fields = '__all__'

class AssignedActivitySerializer(serializers.ModelSerializer):
	class Meta:
		model = AssignedActivity
		fields = '__all__'

