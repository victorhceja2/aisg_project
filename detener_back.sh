#!/bin/bash
# filepath: c:\Users\skyho\OneDrive\Documentos\aisg_project-backend\iniciar_backend.sh

echo "Iniciando el backend de AISG..."
echo

# Comprobar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "Error: No se encontró el entorno virtual 'venv'."
    echo "Por favor, ejecuta primero 'instalar_iniciar-backend.sh'"
    exit 1
fi

# Activar entorno virtual
echo "Activando entorno virtual..."
source venv/bin/activate

echo "========================================"
echo "Iniciando servidor FastAPI con modo de recarga automática..."
echo "========================================"
echo "El servidor estará disponible en: http://localhost:8000"
echo "Para acceder a la documentación: http://localhost:8000/docs"
echo "El servidor se reiniciará automáticamente cuando detecte cambios en el código."
echo

# Iniciar la aplicación con uvicorn con la opción --reload
echo "Iniciando servidor..."
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > server.log 2>&1 &
echo "Servidor iniciado en segundo plano. Logs en server.log"
echo "Puedes continuar usando esta terminal."