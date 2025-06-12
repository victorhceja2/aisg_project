@echo off
echo Deteniendo el backend de AISG...
echo.

echo ========================================
echo Buscando procesos del servidor...
echo ========================================

REM Buscar y matar procesos de uvicorn/Python relacionados con FastAPI
echo Deteniendo procesos de servidor FastAPI...
taskkill /FI "WINDOWTITLE eq FastAPI Server*" /T /F 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Ventana del servidor cerrada exitosamente.
) else (
    echo No se encontró la ventana del servidor o ya estaba cerrada.
)

REM Buscar procesos de Python/uvicorn por si acaso y terminarlos
echo Comprobando procesos adicionales...
taskkill /FI "IMAGENAME eq uvicorn.exe" /F 2>nul
taskkill /FI "COMMANDLINE eq *uvicorn app.main:app*" /F 2>nul

echo.
echo ========================================
echo Limpieza completa
echo ========================================

echo El servidor ha sido detenido.
echo.
pause