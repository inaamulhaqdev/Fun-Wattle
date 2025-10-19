from django.db import models
import uuid

######################### USER MODELS #########################

# Very important to keep in sync with the User table in Supabase Auth
# (design decision to have User model is for full django ORM integration)
class User(models.Model):
    id = models.UUIDField(primary_key=True, editable=False) # Same as Supabase Auth UUID
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=10, choices=(('parent', 'Parent'), ('therapist', 'Therapist')))
    subscription_type = models.CharField(max_length=10, choices=(('free_trial', 'Free Trial'), ('paid', 'Paid')))
    subscription_start = models.DateTimeField(auto_now_add=True)
    subscription_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile_type = models.CharField(max_length=10, choices=(('parent', 'Parent'), ('therapist', 'Therapist'), ('child', 'Child')))
    name = models.CharField(max_length=100)
    profile_picture = models.URLField(blank=True, null=True)
    pin_hash = models.CharField(max_length=256, blank=True, null=True)  # Null for children, Optional for Therapist, required for Parent (enforced in views)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"name={self.name}, profile_type={self.profile_type}"


# This is a M:M Association table between Users and Profiles (Details of what profile and user types can be associated is enforced in views)
class User_Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_profiles')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='linked_users')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"user={self.user.email}, profile={self.profile.name}"


######################### LEARNING ACTIVITY MODELS #########################

# Haven't migrated these yet, we change / add a lot more detail to them (there's more layers than anticipated)

# class Activity(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     title = models.CharField(max_length=200)
#     description = models.TextField(blank=True)
#     category = models.CharField(max_length=100, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.title

# class AssignedActivity(models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='assignments')
#     child_assigned_to = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_activities')
#     user_assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_activities')
#     assigned_at = models.DateTimeField(auto_now_add=True)
#     due_date = models.DateTimeField(null=True, blank=True)
#     completed_at = models.DateTimeField(null=True, blank=True)

#     def __str__(self):
#         return f"Activity '{self.activity.title}' assigned to {self.child_assigned_to.name}"



