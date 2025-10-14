from rest_framework import serializers
from .models import Parent, Therapist, Child, Activity, AssignedActivity

class ParentSerializer(serializers.ModelSerializer):
	class Meta:
		model = Parent
		fields = '__all__'

class TherapistSerializer(serializers.ModelSerializer):
	class Meta:
		model = Therapist
		fields = '__all__'

class ChildSerializer(serializers.ModelSerializer):
	parent = ParentSerializer(many=True, read_only=True)
	therapist = TherapistSerializer(many=True, read_only=True)

	class Meta:
		model = Child
		fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
	class Meta:
		model = Activity
		fields = '__all__'

class AssignedActivitySerializer(serializers.ModelSerializer):
	activity = ActivitySerializer(read_only=True)
	child = ChildSerializer(read_only=True)
	assigned_by = TherapistSerializer(read_only=True)

	class Meta:
		model = AssignedActivity
		fields = '__all__'

