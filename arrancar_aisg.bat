@echo off
title AISG Backend + Frontend Launcher
cd /d %~dp0

echo ================================
echo COMPILANDO FRONTEND (PRODUCCIÓN)
echo ================================
cd frontend
call npm install
call npm run build
cd ..

echo ================================
echo ACTIVANDO BACKEND (FASTAPI)
echo ================================
cd backend
call venv\Scripts\activate
start "FastAPI Server" cmd /k uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
cd ..

echo ================================
echo ACTIVANDO FRONTEND (VITE STATIC)
echo ================================
cd frontend
start "Vite Frontend" cmd /k npm run preview -- --host

echo ================================
echo Todo encendido correctamente.
echo Accede desde otro dispositivo:
echo http://66.179.95.14:8000/docs
echo http://66.179.95.14:4173/
echo ================================