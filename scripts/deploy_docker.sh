#!/usr/bin/env bash
# Shell script to deploy stack via Docker Compose
set -e

echo "Building and launching Docker containers..."
docker compose -f docker/docker-compose.yml up -d --build
