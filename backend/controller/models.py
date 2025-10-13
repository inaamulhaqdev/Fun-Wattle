from django.db import models

""" Sample for how to set Modles up 
class LoginRequest(models.Model):
    email = models.EmailField()
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.email
    
class User(models.Model):
    ACCOUNT_TYPES = [
        ('P', 'Parent'),
        ('T', 'Therapist'),
        ('C', 'Child')
    ]
    email = models.EmailField()
    name = models.CharField(max_length=200)
    id = models.TextField(primary_key=True)
    accountType = models.CharField(max_length= 1, choices=ACCOUNT_TYPES)

    def __str__(self):
        return f"{self.id}:{self.name}-({self.accountType})" """
    