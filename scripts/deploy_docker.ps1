# PowerShell script to deploy stack via Docker Compose
Write-Host "Building and launching Docker containers..." -ForegroundColor Green
docker compose -f docker/docker-compose.yml up -d --build
