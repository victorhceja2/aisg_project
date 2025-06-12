@echo off
title AISG Backend + Frontend Launcher
setlocal enabledelayedexpansion

REM --------------------------------------------------------
REM  1. RUTAS
REM --------------------------------------------------------
set "BASE_DIR=%~dp0"
set "BACKEND_DIR=%BASE_DIR%backend"
set "FRONTEND_DIR=%BASE_DIR%frontend"

REM --------------------------------------------------------
REM  2. LIMPIAR PROCESOS COLGADOS
REM --------------------------------------------------------
echo ================================
echo  LIMPIANDO PROCESOS
echo ================================
for %%P in (uvicorn.exe python.exe node.exe) do (
    taskkill /IM %%P /F >nul 2>&1
)

REM --------------------------------------------------------
REM  3. COMPROBAR CARPETAS
REM --------------------------------------------------------
echo ================================
echo  VERIFICANDO ENTORNO
echo ================================
if not exist "!BACKEND_DIR!" (
    echo ERROR: No se encontró la carpeta "backend"
    goto error
)
if not exist "!FRONTEND_DIR!" (
    echo ERROR: No se encontró la carpeta "frontend"
    goto error
)

REM --------------------------------------------------------
REM  4. FRONTEND: npm install
REM --------------------------------------------------------
echo ================================
echo  ACTUALIZANDO DEPENDENCIAS (FRONTEND)
echo ================================
pushd "!FRONTEND_DIR!"
call npm install
popd

REM --------------------------------------------------------
REM  5. BACKEND: venv + pip install
REM --------------------------------------------------------
echo ================================
echo  ACTUALIZANDO DEPENDENCIAS (BACKEND)
echo ================================
pushd "!BACKEND_DIR!"
if not exist venv (
    echo Creando entorno virtual...
    python -m venv venv
)
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
REM Dejamos el venv **activo** para que la ventana hija lo herede

REM --------------------------------------------------------
REM  6. LANZAR SERVIDORES EN SUS VENTANAS
REM --------------------------------------------------------
echo ================================
echo  INICIANDO SERVICIOS
echo ================================
REM --- Backend ---
echo Iniciando FastAPI en una ventana aparte...
start "Backend - FastAPI" "%ComSpec%" /k ^
    "title Backend - FastAPI && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM --- Frontend ---
echo Iniciando Vite en una ventana aparte...
pushd "!FRONTEND_DIR!"
start "Frontend - Vite" "%ComSpec%" /k ^
    "title Frontend - Vite && npm run dev -- --host"
popd

REM Podemos desactivar el venv en la ventana principal si quieres
deactivate
popd

REM --------------------------------------------------------
REM  7. MENSAJE FINAL
REM --------------------------------------------------------
echo ================================
echo Todo encendido correctamente.
echo Accede desde tu Mac:
echo   http://66.179.95.14:8000/ping
echo   http://66.179.95.14:5173/
echo ================================
pause
exit /b 0

:error
echo.
echo ¡Error al iniciar servicios!
pause
exit /b 1
