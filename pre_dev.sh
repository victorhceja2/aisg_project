#!/bin/bash
echo "🔄 Limpiando pycache y archivos temporales..."
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete
echo "✅ Limpieza completada"

echo "🔍 Estado del proyecto Git:"
git status