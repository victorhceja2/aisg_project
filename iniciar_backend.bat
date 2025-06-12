@echo off
REM filepath: c:\Users\skyho\OneDrive\Documentos\aisg_project-backend\iniciar_backend.bat

echo Iniciando el backend de AISG...
echo.

REM Comprobar si existe el entorno virtual
if not exist venv (
    echo Error: No se encontro el entorno virtual 'venv'.
    echo Por favor, ejecuta primero 'instalar_iniciar-backend.bat'
    exit /b 1
)

REM Activar entorno virtual
echo Activando entorno virtual...
call venv\Scripts\activate.bat

echo ========================================
echo Iniciando servidor FastAPI con modo de recarga automatica...
echo ========================================
echo El servidor estara disponible en: http://localhost:8000
echo Para acceder a la documentacion: http://localhost:8000/docs
echo El servidor se reiniciara automaticamente cuando detecte cambios en el codigo.
echo.

REM Iniciar la aplicación con uvicorn con la opción --reload
echo Iniciando servidor...
start cmd /c "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo Servidor iniciado. Se ha abierto una nueva ventana de terminal para el servidor.
echo Cierra esa ventana para detener el servidor.