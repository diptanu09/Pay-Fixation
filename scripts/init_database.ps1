# PowerShell script to initialize PostgreSQL Pay-Fixation database and apply migrations
Write-Host "Creating database Pay-Fixation..." -ForegroundColor Green
docker run --rm -v "${PWD}:/workspace" -e PGPASSWORD="root@123" postgres:alpine psql -h host.docker.internal -U postgres -f /workspace/migrations/00_create_db.sql

Write-Host "Applying initial schema migration..." -ForegroundColor Green
docker run --rm -v "${PWD}:/workspace" -e PGPASSWORD="root@123" postgres:alpine psql -h host.docker.internal -U postgres -d "Pay-Fixation" -f /workspace/migrations/20260821000000_init_payfix_schema.sql

Write-Host "Applying Phase 7 RBAC workflow migration..." -ForegroundColor Green
docker run --rm -v "${PWD}:/workspace" -e PGPASSWORD="root@123" postgres:alpine psql -h host.docker.internal -U postgres -d "Pay-Fixation" -f /workspace/migrations/20260821000001_phase7_rbac_workflow_schema.sql

Write-Host "Database initialization completed successfully!" -ForegroundColor Cyan
