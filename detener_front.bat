@echo off
echo ===== DETENIENDO SERVIDOR FRONTEND =====
echo.

echo Forzando la detención de todos los procesos relacionados...

:: Detener nodemon con múltiples variantes
echo Deteniendo nodemon...
taskkill /F /IM nodemon.cmd /T 2>nul
taskkill /F /IM nodemon* /T 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *nodemon*" /T 2>nul

:: Detener procesos por puerto (puertos comunes de desarrollo)
echo Liberando puertos de desarrollo...
FOR /F "tokens=5" %%T IN ('netstat -ano ^| findstr "LISTENING" ^| findstr ":3000\|:5173\|:8080\|:4000\|:4173"') DO (
    echo Terminando proceso en puerto: %%T
    taskkill /F /PID %%T 2>nul
)

:: Buscar procesos de node por nombre de comando
echo Deteniendo procesos de Node.js...
FOR /F "tokens=2" %%P IN ('tasklist /FI "IMAGENAME eq node.exe" /FO TABLE /NH') DO (
    taskkill /F /PID %%P 2>nul
)

:: Buscar procesos cmd que puedan estar ejecutando npm o node
echo Deteniendo comandos en cmd...
taskkill /F /FI "WINDOWTITLE eq *npm run dev*" /T 2>nul
taskkill /F /FI "WINDOWTITLE eq *Servidor*frontend*" /T 2>nul
taskkill /F /FI "WINDOWTITLE eq *node*" /T 2>nul
taskkill /F /FI "WINDOWTITLE eq *vite*" /T 2>nul
taskkill /F /FI "WINDOWTITLE eq *desarrollo*" /T 2>nul

:: Detener procesos npm específicos
echo Deteniendo procesos npm...
taskkill /F /IM npm* /T 2>nul

:: Segunda pasada para asegurarse que todos los procesos relacionados se hayan detenido
echo Realizando verificación final...
taskkill /F /IM node.exe /T 2>nul

echo.
echo Servidor frontend detenido forzosamente.
echo Todos los procesos relacionados han sido terminados.
echo.

pause