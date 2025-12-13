from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import uuid
from django.utils import timezone

from controller.models import (
    User, Profile, Learning_Unit, Exercise, Assignment,
    Exercise_Result, Question, Question_Result
)

# result views test

class ResultViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(id=uuid.uuid4(), email='u@test.com', user_type='parent', subscription_type='free_trial')
        self.child = Profile.objects.create(profile_type='child', name='Child')
        self.lu = Learning_Unit.objects.create(title='LU', description='', category='articulation')
        self.exercise = Exercise.objects.create(learning_unit=self.lu, title='E1', description='', order=1, exercise_type='speaking')
        self.question = Question.objects.create(exercise=self.exercise, question_type='speaking', order=1, question_data={})
        self.assignment = Assignment.objects.create(learning_unit=self.lu, participation_type='required', assigned_to=self.child, assigned_by=self.user)

    def test_results_for_exercise_post_and_get(self):
        # POST mark exercise completed
        url = f'/api/result/{self.child.id}/exercise/{self.exercise.id}/'
        r = self.client.post(url, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        # GET results for exercise
        r2 = self.client.get(url)
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

    def test_results_for_question_post_updates_aggregates(self):
        url = f'/api/result/{self.child.id}/question/{self.question.id}/'
        payload = {'num_incorrect': 1, 'num_correct': 2, 'time_spent': 30}
        r = self.client.post(url, payload, format='json')
        self.assertIn(r.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))

        # Verify exercise_result aggregates
        er = Exercise_Result.objects.filter(assignment__assigned_to=self.child, exercise=self.exercise).first()
        self.assertIsNotNone(er)
        self.assertEqual(er.num_correct, 2)
        self.assertEqual(er.num_incorrect, 1)

    def test_results_for_learning_unit_overall(self):
        url = f'/api/result/{self.child.id}/learning_unit_overall/total/'
        r = self.client.get(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn('total_exercises', r.data)
