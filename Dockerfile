# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create directories
RUN mkdir -p /app/logs /app/run

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Initialize PostgreSQL script
COPY docker/init-postgres.sh /docker-entrypoint-initdb.d/init-postgres.sh
RUN chmod +x /docker-entrypoint-initdb.d/init-postgres.sh

# Create startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Expose port 8991
EXPOSE 8991

# Start the application
CMD ["/start.sh"]
