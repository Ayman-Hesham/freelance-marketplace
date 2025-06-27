#!/bin/bash

# Backup directory
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz ./backend/uploads

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz ./logs

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/uploads_$DATE.tar.gz s3://your-bucket/backups/
aws s3 cp $BACKUP_DIR/logs_$DATE.tar.gz s3://your-bucket/backups/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete