from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

######################### USER MODELS #########################

class UserLogin(models.Model):
    firebase_auth_uid = models.CharField(unique=True)
    email = models.EmailField(unique=True)

    class Meta:
        abstract = True # This means the model is an abstract base class, so no database table will be created for it.


class UserProfile(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    profile_picture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    pin_hash = models.CharField(max_length=256, blank=True, null=True)  # Optional for Therapist, required for Parent (enforced in views)
    class Meta:
        abstract = True


class Parent(UserLogin, UserProfile):
    def __str__(self):
        return f"name={self.name}, email={self.email}"


class Therapist(UserLogin, UserProfile):
    def __str__(self):
        return f"name={self.name}, email={self.email}"


class Child(UserProfile):
    parent = models.ManyToManyField(Parent, related_name='children')
    therapist = models.ManyToManyField(Therapist, related_name='clients')

    def __str__(self):
        parents = ", ".join(p.name for p in self.parent.all())
        therapists = ", ".join(t.name for t in self.therapist.all())
        return f"name={self.name}, parents=[{parents}], therapists=[{therapists}]"

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



