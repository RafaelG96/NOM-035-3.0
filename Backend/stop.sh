#!/bin/bash

# Script para detener el servidor backend de forma segura
# Uso: ./stop.sh

PORT=3000

echo "🔍 Buscando procesos en el puerto $PORT..."

if lsof -ti:$PORT > /dev/null 2>&1; then
    PIDS=$(lsof -ti:$PORT)
    echo "📋 Procesos encontrados: $PIDS"
    
    for PID in $PIDS; do
        echo "🛑 Terminando proceso PID: $PID"
        kill -9 $PID 2>/dev/null
    done
    
    sleep 1
    echo "✅ Servidor detenido"
else
    echo "✅ No hay procesos usando el puerto $PORT"
fi

