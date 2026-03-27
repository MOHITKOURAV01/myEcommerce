#!/bin/bash

echo "Validating Docker Compose configuration..."
docker compose config -q

if [ $? -ne 0 ]; then
  echo "Error in docker-compose.yml"
  exit 1
fi

echo "Building and starting Docker containers in detached mode..."
docker compose up --build -d

echo "Containers are up and running!"
docker compose ps
