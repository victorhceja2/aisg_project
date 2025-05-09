#!/bin/bash

echo "==============================="
echo "  ACTIVANDO BACKEND (FASTAPI)"
echo "==============================="

cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
cd ..

echo "==============================="
echo "  ACTIVANDO FRONTEND (VITE)"
echo "==============================="

cd frontend
npm install
npm run dev -- --host &
cd ..

echo "==============================="
echo "  TODO ENCENDIDO CORRECTAMENTE"
echo "  BACKEND: http://82.165.213.124:8000/docs"
echo "  FRONTEND: http://82.165.213.124:5173/"
echo "==============================="