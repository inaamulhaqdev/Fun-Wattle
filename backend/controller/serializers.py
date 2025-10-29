from rest_framework import serializers
from .models import Learning_Unit, Task, User, Profile, User_Profile, Assignment #, Activity, AssignedActivity

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

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class LearningUnitSerializer(serializers.ModelSerializer):
    exercises = TaskSerializer(source='tasks', many=True, read_only=True)
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        child_id = self.context.get('child_id')
        try:
            assignment = Assignment.objects.get(
                learning_unit=obj,
                assigned_to_id=child_id
            )

            if assignment.completed_at:
                return 'Completed'

            return 'Assigned'
        except Assignment.DoesNotExist:
            return 'Unassigned'

    class Meta:
        model = Learning_Unit
        fields = '__all__'
