# CampusConnect Backend — Dockerfile
# Place this at: backend/Dockerfile

FROM python:3.11-slim AS base

# Prevents Python from writing .pyc files and buffers stdout (better logs)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps needed for psycopg2 (PostgreSQL driver)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better layer caching — only reinstalls if requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY app/ ./app/

# Non-root user for security
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

# Render sets $PORT dynamically; default to 8000 for local/docker-compose use
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
