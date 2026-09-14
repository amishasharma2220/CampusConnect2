# ---------- Stage 1: builder ----------
FROM python:3.11-slim AS builder

WORKDIR /build

# System deps needed to build wheels for psycopg2-binary, bcrypt, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Build wheels so the final stage doesn't need build tools at all
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt


# ---------- Stage 2: runtime ----------
FROM python:3.11-slim AS runtime

# Runtime-only system deps (psycopg2 needs libpq at runtime, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd --create-home --shell /bin/bash appuser
WORKDIR /app

# Install prebuilt wheels from the builder stage
COPY --from=builder /build/wheels /wheels
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt && \
    rm -rf /wheels

# Copy application code
COPY . .

# .env is provided at runtime via --env-file or docker-compose env_file,
# never baked into the image.

RUN chown -R appuser:appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# $PORT lets this work unchanged on Render (which injects PORT);
# defaults to 8000 for local/docker-compose use.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]