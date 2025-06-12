#!/bin/bash
echo "Iniciando el backend de AISG..."
echo

echo "========================================"
echo "Reinstalando dependencias..."
echo "========================================"

# Eliminar entorno virtual si existe
if [ -d "venv" ]; then
    echo "Eliminando entorno virtual actual..."
    rm -rf venv
    echo "Entorno virtual eliminado."
fi

# Crear nuevo entorno virtual
echo "Creando nuevo entorno virtual..."
python3 -m venv venv

# Activar entorno virtual
echo "Activando entorno virtual..."
source venv/bin/activate
echo "Entorno virtual activado."

# Actualizar pip
echo "Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
echo "Instalando dependencias..."
pip install -r requirements.txt
echo "Dependencias instaladas correctamente."
echo

echo "========================================"
echo "Iniciando servidor FastAPI en segundo plano..."
echo "========================================"
echo "El servidor estará disponible en: http://localhost:8000"
echo "Para acceder a la documentación: http://localhost:8000/docs"
echo
echo "El servidor se ejecutará en segundo plano."
echo "Puedes seguir usando esta consola."
echo

# Iniciar la aplicación con uvicorn en segundo plano
nohup venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > server.log 2>&1 &
SERVER_PID=$!

echo "Servidor iniciado en segundo plano (PID: $SERVER_PID)."
echo "Los logs del servidor se guardarán en server.log"
echo
echo "Para detener el servidor, ejecuta: kill $SERVER_PID"