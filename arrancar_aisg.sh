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

# Levanta backend (FastAPI) con nohup para mantenerlo en ejecución
echo "Activando backend (FastAPI)..."
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend iniciado con PID: $BACKEND_PID"
cd ..

# Construir frontend siempre
cd frontend
echo "Instalando dependencias de frontend..."
npm install

echo "Compilando frontend (build)..."
npm run build

# Levanta frontend (Vite Preview) con nohup para mantenerlo en ejecución
echo "Activando frontend (Vite Preview)..."
nohup npm run preview -- --host > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend iniciado con PID: $FRONTEND_PID"
cd ..

# Desvincula los procesos de la sesión actual
disown $BACKEND_PID
disown $FRONTEND_PID

# Mensaje final
echo "=============================="
echo "AISG levantado correctamente"
echo "Backend: http://82.165.213.124:8000/docs"
echo "Frontend: http://82.165.213.124:4173/"
echo "Logs: backend.log y frontend/frontend.log"
echo "Los servicios continuarán ejecutándose aunque cierres la sesión"
echo "=============================="