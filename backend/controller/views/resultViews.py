from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *
from time import timezone


@api_view(['GET'])
def get_exercise_results(request, child_id):
    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)

    results = Exercise_Result.objects.filter(profile=child_profile)
    serializer = ExerciseResultSerializer(results, many=True)
    return Response(serializer.data, status=200)


@api_view(['GET', 'POST'])
def results_for_exercise(request, child_id, exercise_id):
    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)

    exercise = Exercise.objects.filter(id=exercise_id).first()
    if not exercise:
        return Response({'error': 'Exercise not found'}, status=404)

    if request.method == 'GET':
        results = Exercise_Result.objects.filter(
            assignment__assigned_to=child_profile,
            exercise=exercise
        )
        serializer = ExerciseResultSerializer(results, many=True)
        return Response(serializer.data, status=200)

    elif request.method == 'POST': # This post call is used to complete exercise
        assignment = Assignment.objects.filter(
            assigned_to=child_profile,
            learning_unit=exercise.learning_unit
        ).first()
        if not assignment:
            return Response({'error': 'Assignment not found for this exercise and child'}, status=404)

        result = Exercise_Result.objects.update(
            assignment=assignment,
            exercise=exercise,
            defaults={
                'completed_at': timezone.now()
            }
        )
        serializer = ExerciseResultSerializer(result)
        return Response(serializer.data, status=201)


@api_view(['GET', 'POST'])
def results_for_question(request, child_id, question_id):
    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)

    question = Question.objects.filter(id=question_id).first()
    if not question:
        return Response({'error': 'Question not found'}, status=404)

    if request.method == 'GET':
        results = Question_Result.objects.filter(
            exercise_result__assignment__assigned_to=child_profile,
            question=question
        )
        serializer = QuestionResultSerializer(results, many=True)
        return Response(serializer.data, status=200)

    elif request.method == 'POST':
        num_incorrect = request.data.get('num_incorrect')
        num_correct = request.data.get('num_correct')

        if num_incorrect is None or num_correct is None:
            return Response({'error': 'num_incorrect and num_correct are required'}, status=400)

        exercise = question.exercise
        assignment = Assignment.objects.filter(
            assigned_to=child_profile,
            learning_unit=exercise.learning_unit
        ).first()
        if not assignment:
            return Response({'error': 'Assignment not found for this question and child'}, status=404)

        # Get or create Exercise_Result
        exercise_result, _ = Exercise_Result.objects.get_or_create(
            assignment=assignment,
            exercise=exercise
        )

        # Update or create Question_Result
        result, created = Question_Result.objects.update_or_create(
            exercise_result=exercise_result,
            question=question,
            defaults={
                'num_incorrect': num_incorrect,
                'num_correct': num_correct,
                'completed_at': timezone.now()
            }
        )

        # Update Exercise_Result aggregates (time spent, num_correct, num_incorrect)
        exercise_result.num_incorrect += num_incorrect
        exercise_result.num_correct += num_correct
        if exercise_result.num_correct + exercise_result.num_incorrect > 0:
            exercise_result.accuracy = (exercise_result.num_correct / (exercise_result.num_correct + exercise_result.num_incorrect) * 100)
        else:
            exercise_result.accuracy = num_correct / (num_correct + num_incorrect) * 100
        exercise_result.save()

        serializer = QuestionResultSerializer(result)
        return Response(serializer.data, status=201 if created else 200)
