@echo off
REM Busca el proceso que usa el puerto 8000 y lo termina.
FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr ":8000"') DO (
    IF NOT %%P==0 taskkill /F /PID %%P >nul 2>nul
)

REM Como medida de seguridad, termina cualquier proceso de Python que pueda haber quedado abierto.
taskkill /F /IM python.exe /T >nul 2>nul

REM Cierra la ventana de la terminal.
exit