# BagheTwin: Well-to-Surface Digital Twin Demo Launcher (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  BAGHETWIN: WELL-TO-SURFACE DIGITAL TWIN (SIH 2026)" -ForegroundColor Green
Write-Host "  Starting local development servers..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Ensuring Database is Seeded..." -ForegroundColor Yellow
python backend/scripts/seed_demo.py

Write-Host "`n[2/3] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "`n[3/3] Launching React Control Room on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  System running!" -ForegroundColor Green
Write-Host "  • Backend Swagger: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "  • Frontend UI:     http://localhost:5173" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green
