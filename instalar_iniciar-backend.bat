@echo off
echo Iniciando el backend de AISG...
echo.

echo ========================================
echo Reinstalando dependencias...
echo ========================================

REM Eliminar entorno virtual si existe
if exist venv (
    echo Eliminando entorno virtual actual...
    rmdir /s /q venv
    echo Entorno virtual eliminado.
)

REM Crear nuevo entorno virtual
echo Creando nuevo entorno virtual...
python -m venv venv

REM Activar entorno virtual
call venv\Scripts\activate.bat
echo Entorno virtual activado.

REM Actualizar pip
echo Actualizando pip...
python -m pip install --upgrade pip

REM Instalar dependencias
echo Instalando dependencias...
pip install -r requirements.txt
echo Dependencias instaladas correctamente.
echo.

echo ========================================
echo Iniciando servidor FastAPI en segundo plano...
echo ========================================
echo El servidor estará disponible en: http://localhost:8000
echo Para acceder a la documentación: http://localhost:8000/docs
echo.
echo Se ha abierto una nueva ventana con el servidor.
echo Puedes seguir usando esta consola.
echo.

REM Iniciar la aplicación con uvicorn en una nueva ventana
start "FastAPI Server" cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Servidor iniciado en segundo plano.