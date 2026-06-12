FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies for pdfplumber (needs some C libs)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render default is 10000)
EXPOSE 10000

# Run with gunicorn + uvicorn workers for production
CMD ["gunicorn", "main:app", \
     "--workers", "2", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:10000", \
     "--timeout", "300", \
     "--graceful-timeout", "120"]
