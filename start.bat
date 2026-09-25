@echo off
echo ========================================
echo   🌿 FarmFresh Market - Starting Services
echo ========================================
echo.

echo [1/4] Setting up Python virtual environment...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt -q

echo [3/4] Starting FastAPI Backend on http://localhost:8000 ...
start "FarmFresh Backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
cd ..

echo [4/4] Starting React Frontend on http://localhost:5173 ...
cd frontend
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)
start "FarmFresh Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ====================================================
echo   🌿 FarmFresh Market is up and running!
echo.
echo   🌐 Frontend:     http://localhost:5173
echo   🚀 Backend API:  http://localhost:8000
echo   📖 API Docs:     http://localhost:8000/docs
echo.
echo   Demo Credentials (Password: Pass123!):
echo   - Admin:    admin@farmfresh.com
echo   - Farmer:   farmer.ramesh@farmfresh.com
echo   - Customer: customer@example.com
echo ====================================================
echo.
pause
