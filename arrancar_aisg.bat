@echo off
title AISG Backend + Frontend Launcher
cd /d %~dp0

echo ================================
echo  ACTIVANDO BACKEND (FASTAPI)
echo ================================
cd backend
call venv\Scripts\activate
start "FastAPI Server" cmd /k uvicorn main:app --host 0.0.0.0 --port 8000 --reload
cd ..

echo ================================
echo  ACTIVANDO FRONTEND (VITE)
echo ================================
cd frontend
start "Vite Frontend" cmd /k npm run dev -- --host

echo ================================
echo Todo encendido correctamente.
echo Puedes acceder desde tu Mac:
echo http://66.179.95.14:8000/ping
echo http://66.179.95.14:5173/
echo ================================