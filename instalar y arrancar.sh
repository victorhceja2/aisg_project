#!/bin/bash
# filepath: c:\Users\skyho\OneDrive\Documentos\aisg_project-1\instalar y arrancar.sh

echo "===== INICIANDO PROYECTO ====="
echo

# Eliminar dependencias existentes
echo "Eliminando dependencias existentes..."
if [ -d "node_modules" ]; then
    rm -rf "node_modules"
    echo "Carpeta node_modules eliminada."
fi

if [ -f "package-lock.json" ]; then
    rm -f "package-lock.json"
    echo "Archivo package-lock.json eliminado."
fi

echo
echo "Instalando dependencias nuevas..."
npm install

# Instalar nodemon para el reinicio automático
echo
echo "Instalando nodemon para reinicio automático..."
npm install -g nodemon

echo
echo "===== INICIANDO SERVIDOR CON AUTO-REINICIO ====="
echo

# Crear archivo para almacenar el PID
PID_FILE=".frontend.pid"

# Iniciar el servidor en segundo plano con nodemon para auto-reinicio
echo "Iniciando servidor con auto-reinicio en segundo plano..."
nohup bash -c "cd '$(pwd)' && nodemon --watch src --watch public --ext js,jsx,ts,tsx,css,html,json --exec 'npm run dev'" > frontend.log 2>&1 &

# Guardar el PID para poder detenerlo más tarde
echo $! > $PID_FILE

echo
echo "El servidor se ha iniciado en segundo plano con PID: $(cat $PID_FILE)"
echo "El servidor se reiniciará automáticamente cuando detecte cambios en el código."
echo "Logs disponibles en: $(pwd)/frontend.log"
echo "Para ver los logs en tiempo real ejecute: tail -f frontend.log"
echo "Para detener el servidor ejecute: ./detener_front.sh"
echo
echo "IMPORTANTE: El servidor está ejecutándose en segundo plano con auto-reinicio."
echo "Puedes acceder a él desde tu navegador."
echo