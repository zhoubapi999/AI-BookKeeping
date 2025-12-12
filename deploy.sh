#!/bin/bash

# Ensure we are in the script's directory
cd "$(dirname "$0")"

# 1. Pull latest code (先拉取git代码)
echo "------------------------------------------------"
echo "Step 1: Updating Code"
if command -v git &> /dev/null && [ -d ".git" ]; then
    echo "Git found. Pulling latest code..."
    git pull
    if [ $? -eq 0 ]; then
        echo "Code updated successfully."
    else
        echo "Warning: Git pull failed. Proceeding with existing code."
    fi
else
    echo "Git not found or not a git repository. Skipping code update."
    echo "If you uploaded files manually, this is normal."
fi
echo "------------------------------------------------"

# 2. Build and restart containers (再去执行对应的命令)
echo "Building and restarting containers..."
# If .env doesn't exist, you might want to create it or copy from example
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Please ensure environment variables are set."
fi

docker-compose up --build -d

echo "Deployment completed!"
