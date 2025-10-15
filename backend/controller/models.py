from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

######################### USER MODELS #########################

class User(models.Model):
    id = models.AutoField(primary_key=True)
    firebase_auth_uid = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    USER_TYPES = [
        ('parent', 'Parent'),
        ('therapist', 'Therapist'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPES)

    def __str__(self):
        return f"{self.email} ({self.user_type})"

class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    profile_picture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    pin_hash = models.CharField(max_length=256, blank=True, null=True)  # Optional for Therapist, required for Parent (enforced in views)
    PROFILE_TYPES = [
        ('parent', 'Parent'),
        ('therapist', 'Therapist'),
        ('child', 'Child'),
    ]
    profile_type = models.CharField(max_length=10, choices=PROFILE_TYPES)

    def __str__(self):
        return f"{self.name} ({self.profile_type})"


class UserChildProfile(models.Model):
    id = models.AutoField(primary_key=True)
    
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,  # Temporarily PROTECT for safety. Will CASCADE if we want links to auto-delete when a user is removed.
        related_name="linked_children"
    )
    
    child_profile = models.ForeignKey(
        Profile,
        on_delete=models.PROTECT,  # Temporarily PROTECT for safety.
        related_name="linked_users"
    )
    def __str__(self):
        return f"User {self.user.email}, Child {self.child_profile.name}"

######################### LEARNING ACTIVITY MODELS #########################

class Activity(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class AssignedActivity(models.Model):
    id = models.AutoField(primary_key=True)
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='assigned_activities')
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='assigned_activities')

    # Generic foreign key fields
    assigned_by_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True) # Stores which model (Parent or Therapist) assigned the activity
    assigned_by_id = models.PositiveIntegerField(null=True) # Stores the ID of the specific Parent or Therapist who assigned the activity
    assigned_by = GenericForeignKey('assigned_by_type', 'assigned_by_id') # Generic relation to either Parent or Therapist

    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Activity '{self.activity.title}' assigned to {self.child.name}"



