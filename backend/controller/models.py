from django.db import models
from pgvector.django import VectorField
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
    child_details = models.JSONField(null=True, blank=True)  # To store additional child-specific profile details
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
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Learning_Unit'

    def __str__(self):
        return f"learning_unit={self.title}, category={self.category}"


class Exercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learning_unit = models.ForeignKey(Learning_Unit, on_delete=models.CASCADE, related_name='exercises')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField()
    exercise_type = models.CharField(max_length=20, choices=(('multiple_drag', 'Multiple Drag'), ('multiple_select', 'Multiple Select'), ('ordered_drag', 'Ordered Drag'), ('speaking', 'Speaking')))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Exercise'

    def __str__(self):
        return f"learning_unit={self.learning_unit.title}, exercise={self.title}"


class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=(('multiple_drag', 'Multiple Drag'), ('multiple_select', 'Multiple Select'), ('ordered_drag', 'Ordered Drag'), ('speaking', 'Speaking')))
    order = models.IntegerField()
    question_data = models.JSONField()

    class Meta:
        db_table = 'Question'

    def __str__(self):
        return f"exercise={self.exercise.title}, question_id={self.id}"


class Assignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learning_unit = models.ForeignKey(Learning_Unit, on_delete=models.CASCADE, related_name='assignments')
    participation_type = models.CharField(max_length=15, choices=(('required', 'Required'), ('recommended', 'Recommended')))
    assigned_to = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Assignment'

    def __str__(self):
        return f"learning_unit={self.learning_unit.title}, assigned_to={self.assigned_to.name}"


class Exercise_Result(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='exercise_results')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='exercise_results')
    time_spent = models.IntegerField(null=True, blank=True)
    accuracy = models.FloatField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Exercise_Result'

    def __str__(self):
        return f"learning_unit={self.assignment.learning_unit.title}, exercise={self.exercise.title}, child={self.assignment.assigned_to.name}"


class Child_Embedding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    child_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='embeddings')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='child_embeddings')
    embedding = VectorField(dimensions=1536)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Child_Embedding'

    def __str__(self):
        return f"child_profile={self.child_profile.name}, embedding_id={self.id}"


class Question_Embedding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='question_embeddings')
    embedding = VectorField(dimensions=1536)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Question_Embedding'

    def __str__(self):
        return f"question_id={self.question.id}, embedding_id={self.id}"


class Rag_Context(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_name = models.TextField()
    source_url = models.TextField()
    content_chunk = models.TextField()
    embedding = VectorField(dimensions=1536)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Rag_Context'

    def __str__(self):
        return f"source_name={self.source_name}, context_id={self.id}"
