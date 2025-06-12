@echo off
echo ===== INICIANDO SERVIDOR FRONTEND =====
echo.

:: Iniciar el servidor en una ventana separada con capacidad de auto-reinicio
start "" cmd /k "cd /d "%CD%" && echo Iniciando servidor frontend con auto-reinicio... && npm install -g nodemon && nodemon --watch src --watch public --ext js,jsx,ts,tsx,css,html,json --exec ^"npm run dev^""

echo.
echo El servidor frontend se ha iniciado en una ventana separada.
echo El servidor se reiniciará automáticamente cuando detecte cambios en el código.
echo Esta ventana se puede cerrar sin afectar al servidor en ejecución.
echo.

pause