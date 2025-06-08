#!/bin/bash
echo "🔄 Ejecutando limpieza y commit..."
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

echo "📦 Agregando cambios a Git..."
git add .

echo "📝 Ingresa tu mensaje de commit:"
read msg
git commit -m "$msg"

echo "🚀 Subiendo a rama actual..."
git push origin $(git branch --show-current)