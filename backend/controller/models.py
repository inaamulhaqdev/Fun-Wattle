from django.db import models

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
    pin_hash = models.CharField(max_length=256, optional=True)
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
    assigned_by = models.ForeignKey(UserProfile.id, on_delete=models.SET_NULL, null=True, related_name='assigned_activities')
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Activity '{self.activity.title}' assigned to {self.child.name}"



