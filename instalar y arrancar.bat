@echo off
echo ===== INICIANDO PROYECTO =====
echo.

echo Eliminando dependencias existentes...
if exist "node_modules" (
    rd /s /q "node_modules"
    echo Carpeta node_modules eliminada.
)
if exist "package-lock.json" (
    del /f "package-lock.json"
    echo Archivo package-lock.json eliminado.
)

echo.
echo Instalando dependencias nuevas...
call npm install

echo.
echo ===== INICIANDO SERVIDOR =====
echo.

:: Iniciar el servidor en una ventana completamente separada
:: El comando "start" con /b evita que la ventana actual espere a la nueva
start "" cmd /k "cd /d "%CD%" && echo Iniciando servidor... && npm run dev"

echo.
echo El servidor se ha iniciado en una ventana separada.
echo IMPORTANTE: La nueva ventana debería abrirse en cualquier momento.
echo.

pause