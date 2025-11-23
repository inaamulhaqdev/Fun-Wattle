from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import uuid
from django.utils import timezone

from controller.models import User, Profile, Learning_Unit, Exercise, Question

# Tests for Content Views

class ViewsIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a user and profiles
        self.user = User.objects.create(id=uuid.uuid4(), email='u@example.com', user_type='parent', subscription_type='free_trial')
        self.child = Profile.objects.create(profile_type='child', name='Child One')

        # Learning unit and exercise
        self.lu = Learning_Unit.objects.create(title='LU1', description='desc', category='articulation')
        self.exercise = Exercise.objects.create(learning_unit=self.lu, title='Ex1', description='ex', order=1, exercise_type='speaking')
        self.q = Question.objects.create(exercise=self.exercise, question_type='speaking', order=1,question_data={'question':'question'})

    def test_content(self):
        resp = self.client.get('/api/content/learning_units/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(any(u['title'] == 'LU1' for u in resp.data))

        resp2 = self.client.get(f'/api/content/{self.lu.id}/exercises/')
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp2.data) >= 1)

        resp3 = self.client.get(f'/api/content/{self.exercise.id}/questions/')
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp3.data) >= 1)




   
    
    