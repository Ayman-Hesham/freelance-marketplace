#!/bin/bash
set -e

echo "Stopping application..."

cd /home/ubuntu/freelance-marketplace

# Stop Docker containers if docker-compose.yml exists
if [ -f docker-compose.yml ]; then
    echo "Stopping Docker containers..."
    docker-compose down --remove-orphans || true
    
    # Clean up unused containers and images
    docker system prune -f || true
else
    echo "No docker-compose.yml found, skipping container stop"
fi

echo "Application stopped"
