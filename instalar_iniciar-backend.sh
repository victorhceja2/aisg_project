#!/bin/bash
# filepath: c:\Users\skyho\OneDrive\Documentos\aisg_project-backend\instalar_iniciar-backend.sh

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

# Iniciar la aplicación con uvicorn en segundo plano
echo "Iniciando servidor..."
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > server.log 2>&1 &
echo "Servidor iniciado en segundo plano. Logs en server.log"
echo "Puedes continuar usando esta terminal."