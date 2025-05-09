#!/bin/bash

# AISG Auto Launcher for Linux (Debian/Ubuntu)
echo "=============================="
echo "  INICIANDO AISG EN LINUX"
echo "=============================="

# Levanta backend (FastAPI)
echo "Activando backend (FastAPI)..."
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
cd ..

# Construir frontend si no existe dist
if [ ! -d "frontend/dist" ]; then
    echo "Compilando frontend (build)..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Levanta frontend (Vite Preview)
echo "Activando frontend (Vite Preview)..."
cd frontend
npm run preview -- --host

# Mensaje final
echo "=============================="
echo "AISG levantado correctamente"
echo "Backend: http://82.165.213.124:8000/docs"
echo "Frontend: http://82.165.213.124:4173/"
echo "=============================="
