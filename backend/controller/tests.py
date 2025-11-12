from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import uuid

from .models import User

# Test sample

class UserViewsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/user/create/'
        self.subscribe_url = '/api/user/subscribe/'

    def test_register_user_success(self):
        user_id = str(uuid.uuid4())
        payload = {
            'id': user_id,
            'user_type': 'parent',
            'email': 'newuser@example.com'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get('id'), user_id)
        self.assertEqual(response.data.get('email'), 'newuser@example.com')
        self.assertEqual(response.data.get('user_type'), 'parent')

    def test_register_user_missing_fields(self):
        payload = {
            'user_type': 'parent',
            # missing id and email
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_user_invalid_type(self):
        payload = {
            'id': str(uuid.uuid4()),
            'user_type': 'invalid',
            'email': 'x@example.com'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_user_duplicate(self):
        user_id = str(uuid.uuid4())
        User.objects.create(id=user_id, email='dup@example.com', user_type='parent', subscription_type='free_trial')
        payload = {
            'id': user_id,
            'user_type': 'parent',
            'email': 'dup2@example.com'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_subscribe_user_success_paid(self):
        user_id = str(uuid.uuid4())
        User.objects.create(id=user_id, email='sub@example.com', user_type='parent', subscription_type='free_trial')
        payload = {
            'id': user_id,
            'subscription_type': 'paid'
        }
        response = self.client.post(self.subscribe_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('subscription_type'), 'paid')

    def test_subscribe_user_free_trial_requires_end(self):
        user_id = str(uuid.uuid4())
        User.objects.create(id=user_id, email='ft@example.com', user_type='parent', subscription_type='paid')
        payload = {
            'id': user_id,
            'subscription_type': 'free_trial'
            # no subscription_end
        }
        response = self.client.post(self.subscribe_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_subscribe_user_not_found(self):
        payload = {
            'id': str(uuid.uuid4()),
            'subscription_type': 'paid'
        }
        response = self.client.post(self.subscribe_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
