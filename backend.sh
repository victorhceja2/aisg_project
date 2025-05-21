#!/bin/bash

# Script para reinstalar completamente el backend
echo "=============================="
echo "  REINICIANDO BACKEND AISG"
echo "=============================="

# Detener procesos previos de uvicorn
echo "Deteniendo procesos previos..."
pkill -f uvicorn || echo "No hay procesos de uvicorn ejecutándose"

# Eliminar entorno virtual anterior
echo "Eliminando entorno virtual anterior..."
rm -rf backend/venv

# Eliminar archivos de caché
echo "Limpiando archivos de caché Python..."
find . -name "__pycache__" -type d -exec rm -rf {} +
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete
find . -name "*.pyd" -delete

# Crear nuevo entorno virtual
echo "Creando nuevo entorno virtual..."
python3 -m venv backend/venv

# Activar entorno virtual e instalar dependencias
cd backend
source venv/bin/activate

# Actualizar pip
echo "Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
echo "Instalando dependencias de backend..."
pip install -r requirements.txt

# Comprobar la instalación de componentes críticos
echo "Verificando instalación de componentes críticos..."
pip list | grep "fastapi\|uvicorn\|sqlalchemy\|pyodbc"

# Comprobar la conectividad a la base de datos
echo "Comprobando conectividad con la base de datos..."
python -c "
import pyodbc
try:
    conn = pyodbc.connect(
        'Driver={ODBC Driver 17 for SQL Server};'
        'Server=66.179.95.14;'
        'Database=aisgProduction;'
        'UID=sa;'
        'PWD=Vic1973;'
        'TrustServerCertificate=yes;'
    )
    cursor = conn.cursor()
    cursor.execute('SELECT 1')
    print('✅ Conexión a la base de datos exitosa')
    conn.close()
except Exception as e:
    print(f'❌ Error de conexión a la base de datos: {e}')
"

# Verificar driver ODBC
echo "Verificando driver ODBC..."
odbcinst -j

# Volver al directorio raíz
cd ..

echo "=============================="
echo "Instalación completada. Para iniciar el backend ejecuta:"
echo "cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo "=============================="

# Preguntar si desea iniciar el backend ahora
echo "¿Deseas iniciar el backend ahora? (s/n)"
read -r iniciar_backend

if [[ "$iniciar_backend" =~ ^[Ss]$ ]]; then
    echo "Iniciando backend..."
    cd backend
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Puedes iniciar el backend manualmente cuando estés listo."
fi