from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *
from django.utils import timezone
from django.db.models import Sum


@api_view(['GET'])
def results_for_learning_unit_overall(request, child_id, participation_type):
    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)

    if participation_type not in ['total', 'required', 'recommended']:
        return Response({'error': 'participation_type must be "total", "required", or "recommended"'}, status=400)

    if participation_type == 'total':
        assignments = Assignment.objects.filter(
            assigned_to=child_profile
        )
    else:
        assignments = Assignment.objects.filter(
            assigned_to=child_profile,
            participation_type=participation_type
        )

    # Total exercises
    learning_unit_ids = assignments.values_list('learning_unit_id', flat=True)
    total_exercises = Exercise.objects.filter(learning_unit_id__in=learning_unit_ids).count()

    # Completed exercises
    completed_exercises = Exercise_Result.objects.filter(
        assignment__in=assignments,
        completed_at__isnull=False
    ).count()

    # Total time spent
    total_time_spent = Exercise_Result.objects.filter(
        assignment__in=assignments
    ).aggregate(total_time=Sum('time_spent'))['total_time'] or 0

    return Response({
        'total_exercises': total_exercises,
        'completed_exercises': completed_exercises,
        'total_time_spent': total_time_spent
    }, status=200)


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
        # Ensure we either update an existing result or create it and mark completed
        exercise_result, created = Exercise_Result.objects.update_or_create(
            assignment=assignment,
            exercise=exercise,
            defaults={
                'completed_at': timezone.now()
            }
        )

        return Response({'message': 'Exercise marked as completed'}, status=200)


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
        # Validate and coerce numeric inputs. Accept zeros but reject missing/invalid values.
        try:
            num_incorrect = int(request.data.get('num_incorrect'))
            num_correct = int(request.data.get('num_correct'))
            time_spent = int(request.data.get('time_spent'))
        except (TypeError, ValueError):
            return Response({'error': 'num_incorrect, num_correct, and time_spent are required and must be numbers'}, status=400)

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
                'time_spent': time_spent,
                'completed_at': timezone.now()
            }
        )

        # Update Exercise_Result aggregates (time spent, num_correct, num_incorrect)
        # Ensure numeric fields are initialised
        exercise_result.num_incorrect = (exercise_result.num_incorrect or 0) + num_incorrect
        exercise_result.num_correct = (exercise_result.num_correct or 0) + num_correct
        exercise_result.time_spent = (exercise_result.time_spent or 0) + time_spent

        # Recompute accuracy of child's Exercise_Result from aggregated totals
        total_answers = exercise_result.num_correct + exercise_result.num_incorrect
        if total_answers > 0:
            exercise_result.accuracy = (exercise_result.num_correct / total_answers * 100)
        else:
            exercise_result.accuracy = 0.0

        exercise_result.save()

        serializer = QuestionResultSerializer(result)
        return Response(serializer.data, status=201 if created else 200)
