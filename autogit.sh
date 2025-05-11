#!/bin/bash

# Configuración de log
LOG_FILE="/root/aisg_project/deploy.log"
echo "===== Actualización iniciada: $(date) =====" >> $LOG_FILE

# Ir al directorio del proyecto
cd /root/aisg_project || exit

# Detener servicios existentes
echo "Deteniendo servicios..." >> $LOG_FILE
bash detener_aisg.sh >> $LOG_FILE 2>&1
bash detener_aisg.sh >> $LOG_FILE 2>&1

# Actualizar desde Git
echo "Actualizando desde Git..." >> $LOG_FILE
git pull origin aisg_stable_0705 >> $LOG_FILE 2>&1

# Actualizar dependencias
echo "Actualizando backend..." >> $LOG_FILE
cd backend || exit
source venv/bin/activate
pip install -r requirements.txt >> $LOG_FILE 2>&1
cd ..

echo "Actualizando frontend..." >> $LOG_FILE
cd frontend || exit
npm install >> $LOG_FILE 2>&1
cd ..

# Reiniciar servicios
echo "Reiniciando servicios..." >> $LOG_FILE
bash arrancar_aisg.sh >> $LOG_FILE 2>&1

echo "===== Actualización completada: $(date) =====" >> $LOG_FILE