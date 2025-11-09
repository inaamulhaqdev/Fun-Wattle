from ..models import *
from ..serializers import *
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def get_all_learning_units(request):
	learning_units = Learning_Unit.objects.all()
	serializer = LearningUnitSerializer(learning_units, many=True)
	return Response(serializer.data, status=200)


@api_view(['GET'])
def get_exercises_for_learning_unit(request, learning_unit_id):
	try:
		learning_unit = Learning_Unit.objects.get(id=learning_unit_id)
	except Learning_Unit.DoesNotExist:
		return Response({'error': 'Learning unit not found'}, status=404)

	exercises = Exercise.objects.filter(learning_unit=learning_unit)
	serializer = ExerciseSerializer(exercises, many=True)
	return Response(serializer.data, status=200)


@api_view(['GET'])
def get_questions_for_exercise(request, exercise_id):
    try:
        exercise = Exercise.objects.get(id=exercise_id)
    except Exercise.DoesNotExist:
        return Response({'error': 'Exercise not found'}, status=404)

    questions = Question.objects.filter(exercise=exercise)
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data, status=200)


