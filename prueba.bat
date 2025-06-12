@echo off
setlocal enabledelayedexpansion

REM Establecer puerto predeterminado
set PUERTO=8000

REM Comprobar si se ha especificado un puerto como parámetro
if not "%1"=="" (
    set PUERTO=%1
)

echo Iniciando el backend de AISG en puerto !PUERTO!...
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
echo El servidor estará disponible en: http://localhost:!PUERTO!
echo Para acceder a la documentación: http://localhost:!PUERTO!/docs
echo.
echo Se ha abierto una nueva ventana con el servidor.
echo Puedes seguir usando esta consola.
echo.

REM Iniciar la aplicación con uvicorn en una nueva ventana (incluyendo el puerto en el título)
start "FastAPI Server PORT-!PUERTO!" cmd /k "call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port !PUERTO!"

echo Servidor iniciado en segundo plano en puerto !PUERTO!.
endlocal