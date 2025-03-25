#!/bin/bash

echo "Step 1. Pull Docker images..."
docker image pull node

echo "Step 2. Install node modules..."
docker run -v $(pwd):/usr/src/app -w /usr/src/app node npm install

echo "Step 3. Create config.json..."
read -p "When ready select Y to continue? (Y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1
cp config.json.example config.json
nano config.json

echo "Step 4. Starting Docker containers..."
docker compose up -d
