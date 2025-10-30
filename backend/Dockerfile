FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Django's port
EXPOSE 7000

# Development mode (this with volume mapping gives us live-reload with `docker-compose up`, so we don't need to rebuild image on code changes!!)
CMD ["python", "manage.py", "runserver", "0.0.0.0:7000"]
