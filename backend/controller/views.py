from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Parent, Therapist, Child, Activity, AssignedActivity
from .serializers import ParentSerializer, TherapistSerializer, ChildSerializer, ActivitySerializer, AssignedActivitySerializer
from rest_framework.exceptions import MethodNotAllowed

class ParentViewSet(viewsets.ModelViewSet):
	queryset = Parent.objects.all()
	serializer_class = ParentSerializer

	def destroy(self, request, *args, **kwargs):
		raise MethodNotAllowed('DELETE')

class TherapistViewSet(viewsets.ModelViewSet):
	queryset = Therapist.objects.all()
	serializer_class = TherapistSerializer

class ChildViewSet(viewsets.ModelViewSet):
	queryset = Child.objects.all()
	serializer_class = ChildSerializer

class ActivityViewSet(viewsets.ModelViewSet):
	queryset = Activity.objects.all()
	serializer_class = ActivitySerializer

class AssignedActivityViewSet(viewsets.ModelViewSet):
	queryset = AssignedActivity.objects.all()
	serializer_class = AssignedActivitySerializer





