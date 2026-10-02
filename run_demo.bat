@echo off
echo ========================================================
echo   BAGHETWIN: WELL-TO-SURFACE DIGITAL TWIN (SIH 2026)
echo   Local Demo Launcher
echo ========================================================
echo.

echo [1/3] Verifying and Seeding Database...
python backend\scripts\seed_demo.py
if %ERRORLEVEL% NEQ 0 (
    echo Error during seeding. Exiting.
    exit /b %ERRORLEVEL%
)

echo [2/3] Starting Backend API Server (FastAPI on Port 8000)...
start "BagheTwin Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/3] Starting Frontend Control Room (Vite on Port 5173)...
start "BagheTwin Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   BagheTwin is now launching!
echo   - Backend Swagger Docs: http://127.0.0.1:8000/docs
echo   - Frontend Control Room: http://localhost:5173
echo ========================================================
echo.
pause
