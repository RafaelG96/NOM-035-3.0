#!/bin/bash

# Script para crear un nuevo release
# Uso: ./scripts/create-release.sh v1.1.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Error: Debes proporcionar una versión"
    echo "Uso: ./scripts/create-release.sh v1.1.0"
    exit 1
fi

# Validar formato de versión (v1.2.3)
if ! [[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Error: Formato de versión inválido"
    echo "Debe ser: v1.2.3 (ejemplo: v1.1.0)"
    exit 1
fi

VERSION_NUMBER=${VERSION#v}  # Remover la 'v' del inicio

echo "🚀 Creando release $VERSION..."

# Verificar que estamos en develop
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "⚠️  Advertencia: No estás en la rama 'develop'"
    read -p "¿Continuar de todos modos? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Actualizar develop
echo "📥 Actualizando develop..."
git pull origin develop

# Crear rama de release
RELEASE_BRANCH="release/$VERSION"
echo "🌿 Creando rama $RELEASE_BRANCH..."
git checkout -b "$RELEASE_BRANCH"

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
echo "📋 IMPORTANTE: Ahora debes:"
echo "   1. Actualizar CHANGELOG.md moviendo cambios de [Unreleased] a [$VERSION_NUMBER]"
echo "   2. Revisar todos los cambios"
echo "   3. Hacer merge a main cuando esté listo:"
echo ""
echo "   git checkout main"
echo "   git merge $RELEASE_BRANCH"
echo "   git tag -a $VERSION -m \"Release $VERSION\""
echo "   git push origin main --tags"
echo "   git checkout develop"
echo "   git merge $RELEASE_BRANCH"
echo "   git push origin develop"
echo "   git branch -d $RELEASE_BRANCH"
echo ""
echo "✅ Rama de release creada: $RELEASE_BRANCH"

