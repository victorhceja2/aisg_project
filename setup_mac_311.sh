#!/bin/bash

echo "========================================"
echo " 🛠  Configurando entorno Python 3.11.9 "
echo "========================================"

# Paso 1: Instalar pyenv si no está
if ! command -v pyenv &> /dev/null; then
    echo "🔧 Instalando pyenv..."
    brew update
    brew install pyenv
fi

# Paso 2: Inicializar pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv init -)"

# Paso 3: Instalar Python 3.11.9 si no existe
if ! pyenv versions | grep -q "3.11.9"; then
    echo "🐍 Instalando Python 3.11.9..."
    pyenv install 3.11.9
fi

# Paso 4: Usar Python 3.11.9
echo "📌 Usando Python 3.11.9 localmente"
cd backend || exit 1
pyenv local 3.11.9

# Verificar versión activa
PYTHON_VERSION=$(python --version)
echo "🧪 Python activo: $PYTHON_VERSION"

# Paso 5: Borrar venv anterior si es necesario
if [ -d "venv" ]; then
    echo "🧹 Borrando entorno virtual anterior..."
    rm -rf venv
fi

# Paso 6: Crear nuevo entorno virtual con Python 3.11.9
echo "🔁 Creando entorno virtual limpio..."
python -m venv venv
source venv/bin/activate

# Validar versión interna del entorno
echo "✅ Versión activa dentro de venv:"
python --version

# Paso 7: Instalar dependencias
if [ -f "requirements.txt" ]; then
    echo "📦 Instalando dependencias desde requirements.txt..."
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "⚠️ ERROR: No se encontró backend/requirements.txt"
    exit 1
fi

echo ""
echo "🎉 ¡Entorno listo!"
echo "Puedes arrancar el backend con:"
echo "source venv/bin/activate"
echo "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"