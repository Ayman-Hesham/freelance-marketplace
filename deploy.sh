#!/bin/bash

# Pull latest changes
git pull origin main

# Create necessary directories
mkdir -p logs/nginx logs/backend ssl

# Load environment variables
set -a
source .env
set +a

# Build and restart containers
docker-compose down
docker-compose build
docker-compose up -d

# Show container status
docker-compose ps