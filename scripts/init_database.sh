#!/usr/bin/env bash
# Shell script to initialize PostgreSQL Pay-Fixation database and apply migrations
set -e

echo "Creating database Pay-Fixation..."
docker run --rm -v "$(pwd):/workspace" -e PGPASSWORD="root@123" postgres:alpine psql -h host.docker.internal -U postgres -f /workspace/migrations/00_create_db.sql

echo "Applying initial schema migration..."
docker run --rm -v "$(pwd):/workspace" -e PGPASSWORD="root@123" postgres:alpine psql -h host.docker.internal -U postgres -d "Pay-Fixation" -f /workspace/migrations/20260821000000_init_payfix_schema.sql

echo "Applying Phase 7 RBAC workflow migration..."
docker run --rm -v "$(pwd):/workspace" -e PGPASSWORD="root@123" postgres:alpine psql -h host.docker.internal -U postgres -d "Pay-Fixation" -f /workspace/migrations/20260821000001_phase7_rbac_workflow_schema.sql

echo "Database initialization completed successfully!"
