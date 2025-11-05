#!/bin/bash

# Script para iniciar el servidor backend de forma segura
# Uso: ./start.sh

PORT=3000

echo "🔍 Verificando si el puerto $PORT está en uso..."

# Buscar y terminar procesos que usen el puerto 3000
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  Encontrado proceso usando el puerto $PORT"
    PID=$(lsof -ti:$PORT)
    echo "🛑 Terminando proceso PID: $PID"
    kill -9 $PID 2>/dev/null
    sleep 2
    echo "✅ Proceso terminado"
elif fuser $PORT/tcp > /dev/null 2>&1; then
    echo "⚠️  Encontrado proceso usando el puerto $PORT"
    echo "🛑 Terminando proceso..."
    fuser -k $PORT/tcp 2>/dev/null
    sleep 2
    echo "✅ Proceso terminado"
else
    echo "✅ Puerto $PORT libre"
fi

# Verificar nuevamente
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "❌ Error: No se pudo liberar el puerto $PORT"
    echo "💡 Intenta manualmente: kill -9 \$(lsof -ti:$PORT)"
    exit 1
fi

echo ""
echo "🚀 Iniciando servidor backend en puerto $PORT..."
echo ""

# Iniciar el servidor
node server.js

