#!/bin/bash

echo "=============================="
echo "  ACTIVANDO BACKEND (FASTAPI)"
echo "=============================="
cd backend || exit
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
cd ..

echo "=============================="
echo "  ACTIVANDO FRONTEND (VITE)"
echo "=============================="
cd frontend || exit
npm run dev -- --host &

echo "=============================="
echo "Todo encendido correctamente."
echo "Puedes acceder desde tu Mac:"
echo "http://localhost:8000/docs"
echo "http://localhost:5173/"
echo "=============================="