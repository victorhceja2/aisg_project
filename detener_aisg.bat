@echo off
title AISG Backend + Frontend Terminator
color 0C

echo ================================
echo  DETENIENDO PROCESOS DE AISG
echo ================================

echo Deteniendo servidor FastAPI (puerto 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Terminando proceso con PID: %%a
    taskkill /F /PID %%a 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Servidor FastAPI detenido correctamente.
    ) else (
        echo No se encontró servidor FastAPI en ejecución.
    )
)

echo Deteniendo servidor Vite (puerto 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Terminando proceso con PID: %%a
    taskkill /F /PID %%a 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Servidor Vite detenido correctamente.
    ) else (
        echo No se encontró servidor Vite en ejecución.
    )
)

echo Cerrando ventanas de terminal relacionadas...
taskkill /F /FI "WINDOWTITLE eq FastAPI Server*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Vite Frontend*" 2>nul

echo ================================
echo  Todos los procesos han sido detenidos
echo ================================

pause