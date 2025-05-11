#!/bin/bash

# Script para matar todos los procesos de uvicorn y npm
echo "=============================="
echo "  DETENIENDO PROCESOS AISG"
echo "=============================="

# Matar procesos de uvicorn
echo "Deteniendo procesos de backend (uvicorn)..."
pkill -f uvicorn

# Matar procesos de npm
echo "Deteniendo procesos de frontend (npm)..."
pkill -f npm

# Verificar que los procesos han sido terminados
sleep 2
RUNNING_PROCS=$(ps aux | grep -E 'uvicorn|npm' | grep -v grep)

if [ -z "$RUNNING_PROCS" ]; then
  echo "=============================="
  echo "Todos los procesos detenidos correctamente"
  echo "=============================="
else
  echo "=============================="
  echo "ADVERTENCIA: Algunos procesos todavía están en ejecución:"
  echo "$RUNNING_PROCS"
  echo ""
  echo "Intentando forzar terminación..."
  pkill -9 -f uvicorn
  pkill -9 -f npm
  echo "=============================="
fi

for PORT in 8000 4174; do
  PID=$(sudo lsof -t -i:$PORT)
  if [ -n "$PID" ]; then
    echo "Matando proceso en el puerto $PORT con PID $PID..."
    sudo kill -9 $PID
  fi
done

# Verificar puertos
echo "Verificando puertos 8000 y 4174..."
netstat -tuln | grep -E '8000|4174' || echo "Puertos liberados correctamente."
