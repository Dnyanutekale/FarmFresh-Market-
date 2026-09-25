# FarmFresh Market - PowerShell Startup Script
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🌿 FarmFresh Market - Starting Services" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = Get-Location

# 1. Backend Setup
Write-Host "[1/4] Setting up Python virtual environment..." -ForegroundColor Cyan
Set-Location "$rootDir\backend"

if (-not (Test-Path "venv")) {
    Write-Host "Creating Python venv..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "[2/4] Installing Python dependencies..." -ForegroundColor Cyan
& ".\venv\Scripts\pip.exe" install -r requirements.txt -q

Write-Host "[3/4] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# 2. Frontend Setup
Set-Location "$rootDir\frontend"
Write-Host "[4/4] Launching React Frontend on http://localhost:5173..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; npm run dev"

Set-Location $rootDir

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "  🌿 FarmFresh Market is up and running!" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host "  🚀 Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "  📖 API Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  Demo Credentials (Password: Pass123!):" -ForegroundColor White
Write-Host "  - Admin:    admin@farmfresh.com" -ForegroundColor Gray
Write-Host "  - Farmer:   farmer.ramesh@farmfresh.com" -ForegroundColor Gray
Write-Host "  - Customer: customer@example.com" -ForegroundColor Gray
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
