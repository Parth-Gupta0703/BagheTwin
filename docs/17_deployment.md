# 17 — Deployment & Run Guide

## 1. Local Demo Mode (Windows / macOS / Linux)

### Prerequisites
* Python 3.11+
* Node.js v18+ & npm

### Execution Options

#### Option A: One-Click Windows Script
```cmd
run_demo.bat
```
Or PowerShell:
```powershell
.\run_demo.ps1
```

#### Option B: Manual Terminal Execution

**Terminal 1 — Backend API:**
```bash
# Optional virtualenv
python backend/scripts/seed_demo.py
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be accessible at: `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend Control Room:**
```bash
cd frontend
npm install
npm run dev
```
Control Room UI will be accessible at: `http://localhost:5173`

---

## 2. Docker Compose Deployment (Production Configuration)
```bash
docker compose up --build
```
* **PostgreSQL Database:** Port 5432
* **FastAPI Backend:** Port 8000
* **Nginx React Frontend:** Port 5173
