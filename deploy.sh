#!/bin/bash

# Pull latest changes from Git
echo "Pulling latest changes..."
git pull origin main

# Create necessary directories if they don't exist
mkdir -p logs/nginx logs/backend ssl

# Load environment variables
set -a
source .env
set +a

# Stop existing containers
echo "Stopping containers..."
docker compose down

# Build and start containers
echo "Building and starting containers..."
docker compose build --no-cache
docker compose up -d

# Show container status
echo "Container status:"
docker compose ps

# Show logs
echo "Recent logs:"
docker compose logs --tail=50