#!/usr/bin/env bash
# Shell script to deploy updated Pay-Fixation Docker stack
set -e

echo "=========================================================="
echo " Deploying Pay-Fixation Stack to Docker"
echo "=========================================================="

COMPOSE_FILE="docker/docker-compose.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

echo -e "\n[1/3] Building & Launching Containers..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo -e "\n[2/3] Checking Running Containers..."
sleep 3
docker compose -f "$COMPOSE_FILE" ps

echo -e "\n[3/3] Verifying SAI Pension Oracle 12c Lookup Endpoint..."
curl -s http://localhost:8085/api/v1/sai-pension/lookup?application_no=APP-2026-8812 || echo "Waiting for service startup..."

echo -e "\n=========================================================="
echo " Deployment Complete!"
echo " Web UI: http://localhost:5173"
echo " API Engine: http://localhost:8085"
echo "=========================================================="
