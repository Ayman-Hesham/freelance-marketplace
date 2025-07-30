#!/bin/bash
set -e

echo "Starting application..."

cd /opt/your-app

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p logs/nginx logs/backend ssl

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "Loading environment variables..."
    set -a
    source .env
    set +a
else
    echo "Warning: .env file not found"
fi

# Ensure Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Starting Docker service..."
    systemctl start docker
    sleep 5
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for containers to be ready
echo "Waiting for containers to start..."
sleep 10

# Show container status
echo "Container status:"
docker-compose ps

# Show recent logs
echo "Recent logs:"
docker-compose logs --tail=20

echo "Application started successfully"
