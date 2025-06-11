#!/bin/bash

echo "🔧 Iniciando limpieza del sistema..."

# Requiere sudo para tareas de sistema
if [ "$EUID" -ne 0 ]; then
  echo "❌ Este script necesita ejecutarse como root (usa sudo)"
  exit 1
fi

echo "📦 Limpiando caché de paquetes APT..."
apt-get clean
apt-get autoclean -y
apt-get autoremove -y

echo "🧹 Borrando archivos temporales..."
rm -rf /tmp/*
rm -rf /var/tmp/*

echo "🧾 Borrando logs rotados y viejos..."
find /var/log -type f -name "*.gz" -delete
find /var/log -type f -name "*.1" -delete
find /var/log -type f -name "*.old" -delete
find /var/log -type f -size +10M -exec truncate -s 0 {} \;

echo "🐧 Verificando y limpiando kernels antiguos (si aplica)..."
dpkg -l 'linux-image*' | grep ^ii | awk '{print $2}' | grep -v "$(uname -r)" | xargs apt-get -y purge

echo "📂 Limpiando caché de usuarios..."
for user in $(ls /home); do
  rm -rf /home/$user/.cache/thumbnails/*
  rm -rf /home/$user/.local/share/Trash/*
done

echo "📊 Espacio libre después de limpieza:"
df -h /

echo "✅ Limpieza completada."
