import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from controller.models import Profile, User_Profile
import requests

# Test the avatar fetching function
SUPABASE_URL = 'https://cvchwjconynpzhktnuxn.supabase.co'
SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Y2h3amNvbnlucHpoa3RudXhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY0NzQxNCwiZXhwIjoyMDc2MjIzNDE0fQ.Z4OTfF5Cvz5WD5vBwzFSySfRIS3ACycGqd6VrI9ekuA'

# Get parent and therapist profiles
print("Checking avatars in Supabase Auth...\n")

parent_profile = Profile.objects.filter(profile_type='parent').first()
therapist_profile = Profile.objects.filter(profile_type='therapist').first()

if parent_profile:
    user_profile = User_Profile.objects.filter(profile=parent_profile).first()
    if user_profile:
        user_id = str(user_profile.user.id)
        print(f'Parent: {parent_profile.name}')
        print(f'User ID: {user_id}')
        print(f'Current profile_picture in DB: "{parent_profile.profile_picture}"')
        
        # Fetch from Supabase
        headers = {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        }
        response = requests.get(f'{SUPABASE_URL}/auth/v1/admin/users/{user_id}', headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            metadata = user_data.get('user_metadata', {})
            raw_meta = user_data.get('raw_user_meta_data', {})
            print(f'User metadata: {metadata}')
            print(f'Raw user meta data: {raw_meta}')
            
            avatar_url = metadata.get('avatar_url') or raw_meta.get('avatar_url') or metadata.get('picture') or raw_meta.get('picture')
            print(f'Found avatar URL: {avatar_url}')
        print('---\n')

if therapist_profile:
    user_profile = User_Profile.objects.filter(profile=therapist_profile).first()
    if user_profile:
        user_id = str(user_profile.user.id)
        print(f'Therapist: {therapist_profile.name}')
        print(f'User ID: {user_id}')
        print(f'Current profile_picture in DB: "{therapist_profile.profile_picture}"')
        
        # Fetch from Supabase
        headers = {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        }
        response = requests.get(f'{SUPABASE_URL}/auth/v1/admin/users/{user_id}', headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            metadata = user_data.get('user_metadata', {})
            raw_meta = user_data.get('raw_user_meta_data', {})
            print(f'User metadata: {metadata}')
            print(f'Raw user meta data: {raw_meta}')
            
            avatar_url = metadata.get('avatar_url') or raw_meta.get('avatar_url') or metadata.get('picture') or raw_meta.get('picture')
            print(f'Found avatar URL: {avatar_url}')
        print('---\n')
