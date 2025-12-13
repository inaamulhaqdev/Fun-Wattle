from openai import OpenAI
import os
import json
import django
from dotenv import load_dotenv
from django.utils import timezone
from openai import AzureOpenAI
from azure.core.credentials import AzureKeyCredential


# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from controller.models import Question, Question_Embedding

load_dotenv()

# Azure settings
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_EMB_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME="text-embedding-3-small"


if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
    raise ValueError("Missing Azure OpenAI credentials")

# Unified OpenAI SDK (correct for openai==2.7.1)
client = AzureOpenAI(
    api_version="2024-12-01-preview",
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY
)

# Load expected answers
BASE_DIR = os.path.dirname(__file__)
json_path = os.path.join(BASE_DIR, "expted-answers-final-demo.json")
data = json.load(open(json_path))

res = client.embeddings.create(
    model="text-embedding-3-small",
    input="hello"
)
print(len(res.data[0].embedding))
print(f"Loaded {len(data)} question entries")

# Generate embeddings
for entry in data:
    question_id = entry["question_id"]
    question_text = entry["question_text"]
    expected_answers = entry["expected_answers"]

    try:
        q = Question.objects.get(pk=question_id)
    except Question.DoesNotExist:
        print(f"Question not found: {question_id}")
        continue

    for ans in expected_answers:
        ans = ans.strip()
        if not ans:
            continue

        if Question_Embedding.objects.filter(question=q, expected_answer_text=ans).exists():
            print(f"Skipped duplicate '{ans}'")
            continue

        try:
            response = client.embeddings.create(
                model=AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
                input=ans
            )
            embedding = response.data[0].embedding

            Question_Embedding.objects.create(
                question=q,
                expected_answer_text=ans,
                embedding=embedding,
                created_at=timezone.now()
            )

            print(f"Added embedding for '{ans}'")

        except Exception as e:
            print(f"Failed on '{ans}': {e}")
            continue

print("All embeddings inserted successfully")
