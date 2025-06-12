#!/bin/bash

# Script para detener solo los procesos del proyecto AISG
echo "=============================="
echo "  DETENIENDO PROCESOS AISG"
echo "=============================="

# Función para forzar el cierre de procesos por nombre con mayor especificidad
forzar_cierre_especifico() {
  local nombre="$1"
  local descripcion="$2"
  echo "Deteniendo $descripcion..."
  
  # Buscar procesos específicos
  local pids=$(pgrep -f "$nombre")
  if [ -n "$pids" ]; then
    echo "Encontrados PIDs: $pids"
    kill $pids 2>/dev/null
    sleep 2
    
    # Verificar si aún están corriendo
    local restantes=$(pgrep -f "$nombre")
    if [ -n "$restantes" ]; then
      echo "Forzando cierre de $descripcion..."
      kill -9 $restantes 2>/dev/null
      sleep 1
    fi
    echo "$descripcion detenido correctamente."
  else
    echo "$descripcion no está corriendo."
  fi
}

# Detener uvicorn específicamente del proyecto AISG
forzar_cierre_especifico "uvicorn.*aisg" "Backend FastAPI (uvicorn con aisg)"

# También buscar uvicorn en general en el puerto 8100
echo "Buscando uvicorn en puerto 8100..."
UVICORN_PIDS=$(ps aux | grep uvicorn | grep -v grep | awk '{print $2}')
if [ -n "$UVICORN_PIDS" ]; then
  echo "Encontrados procesos uvicorn: $UVICORN_PIDS"
  kill $UVICORN_PIDS 2>/dev/null
  sleep 2
  kill -9 $UVICORN_PIDS 2>/dev/null
fi

# Detener procesos npm específicos del directorio del proyecto
echo "Buscando procesos npm del proyecto AISG..."
PROJECT_DIR="/root/aisg_project"

# Encontrar procesos npm que corren desde el directorio del proyecto
NPM_PIDS=$(ps aux | grep npm | grep "$PROJECT_DIR" | grep -v grep | awk '{print $2}')
if [ -n "$NPM_PIDS" ]; then
  echo "Deteniendo procesos npm del proyecto: $NPM_PIDS"
  kill $NPM_PIDS 2>/dev/null
  sleep 2
  kill -9 $NPM_PIDS 2>/dev/null
fi

# Encontrar procesos node específicos del proyecto
NODE_PIDS=$(ps aux | grep node | grep -E "(aisg_project|vite.*frontend)" | grep -v grep | awk '{print $2}')
if [ -n "$NODE_PIDS" ]; then
  echo "Deteniendo procesos Node.js del proyecto: $NODE_PIDS"
  kill $NODE_PIDS 2>/dev/null
  sleep 2
  kill -9 $NODE_PIDS 2>/dev/null
fi

# Liberar puertos específicos del proyecto (más agresivo)
for PORT in 8100 5100 3000 5173; do
  echo "Revisando puerto $PORT..."
  PID=$(lsof -t -i:$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    # Verificar si el proceso pertenece al proyecto o es uvicorn/node/npm
    PROCESS_INFO=$(ps -p $PID -o cmd= 2>/dev/null)
    echo "Proceso en puerto $PORT: $PROCESS_INFO"
    
    # Ser más agresivo con uvicorn, node, npm y procesos relacionados
    if [[ "$PROCESS_INFO" == *"aisg"* ]] || [[ "$PROCESS_INFO" == *"uvicorn"* ]] || [[ "$PROCESS_INFO" == *"vite"* ]] || [[ "$PROCESS_INFO" == *"npm"* ]] || [[ "$PROCESS_INFO" == *"node"* ]]; then
      echo "Puerto $PORT en uso por proceso del proyecto (PID $PID). Liberando..."
      kill -9 $PID 2>/dev/null
      sleep 1
      
      # Verificar si se liberó
      NEW_PID=$(lsof -t -i:$PORT 2>/dev/null)
      if [ -n "$NEW_PID" ]; then
        echo "Puerto $PORT aún ocupado. Forzando cierre más agresivo..."
        kill -9 $NEW_PID 2>/dev/null
      fi
    else
      echo "Puerto $PORT en uso por proceso del sistema. No se toca."
    fi
  else
    echo "Puerto $PORT libre."
  fi
done

# Búsqueda adicional de procesos Python que puedan ser el backend
echo "Buscando procesos Python relacionados con el proyecto..."
PYTHON_PIDS=$(ps aux | grep python | grep -E "(aisg|uvicorn)" | grep -v grep | awk '{print $2}')
if [ -n "$PYTHON_PIDS" ]; then
  echo "Deteniendo procesos Python del proyecto: $PYTHON_PIDS"
  kill $PYTHON_PIDS 2>/dev/null
  sleep 2
  kill -9 $PYTHON_PIDS 2>/dev/null
fi

# Verificación final específica del proyecto
echo "=============================="
echo "Verificando procesos del proyecto AISG..."
AISG_PROCESSES=$(ps aux | grep -E "(uvicorn|npm.*aisg_project|node.*aisg_project|vite.*frontend|python.*aisg)" | grep -v grep | grep -v "detener_aisg")
if [ -n "$AISG_PROCESSES" ]; then
  echo "⚠️  Procesos del proyecto AISG aún en ejecución:"
  echo "$AISG_PROCESSES"
else
  echo "✅ No hay procesos del proyecto AISG en ejecución."
fi

# Verificar puertos específicos del proyecto
echo "=============================="
echo "Verificando puertos del proyecto (8100, 5100, 3000, 5173)..."
PROJECT_PORTS=$(netstat -tuln 2>/dev/null | grep -E '(:8100|:5100|:3000|:5173)')
if [ -n "$PROJECT_PORTS" ]; then
  echo "⚠️  Puertos del proyecto aún ocupados:"
  echo "$PROJECT_PORTS"
  
  # Si el puerto 8100 sigue ocupado, forzar cierre
  if netstat -tuln 2>/dev/null | grep -q ':8100'; then
    echo "Forzando liberación del puerto 8100..."
    PID_8100=$(lsof -t -i:8100 2>/dev/null)
    if [ -n "$PID_8100" ]; then
      echo "Matando proceso en puerto 8100: PID $PID_8100"
      kill -9 $PID_8100 2>/dev/null
    fi
  fi
else
  echo "✅ Todos los puertos del proyecto liberados."
fi

echo "=============================="
echo "✅ Script completado - Solo procesos AISG detenidos."