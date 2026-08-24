# PowerShell script to launch API Engine and Web Frontend natively
$env:PORT = "8085"
Write-Host "Starting PAYFIX API Engine on port 8085..." -ForegroundColor Green
Start-Process -FilePath "cargo" -ArgumentList "run --bin payfix-api" -NoNewWindow

Write-Host "Starting PAYFIX Web Frontend on port 5173..." -ForegroundColor Green
Set-Location -Path "apps/web"
npm run dev
