#!/bin/bash

echo "🧹 Limpiando entorno virtual del control de versiones..."

# 1. Asegurar que .gitignore incluya venv/
if ! grep -q "^venv/$" .gitignore; then
  echo "venv/" >> .gitignore
  echo "✅ Agregado 'venv/' a .gitignore"
else
  echo "ℹ️ 'venv/' ya está en .gitignore"
fi

# 2. Eliminar venv del index (sin borrar archivos físicos)
git rm -r --cached venv/
echo "✅ venv eliminado del control de versiones (pero no del sistema)"

# 3. Añadir cambios y confirmar
git add .gitignore
git commit -m "Remove venv from repo and update .gitignore"

# 4. Si hay rebase pendiente, continuar
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
  echo "🔄 Rebase detectado, intentando continuar..."
  git rebase --continue
else
  echo "✅ No hay rebase pendiente. Todo listo."
fi

echo "🎉 Listo. Ahora puedes hacer: git push origin etapa2_0705"