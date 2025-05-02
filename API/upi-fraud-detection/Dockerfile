FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy requirements.txt first so it can be cached
COPY requirements.txt .

# Create virtual environment (optional but recommended) and use system installation
RUN uv venv /app/venv
RUN uv pip install --no-cache-dir --system -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Default command
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
