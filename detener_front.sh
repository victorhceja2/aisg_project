#!/bin/bash
# filepath: detener_front.sh

# Configura el mismo puerto que usaste en iniciar_front.sh
PORT=5173

echo "===== DETENIENDO SERVIDOR FRONTEND (PUERTO $PORT) ====="
echo

echo "Forzando la detención de todos los procesos relacionados..."

# Intentar primero detener usando el archivo PID si existe
PID_FILE=".frontend.pid"
if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    if ps -p $PID > /dev/null; then
        echo "Terminando proceso con PID: $PID"
        kill -9 $PID && echo "Proceso terminado con éxito"
        
        # Eliminar archivo PID después de matar el proceso
        rm $PID_FILE
    else
        echo "No se encontró proceso con PID: $PID"
        rm $PID_FILE
    fi
fi

# Detener nodemon
echo "Buscando y deteniendo procesos nodemon..."
pids=$(ps aux | grep nodemon | grep -v grep | awk '{print $2}')
if [ -n "$pids" ]; then
    echo "Terminando procesos nodemon: $pids"
    kill -9 $pids 2>/dev/null
fi

# Detener procesos específicamente en el puerto configurado
echo "Liberando puerto $PORT..."
pids=$(lsof -t -i:$PORT 2>/dev/null)
if [ -n "$pids" ]; then
    echo "Terminando proceso en puerto $PORT: $pids"
    kill -9 $pids 2>/dev/null
fi

# Liberar también otros puertos comunes por si acaso
echo "Verificando otros puertos comunes de desarrollo..."
for other_port in 3000 8080 4000 4173; do
    if [ "$other_port" != "$PORT" ]; then
        pids=$(lsof -t -i:$other_port 2>/dev/null)
        if [ -n "$pids" ]; then
            echo "Terminando proceso en puerto $other_port: $pids"
            kill -9 $pids 2>/dev/null
        fi
    fi
done

echo
echo "Servidor frontend detenido."
echo "Todos los procesos relacionados han sido terminados."
echo