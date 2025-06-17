#!/bin/bash

# AISG Auto Launcher for Linux (Debian/Ubuntu)
echo "=============================="
echo "  INICIANDO AISG EN LINUX"
echo "=============================="

# Crear entorno virtual si no existe
if [ ! -d "backend/venv" ]; then
  echo "Creando entorno virtual para backend..."
  python3 -m venv backend/venv
fi

# Activar entorno virtual e instalar dependencias
cd backend
source venv/bin/activate
echo "Instalando dependencias de backend..."
pip install -r requirements.txt

# Levanta backend (FastAPI)
echo "Activando backend (FastAPI)..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
cd ..

# Construir frontend siempre
cd frontend
echo "Instalando dependencias de frontend..."
npm install

echo "Compilando frontend (build)..."
npm run build

# Levanta frontend (Vite Preview)
echo "Activando frontend (Vite Preview)..."
npm run preview -- --host &
cd ..

# Mensaje final
echo "=============================="
echo "AISG levantado correctamente"
echo "Backend: http://82.165.213.124:8000/docs"
echo "Frontend: http://82.165.213.124:4173/"
echo "=============================="
