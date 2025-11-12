from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import *
from ..serializers import *
from time import timezone


@api_view(['POST'])
def create_assignment(request):
    child_id = request.data.get('child_id')
    learning_unit_id = request.data.get('learning_unit_id')
    user_id = request.data.get('user_id')
    participation_type = request.data.get('participation_type')
    num_question_attempts = request.data.get('num_question_attempts', 2) # Default to 2 attempts

    if not all([learning_unit_id, child_id, user_id]):
        return Response({'error': 'learning_unit_id, child_id, and user_id are required'}, status=400)

    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    learning_unit = Learning_Unit.objects.filter(id=learning_unit_id).first()
    user = User.objects.filter(id=user_id).first()

    if not learning_unit:
        return Response({'error': 'Learning unit not found'}, status=404)
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)
    if not user:
        return Response({'error': 'User not found'}, status=404)

    pre_existing_assignment = Assignment.objects.filter(
        learning_unit=learning_unit,
        assigned_to=child_profile
    ).first()
    if pre_existing_assignment:
        return Response({'error': 'Assignment already exists for this child and learning unit'}, status=400)

    if participation_type not in ['required', 'recommended']:
        return Response({'error': 'participation_type must be "required" or "recommended"'}, status=400)

    assignment = Assignment.objects.create(
        learning_unit=learning_unit,
        assigned_to=child_profile,
        participation_type=participation_type,
        assigned_by=user,
        num_question_attempts=num_question_attempts
    )
    if not assignment:
        return Response({'error': 'Failed to create assignment'}, status=500)

    return Response({'message': 'Assignment created successfully'}, status=201)


@api_view(['POST'])
def complete_assignment(request):
    child_id = request.data.get('child_id')
    if not child_id:
        return Response({'error': 'child_id is required'}, status=400)

    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)

    learning_unit_id = request.data.get('learning_unit_id')
    if not learning_unit_id:
        return Response({'error': 'learning_unit_id is required'}, status=400)

    learning_unit = Learning_Unit.objects.filter(id=learning_unit_id).first()
    if not learning_unit:
        return Response({'error': 'Learning unit not found'}, status=404)

    assignment = Assignment.objects.filter(
        learning_unit=learning_unit,
        assigned_to=child_profile
    ).first()
    if not assignment:
        return Response({'error': 'Assignment not found'}, status=404)

    assignment.completed_at = timezone.now()
    assignment.save()

    return Response({'message': 'Assignment completed successfully'}, status=200)


@api_view(['GET'])
def assigned_by_assignments(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    assigned_learning_units = Assignment.objects.filter(assigned_by=user)
    serializer = AssignmentSerializer(assigned_learning_units, many=True)
    return Response(serializer.data, status=200)


@api_view(['GET'])
def assigned_to_assignments(request, child_id):
    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)

    assignments = Assignment.objects.filter(assigned_to=child_profile)
    serializer = AssignmentSerializer(assignments, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def unassign_assignment(request, child_id, learning_unit_id):
    child_profile = Profile.objects.filter(id=child_id, profile_type='child').first()
    if not child_profile:
        return Response({'error': 'Child profile not found'}, status=404)

    learning_unit = Learning_Unit.objects.filter(id=learning_unit_id).first()
    if not learning_unit:
        return Response({'error': 'Learning unit not found'}, status=404)

    assignment = Assignment.objects.filter(
        learning_unit=learning_unit,
        assigned_to=child_profile
    ).first()
    if not assignment:
        return Response({'error': 'Assignment not found'}, status=404)

    assignment.delete()
    return Response({'message': 'Assignment removed successfully'}, status=200)