FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (none for now)
# RUN apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY main.py .

# Run the script
CMD ["python", "main.py"]
