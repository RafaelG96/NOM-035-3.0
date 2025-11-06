# 🚀 Guía Rápida de Versionamiento

Guía rápida para empezar a usar el sistema de versionamiento en el proyecto NOM-035.

## ⚡ Inicio Rápido

### 1. Tu Situación Actual

Actualmente tienes:
- Repositorio Git funcionando
- Rama `main` (producción)
- Rama `NewFrontend` (desarrollo actual)
- Rama `fix/bug-formulario` (corrección)

### 2. Crear la Estructura Recomendada

```bash
# Opción A: Usar NewFrontend como base para develop
git checkout NewFrontend
git checkout -b develop
git push origin develop

# Opción B: Si ya tienes cambios en NewFrontend que quieres en main
# Primero mergear NewFrontend a main, luego crear develop
git checkout main
git merge NewFrontend
git checkout -b develop
git push origin develop
```

### 3. Crear tu Primer Release (v1.0.0)

```bash
# Desde develop (o NewFrontend si aún no tienes develop)
git checkout develop  # o NewFrontend

# Crear rama de release
./scripts/create-release.sh v1.0.0

# O manualmente:
git checkout -b release/v1.0.0

# Actualizar CHANGELOG.md (mover cambios de [Unreleased] a [1.0.0])

# Mergear a main
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0: Lanzamiento inicial"
git push origin main --tags

# Mergear también a develop
git checkout develop
git merge release/v1.0.0
git push origin develop
git branch -d release/v1.0.0
```

## 📝 Flujo de Trabajo Diario

### Crear una Nueva Funcionalidad

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad

# Desarrollar y hacer commits
git add .
git commit -m "feat: descripción de la funcionalidad"

# Cuando termines, mergear a develop
git checkout develop
git merge feature/nombre-funcionalidad
git push origin develop
git branch -d feature/nombre-funcionalidad
```

### Corregir un Bug

```bash
git checkout develop
git pull origin develop
git checkout -b fix/nombre-bug

# Corregir y hacer commits
git add .
git commit -m "fix: descripción del bug corregido"

# Mergear a develop
git checkout develop
git merge fix/nombre-bug
git push origin develop
git branch -d fix/nombre-bug
```

### Crear un Release Nuevo

```bash
# Usar el script
./scripts/create-release.sh v1.1.0

# Luego actualizar CHANGELOG.md manualmente
# Y seguir las instrucciones del script
```

## 🏷️ Crear Tags

```bash
# Ver tags
git tag

# Crear tag anotado (recomendado)
git tag -a v1.0.0 -m "Release v1.0.0: Descripción"

# Subir tags
git push origin v1.0.0
# O todos
git push origin --tags
```

## 📋 Actualizar CHANGELOG.md

Cada vez que hagas un cambio, actualiza `CHANGELOG.md`:

```markdown
## [Unreleased]

### Añadido
- Nueva funcionalidad X

### Cambios
- Mejora en Y

### Corregido
- Bug en Z
```

Cuando hagas un release, mueve los cambios de `[Unreleased]` a la nueva versión:

```markdown
## [1.1.0] - 2024-12-XX

### Añadido
- Nueva funcionalidad X

### Cambios
- Mejora en Y

### Corregido
- Bug en Z

## [Unreleased]
```

## 🔧 Comandos Útiles

```bash
# Ver estado actual
git status

# Ver ramas
git branch -a

# Ver historial de commits
git log --oneline --graph --all

# Ver diferencias
git diff main..develop

# Ver cambios en un archivo
git diff archivo.js
```

## ⚠️ Reglas Importantes

1. ✅ **Siempre trabaja desde `develop`** para nuevas features/fixes
2. ✅ **Nunca commitees directamente a `main`** (excepto hotfixes)
3. ✅ **Actualiza CHANGELOG.md** con cada cambio
4. ✅ **Crea tags** para cada release
5. ✅ **Usa commits descriptivos** siguiendo convenciones
6. ✅ **Mantén `main` estable** y deployable

## 🚨 Hotfix Urgente

Si necesitas corregir algo urgente en producción:

```bash
# Usar el script
./scripts/create-hotfix.sh v1.0.1

# O manualmente:
git checkout main
git checkout -b hotfix/v1.0.1

# Corregir y commitear
git add .
git commit -m "fix: corrección urgente"

# Mergear a main
git checkout main
git merge hotfix/v1.0.1
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin main --tags

# Mergear también a develop
git checkout develop
git merge hotfix/v1.0.1
git push origin develop
git branch -d hotfix/v1.0.1
```

## 📚 Documentación Completa

- `VERSIONAMIENTO.md` - Guía completa de versionamiento
- `ESTRATEGIA-RAMAS.md` - Estrategia de branching detallada
- `CHANGELOG.md` - Historial de cambios
- `ARQUITECTURA.md` - Arquitectura del sistema

## 🎯 Siguiente Paso

**Recomendación inmediata:**

1. Crear rama `develop` desde `NewFrontend`
2. Crear tu primer release `v1.0.0` con todos los cambios actuales
3. Empezar a trabajar en nuevas features desde `develop`

```bash
# Paso 1: Crear develop
git checkout NewFrontend
git checkout -b develop
git push origin develop

# Paso 2: Crear release inicial
./scripts/create-release.sh v1.0.0
# Seguir instrucciones del script
```

---

**¿Dudas?** Revisa `VERSIONAMIENTO.md` para más detalles.

