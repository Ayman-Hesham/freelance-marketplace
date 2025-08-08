#!/bin/bash
set -e

echo "Validating service..."

cd /home/ubuntu/freelance-marketplace

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "Error: Containers are not running"
    exit 1
fi

echo "Service validation completed successfully"
