import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("../../firebase-admin.json")
firebase_admin.initialize_app(cred)

firebase_auth = auth
