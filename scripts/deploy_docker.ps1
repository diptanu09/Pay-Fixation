# PowerShell script to deploy updated Pay-Fixation Docker stack
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Deploying Pay-Fixation Stack to Docker" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ComposeFile = "docker/docker-compose.yml"
if (-not (Test-Path $ComposeFile)) {
    $ComposeFile = "docker-compose.yml"
}

Write-Host "`n[1/3] Building & Launching Containers..." -ForegroundColor Yellow
docker compose -f $ComposeFile up -d --build

Write-Host "`n[2/3] Checking Running Containers..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
docker compose -f $ComposeFile ps

Write-Host "`n[3/3] Verifying SAI Pension Oracle 12c Lookup Endpoint..." -ForegroundColor Yellow
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8085/api/v1/sai-pension/lookup?application_no=APP-2026-8812" -Method Get
    if ($res.success -eq $true) {
        Write-Host "  [+] Success! SAI Pension lookup active: $($res.data.name) ($($res.data.designation))" -ForegroundColor Green
    } else {
        Write-Host "  [-] Lookup response invalid." -ForegroundColor Red
    }
} catch {
    Write-Host "  [!] Endpoint verification pending. Check logs: docker compose -f $ComposeFile logs -f" -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Deployment Complete!" -ForegroundColor Green
Write-Host " Web UI: http://localhost:5173" -ForegroundColor Green
Write-Host " API Engine: http://localhost:8085" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
