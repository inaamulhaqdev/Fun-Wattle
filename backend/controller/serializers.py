from rest_framework import serializers
from .models import Learning_Unit, Task, User, Profile, User_Profile #, Activity, AssignedActivity

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class User_ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_Profile
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class LearningUnitSerializer(serializers.ModelSerializer):
    exercises = TaskSerializer(source='tasks', many=True, read_only=True)

    class Meta:
        model = Learning_Unit
        fields = '__all__'
