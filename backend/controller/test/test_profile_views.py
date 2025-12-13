from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
import uuid

from controller.models import User, Profile, User_Profile


class ProfileViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(id=uuid.uuid4(), email='p@test.com', user_type='parent', subscription_type='free_trial')

    def test_create_and_get_profile(self):
        payload = {'user_id': str(self.user.id), 'name': 'Kid', 'creating_child_profile': True}
        r = self.client.post('/api/profile/create/', payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertIn('profile', r.data)

        profile_id = r.data['profile']['id']
        r2 = self.client.get(f'/api/profile/{profile_id}/data/')
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

    def test_get_user_profiles(self):
        # create a profile
        profile = Profile.objects.create(profile_type='child', name='C1')
        User_Profile.objects.create(user=self.user, profile=profile)
        r = self.client.get(f'/api/profile/{self.user.id}/list/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertTrue(len(r.data) >= 1)
