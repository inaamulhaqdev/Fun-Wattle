import os
import sys
import django
import uuid
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from django.utils import timezone
from openai import AzureOpenAI

# Ensure module path works when running: python -m controller.ai-pipeline.populate_document
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../../.."))
sys.path.append(PROJECT_ROOT)

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from controller.models import Rag_Context  # after django.setup()

# Load environment variables
load_dotenv()

AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = "https://taker-mh6ts5xf-eastus2.cognitiveservices.azure.com/openai/deployments/text-embedding-3-small/embeddings?api-version=2023-05-15"
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME = "text-embedding-3-small"

if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT:
    raise ValueError("Missing Azure OpenAI credentials in .env")

# Azure client
client = AzureOpenAI(
    api_version="2024-12-01-preview",
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY,
)

# PDF directory → controller/ai-pipeline/pdfs
PDF_DIR = os.path.join(CURRENT_DIR, "pdfs")


# Text Chunking
def chunk_text(text, chunk_size=600, overlap=100):
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
    return [c for c in chunks if len(c) > 50]


# PDF Processor
def process_pdf(file_path):
    pdf_name = os.path.basename(file_path)
    print(f"\nProcessing PDF: {pdf_name}")

    # Read PDF data
    reader = PdfReader(file_path)
    text = "".join(page.extract_text() or "" for page in reader.pages)

    if not text.strip():
        print(f"No readable text in {pdf_name}")
        return

    chunks = chunk_text(text)
    print(f"Split into {len(chunks)} chunks")

    source_url = f"file://{file_path}"

    # Insert each chunk as a new Rag_Context row
    for i, chunk in enumerate(chunks, start=1):
        try:
            res = client.embeddings.create(
                model=AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
                input=chunk
            )
            embedding = res.data[0].embedding

            Rag_Context.objects.create(
                id=uuid.uuid4(),
                source_name=pdf_name,
                source_url=source_url,
                content_chunk=chunk,
                embedding=embedding,
                created_at=timezone.now(),
            )

            print(f"Chunk {i}/{len(chunks)} added")

        except Exception as e:
            print(f"Error embedding chunk {i}: {e}")

    print(f"Finished '{pdf_name}'")


# Main runner
def main():
    if not os.path.exists(PDF_DIR):
        print(f"PDF directory missing: {PDF_DIR}")
        return

    pdf_files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith(".pdf")]

    if not pdf_files:
        print("No PDF files found.")
        return

    for pdf in pdf_files:
        process_pdf(os.path.join(PDF_DIR, pdf))

    print("\nAll PDFs processed.")


# python -m controller.ai-pipeline.populate_document
if __name__ == "__main__":
    main()
