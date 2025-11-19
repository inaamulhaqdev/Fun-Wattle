from rest_framework import serializers
from .models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class User_ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User_Profile
        fields = '__all__'

class LearningUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learning_Unit
        fields = '__all__'

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    learning_unit = LearningUnitSerializer(read_only=True)
    assigned_to = ProfileSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = '__all__'

class ExerciseResultSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = Exercise_Result
        fields = '__all__'

class QuestionResultSerializer(serializers.ModelSerializer):
    exercise_result = ExerciseResultSerializer(read_only=True)
    question = QuestionSerializer(read_only=True)

    class Meta:
        model = Question_Result
        fields = '__all__'

class MascotItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascot_Items
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    # Im doing this since supabase realtime subscriptions give actual fields (exact field names)
    # Django normally gives ForeignKey objects, but we need the ID directly for consistency in the frontend
    sender_id = serializers.UUIDField(source='sender.id', read_only=True)

    class Meta:
        model = Chat_Message
        fields = ['id', 'chat_room_id', 'sender_id', 'message_content', 'timestamp']