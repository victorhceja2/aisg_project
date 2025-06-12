@echo off
REM filepath: c:\Users\skyho\OneDrive\Documentos\aisg_project-backend\detener_backend.bat

echo Deteniendo el backend de AISG...
echo.

echo ========================================
echo DETENIENDO PROCESOS UVICORN
echo ========================================

REM Enfoque 1: Terminar procesos por título de ventana
echo Buscando ventanas de CMD con uvicorn...
taskkill /F /FI "WINDOWTITLE eq uvicorn*" 2>nul

REM Enfoque 2: Terminar procesos Python
echo Verificando procesos Python...
tasklist /FI "IMAGENAME eq python.exe" /FO TABLE

REM Enfoque 3: Matar procesos Python directamente
echo Terminando todos los procesos Python...
taskkill /F /IM python.exe 2>nul

REM Enfoque 4: Matar cualquier proceso en el puerto 8000
echo Verificando puerto 8000...
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :8000') DO (
    echo Terminando proceso en puerto 8000: %%P
    taskkill /F /PID %%P 2>nul
)

echo ========================================
echo VERIFICACIÓN FINAL
echo ========================================

REM Comprobar si el puerto 8000 sigue en uso
netstat -ano | findstr ":8000" > nul
if %errorlevel% EQU 0 (
    echo El puerto 8000 sigue en uso. El servidor puede estar aún ejecutándose.
) else (
    echo Servidor detenido correctamente. El puerto 8000 está libre.
)

echo.
echo Operación completada.
pause