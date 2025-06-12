#!/bin/bash
# filepath: c:\Users\skyho\OneDrive\Documentos\aisg_project-1\iniciar_front.sh

echo "===== INICIANDO SERVIDOR FRONTEND ====="
echo

# Verificar si nodemon está instalado, instalarlo si no lo está
if ! command -v nodemon &> /dev/null; then
    echo "Instalando nodemon globalmente..."
    npm install -g nodemon
fi

# Crear archivo para almacenar el PID
PID_FILE=".frontend.pid"

# Iniciar el servidor en segundo plano con nodemon para auto-reinicio
echo "Iniciando servidor frontend con auto-reinicio en segundo plano..."
nohup bash -c "cd '$(pwd)' && nodemon --watch src --watch public --ext js,jsx,ts,tsx,css,html,json --exec 'npm run dev'" > frontend.log 2>&1 &

# Guardar el PID para poder detenerlo más tarde
echo $! > $PID_FILE

echo
echo "El servidor frontend se ha iniciado en segundo plano con PID: $(cat $PID_FILE)"
echo "El servidor se reiniciará automáticamente cuando detecte cambios en el código."
echo "Logs disponibles en: $(pwd)/frontend.log"
echo "Para ver los logs en tiempo real ejecute: tail -f frontend.log"
echo "Para detener el servidor ejecute: ./detener_front.sh"
echo