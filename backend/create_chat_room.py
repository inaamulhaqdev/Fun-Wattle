#!/usr/bin/env python
"""
Script to create a chat room between parent and therapist for a child.
Run with: docker exec backend python create_chat_room.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from controller.models import User, Profile, User_Profile, Chat_Room

# Get parent profile
parent_user = User.objects.filter(email="inaamulhaq7847@gmail.com").first()
parent_profile = None
if parent_user:
    parent_up = User_Profile.objects.filter(user=parent_user, profile__profile_type='parent').first()
    if parent_up:
        parent_profile = parent_up.profile
        print(f"✓ Found Parent: {parent_profile.name} (ID: {parent_profile.id})")
    else:
        print("✗ No parent profile found for this user")
else:
    print("✗ Parent user not found with email: inamehaq@gmail.com")

# Get therapist profile  
therapist_user = User.objects.filter(email="testthe@gmail.com").first()
therapist_profile = None
if therapist_user:
    therapist_up = User_Profile.objects.filter(user=therapist_user, profile__profile_type='therapist').first()
    if therapist_up:
        therapist_profile = therapist_up.profile
        print(f"✓ Found Therapist: {therapist_profile.name} (ID: {therapist_profile.id})")
    else:
        print("✗ No therapist profile found for this user")
else:
    print("✗ Therapist user not found with email: testthe@gmail.com")

# Get child profile
child = Profile.objects.filter(name="Child's Inaam", profile_type='child').first()
if child:
    print(f"✓ Found Child: {child.name} (ID: {child.id})")
else:
    print("✗ Child not found with name: Child's Inaam")

# Create chat room if all profiles exist
if parent_profile and therapist_profile and child:
    print("\nChecking for existing chat room...")
    existing_room = Chat_Room.objects.filter(
        messenger_1__in=[parent_profile, therapist_profile],
        messenger_2__in=[parent_profile, therapist_profile],
        child=child
    ).first()
    
    if existing_room:
        print(f"ℹ Chat room already exists!")
        print(f"  Room ID: {existing_room.id}")
        print(f"  Room Name: {existing_room.room_name}")
    else:
        print("\nCreating new chat room...")
        new_room = Chat_Room.objects.create(
            messenger_1=parent_profile,
            messenger_2=therapist_profile,
            child=child,
            room_name=f"{child.name}'s care team"
        )
        print(f"✓ Successfully created chat room!")
        print(f"  Room ID: {new_room.id}")
        print(f"  Room Name: {new_room.room_name}")
        print(f"  Parent: {parent_profile.name}")
        print(f"  Therapist: {therapist_profile.name}")
        print(f"  Child: {child.name}")
else:
    print("\n✗ Cannot create chat room - missing profiles")
    print(f"  Parent: {'✓' if parent_profile else '✗'}")
    print(f"  Therapist: {'✓' if therapist_profile else '✗'}")
    print(f"  Child: {'✓' if child else '✗'}")
