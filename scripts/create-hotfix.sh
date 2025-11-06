#!/bin/bash

# Script para crear un hotfix urgente
# Uso: ./scripts/create-hotfix.sh v1.0.1

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: Debes proporcionar una versión"
    echo "Uso: ./scripts/create-hotfix.sh v1.0.1"
    exit 1
fi

# Validar formato de versión (v1.2.3)
if ! [[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Error: Formato de versión inválido"
    echo "Debe ser: v1.2.3 (ejemplo: v1.0.1)"
    exit 1
fi

VERSION_NUMBER=${VERSION#v}  # Remover la 'v' del inicio

echo "🚨 Creando hotfix $VERSION..."

# Verificar que estamos en main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Advertencia: No estás en la rama 'main'"
    read -p "¿Continuar de todos modos? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Actualizar main
echo "📥 Actualizando main..."
git pull origin main

# Crear rama de hotfix
HOTFIX_BRANCH="hotfix/$VERSION"
echo "🌿 Creando rama $HOTFIX_BRANCH..."
git checkout -b "$HOTFIX_BRANCH"

# Actualizar versiones en package.json
echo "📝 Actualizando versiones en package.json..."

# Backend
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION_NUMBER\"/" Backend/package.json

# Frontend
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION_NUMBER\"/" frontend-react/package.json

echo "✅ Versiones actualizadas:"
echo "   - Backend: $VERSION_NUMBER"
echo "   - Frontend: $VERSION_NUMBER"

echo ""
echo "📋 IMPORTANTE: Después de corregir el bug:"
echo "   1. Actualizar CHANGELOG.md"
echo "   2. Commitear los cambios:"
echo ""
echo "   git add ."
echo "   git commit -m \"fix: descripción del hotfix\""
echo ""
echo "   3. Mergear a main y crear tag:"
echo ""
echo "   git checkout main"
echo "   git merge $HOTFIX_BRANCH"
echo "   git tag -a $VERSION -m \"Hotfix $VERSION: descripción\""
echo "   git push origin main --tags"
echo ""
echo "   4. Mergear también a develop:"
echo ""
echo "   git checkout develop"
echo "   git merge $HOTFIX_BRANCH"
echo "   git push origin develop"
echo "   git branch -d $HOTFIX_BRANCH"
echo ""
echo "✅ Rama de hotfix creada: $HOTFIX_BRANCH"

