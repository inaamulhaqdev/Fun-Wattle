from django.db import models

######################### USER MODELS #########################

class User(models.Model):
    id = models.AutoField(primary_key=True)
    firebase_auth_uid = models.CharField(unique=True, max_length=255)
    USER_TYPES = (
        ('parent', 'Parent'),
        ('therapist', 'Therapist'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"user_type={self.user_type}, email={self.email}"


class Profile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True) # For parents and therapists we can easily find their firebase user and email, it will be null for children
    PROFILE_TYPES = (
        ('parent', 'Parent'),
        ('therapist', 'Therapist'),
        ('child', 'Child'),
    )
    profile_type = models.CharField(max_length=10, choices=PROFILE_TYPES)
    name = models.CharField(max_length=100)
    profile_picture = models.URLField(blank=True, null=True)
    pin_hash = models.CharField(max_length=256, blank=True, null=True)  # Null for children, Optional for Therapist, required for Parent (enforced in views)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"name={self.name}, profile_type={self.profile_type}"


class User_ChildProfile(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='linked_children')
    child = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='linked_users')

    def __str__(self):
        return f"user={self.user.email}, child={self.child.name}"


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
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='assignments')
    child_assigned_to = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_activities')
    user_assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_activities')
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Activity '{self.activity.title}' assigned to {self.child_assigned_to.name}"



