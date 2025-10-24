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

    class Meta:
        db_table = 'User'


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile_type = models.CharField(max_length=10, choices=(('parent', 'Parent'), ('therapist', 'Therapist'), ('child', 'Child')))
    name = models.CharField(max_length=100)
    profile_picture = models.URLField(blank=True, null=True)
    pin_hash = models.CharField(max_length=256, blank=True, null=True)  # Null for children, Optional for Therapist, required for Parent (enforced in views)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Profile'

    def __str__(self):
        return f"name={self.name}, profile_type={self.profile_type}"


# This is a M:M Association table between Users and Profiles (Details of what profile and user types can be associated is enforced in views)
class User_Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_profiles')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='linked_users')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'User_Profile'

    def __str__(self):
        return f"user={self.user.email}, profile={self.profile.name}"


######################### LEARNING ACTIVITY MODELS #########################

class Learning_Unit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=(('articulation', 'Articulation'), ('language_building', 'Language Building'), ('comprehension', 'Comprehension')))
    image = models.URLField(blank=True, null=True)
    num_tasks = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Learning_Unit'

    def __str__(self):
        return f"learning_unit={self.title}, category={self.category}"


class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learning_unit = models.ForeignKey(Learning_Unit, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField()
    speaking = models.BooleanField(default=False)
    task_type = models.CharField(default=None, max_length=20, choices=(('match', 'Match'), ('question', 'Question'), ('true_false', 'True False')))
    question_data = models.JSONField(default=None)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Task'

    def __str__(self):
        return f"learning_unit={self.learning_unit.title}, task={self.title}"


class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learning_unit = models.ForeignKey(Learning_Unit, on_delete=models.CASCADE, related_name='assignments')
    participation_type = models.CharField(max_length=15, choices=(('required', 'Required'), ('recommended', 'Recommended')))
    assigned_to = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    num_tasks_completed = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Assignment'

    def __str__(self):
        return f"learning_unit={self.learning_unit.title}, assigned_to={self.assigned_to.name}"


class Task_Progress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='task_progresses')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='task_progresses')
    session_start_time = models.DateTimeField(auto_now_add=True)
    session_end_time = models.DateTimeField(null=True, blank=True)
    total_time_spent = models.IntegerField(default=0)  # this will be in seconds
    attempts_made = models.IntegerField(default=0)
    got_correct = models.BooleanField(default=False)
    accuracy = models.FloatField(default=0.0) # this will be a percentage
    answer_data = models.JSONField(null=True, blank=True)  # to store detailed answer info (for all attempts)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Task_Progress'

    def __str__(self):
        return f"learning_unit={self.assignment.learning_unit.title}, task={self.task.title}, child={self.assignment.assigned_to.name}"


