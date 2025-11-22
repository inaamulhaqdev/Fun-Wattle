from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import uuid

from controller.models import User

# User view tests

class UserViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/user/create/'
        self.subscribe_url = '/api/user/subscribe/'

    def test_register_user_success(self):
        user_id = str(uuid.uuid4())
        payload = {'id': user_id, 'user_type': 'parent', 'email': 'a@example.com'}
        r = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data.get('id'), user_id)

    def test_register_missing_fields(self):
        r = self.client.post(self.register_url, {'user_type': 'parent'}, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_subscribe_user_flow(self):
        user_id = str(uuid.uuid4())
        User.objects.create(id=user_id, email='b@example.com', user_type='parent', subscription_type='free_trial')
        r = self.client.post(self.subscribe_url, {'id': user_id, 'subscription_type': 'paid'}, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data.get('subscription_type'), 'paid')
