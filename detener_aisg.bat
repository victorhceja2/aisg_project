@echo off
title AISG Backend + Frontend Terminator
color 0C

echo ================================
echo  DETENIENDO PROCESOS DE AISG
echo ================================

REM --------------------------------------------------------------------
REM  1. DETENER FASTAPI (puerto 8000)
REM --------------------------------------------------------------------
echo.
echo Deteniendo servidor FastAPI (puerto 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo   Terminando proceso con PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM --------------------------------------------------------------------
REM  2. DETENER VITE (puerto 5173)
REM --------------------------------------------------------------------
echo.
echo Deteniendo servidor Vite (puerto 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo   Terminando proceso con PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM --------------------------------------------------------------------
REM  3. CERRAR VENTANAS DE TERMINAL
REM --------------------------------------------------------------------
echo.
echo Cerrando ventanas de terminal relacionadas...
REM  Títulos del script original
taskkill /F /FI "WINDOWTITLE eq FastAPI Server*"   >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Vite Frontend*"    >nul 2>&1
REM  Títulos del script nuevo
taskkill /F /FI "WINDOWTITLE eq Backend - FastAPI*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend - Vite*"   >nul 2>&1
REM  Patrón genérico por si cambian los títulos en el futuro
taskkill /F /FI "WINDOWTITLE eq *FastAPI*"         >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *Vite*"            >nul 2>&1

echo.
echo ================================
echo  Todos los procesos han sido detenidos
echo ================================
pause
exit /b 0