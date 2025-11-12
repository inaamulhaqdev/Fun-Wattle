import os
import django
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from django.utils import timezone
from openai import AzureOpenAI

# Django setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from controller.models import Document, Document_Section

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

# PDF settings (backend/controller/ai-pipeline/pdfs/)
PDF_DIR = os.path.join(os.path.dirname(__file__), "pdfs")

# Chunking utility 
def chunk_text(text, chunk_size=600, overlap=100):
    """Split long text into overlapping chunks"""
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start += chunk_size - overlap
    return [c for c in chunks if len(c) > 50]  # ignore tiny chunks


# process PDF
def process_pdf(file_path):
    pdf_name = os.path.basename(file_path)
    print(f"\nProcessing PDF: {pdf_name}")

    # read text from PDF
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    if not text.strip():
        print(f"No readable text found in {pdf_name}")
        return

    # create document record
    document = Document.objects.create(
        name=pdf_name,
        storage_path=None,
        created_at=timezone.now(),
    )
    print(f"Created Document entry: {document.name}")

    # split and embed
    chunks = chunk_text(text)
    print(f"Split into {len(chunks)} chunks")

    for i, chunk in enumerate(chunks, start=1):
        try:
            response = client.embeddings.create(
                model=AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
                input=chunk
            )
            embedding = response.data[0].embedding

            Document_Section.objects.create(
                document=document,
                content=chunk,
                embedding=embedding,
                created_at=timezone.now()
            )
            print(f"Added chunk {i}/{len(chunks)} ({len(chunk)} chars)")
        except Exception as e:
            print(f"Failed to embed chunk {i}: {e}")

    print(f"Finished processing '{pdf_name}' ({len(chunks)} chunks stored)")


# Main
def main():
    if not os.path.exists(PDF_DIR):
        print(f"PDF directory not found: {PDF_DIR}")
        return

    pdf_files = [f for f in os.listdir(PDF_DIR) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print(f"No PDF files found in {PDF_DIR}")
        return

    for pdf in pdf_files:
        file_path = os.path.join(PDF_DIR, pdf)
        process_pdf(file_path)

    print("\nAll documents processed successfully.")


if __name__ == "__main__":
    main()