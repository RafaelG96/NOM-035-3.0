# Estrategia de Ramas - Sistema NOM-035

Este documento explica la estrategia de branching recomendada para el proyecto.

## 🌳 Estructura de Ramas Recomendada

```
main (producción)
  │
  ├── develop (desarrollo)
  │     │
  │     ├── feature/nueva-funcionalidad
  │     ├── feature/login-mejorado
  │     ├── fix/correccion-bug
  │     └── fix/validacion-formulario
  │
  ├── release/v1.1.0 (preparación de release)
  │
  └── hotfix/correccion-critica (correcciones urgentes)
```

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────┐
│                    main (Producción)                    │
│                      v1.0.0, v1.0.1                     │
└─────────────────────────────────────────────────────────┘
         ▲                    │                    ▲
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │ release │          │ hotfix  │          │ hotfix  │
    │ v1.1.0  │          │ v1.0.1  │          │ v1.0.2  │
    └────┬────┘          └────┬────┘          └────┬────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  develop (Desarrollo)                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ feature/     │  │ feature/     │  │ fix/         │ │
│  │ nueva-func   │  │ login-mejorado│  │ correccion   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Ramas Actuales del Proyecto

### Ramas Existentes

- `main` - Rama principal de producción
- `NewFrontend` - Rama de desarrollo del frontend React (actual)
- `fix/bug-formulario` - Corrección de bug en formulario

### Recomendación: Migración a Estructura Estándar

Para cumplir con el requisito de versionamiento, te recomendamos:

1. **Crear rama `develop`** desde `NewFrontend` (ya que tiene el código más actualizado)
2. **Mantener `main`** como rama de producción estable
3. **Usar convenciones de ramas** para features y fixes

## 🔄 Plan de Migración

### Paso 1: Crear rama develop

```bash
# Desde NewFrontend (tu rama actual)
git checkout NewFrontend
git pull origin NewFrontend

# Crear develop desde NewFrontend
git checkout -b develop
git push origin develop
```

### Paso 2: Organizar ramas existentes

```bash
# Si fix/bug-formulario ya está mergeado, eliminarla
git branch -d fix/bug-formulario

# Si NewFrontend ya está mergeado a main, también eliminarla
# (después de verificar que todo está bien)
```

### Paso 3: Crear estructura de trabajo

```bash
# Para nuevas features
git checkout develop
git pull origin develop
git checkout -b feature/nombre-feature

# Para fixes
git checkout develop
git pull origin develop
git checkout -b fix/nombre-fix
```

## 📝 Convenciones de Nombres

### Features
```
feature/login-mejorado
feature/exportar-pdf
feature/notificaciones-email
feature/dashboard-admin
```

### Fixes
```
fix/error-calculadora-puntajes
fix/validacion-formulario
fix/seguridad-autenticacion
fix/rendimiento-queries
```

### Releases
```
release/v1.0.0
release/v1.1.0
release/v2.0.0
```

### Hotfixes
```
hotfix/seguridad-critica
hotfix/error-produccion
hotfix/corrupcion-datos
```

## 🚀 Flujo de Trabajo Recomendado

### Desarrollo de Nueva Funcionalidad

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollar y hacer commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push de la rama
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request a develop (si usas GitHub/GitLab)
# O mergear directamente:
git checkout develop
git merge feature/nueva-funcionalidad
git push origin develop
git branch -d feature/nueva-funcionalidad
```

### Corrección de Bug

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear rama de fix
git checkout -b fix/correccion-bug

# 3. Corregir y commitear
git add .
git commit -m "fix: corregir bug en formulario"

# 4. Mergear a develop
git checkout develop
git merge fix/correccion-bug
git push origin develop
git branch -d fix/correccion-bug
```

### Preparar Release

```bash
# 1. Crear rama de release desde develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 2. Actualizar versiones y CHANGELOG
# (usar script: ./scripts/create-release.sh v1.1.0)

# 3. Cuando esté listo, mergear a main
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags

# 4. Mergear también a develop
git checkout develop
git merge release/v1.1.0
git push origin develop
git branch -d release/v1.1.0
```

### Hotfix Urgente

```bash
# 1. Crear hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/v1.0.1

# 2. Corregir y commitear
git add .
git commit -m "fix: corrección crítica"

# 3. Mergear a main y crear tag
git checkout main
git merge hotfix/v1.0.1
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin main --tags

# 4. Mergear también a develop
git checkout develop
git merge hotfix/v1.0.1
git push origin develop
git branch -d hotfix/v1.0.1
```

## 📋 Checklist de Ramas

Antes de crear una nueva rama:

- [ ] ¿Estoy en la rama correcta? (develop para features/fixes, main para hotfixes)
- [ ] ¿He actualizado la rama base? (`git pull`)
- [ ] ¿El nombre sigue las convenciones?
- [ ] ¿He actualizado CHANGELOG.md si es necesario?

Antes de mergear:

- [ ] ¿El código está probado?
- [ ] ¿Los commits siguen las convenciones?
- [ ] ¿CHANGELOG.md está actualizado?
- [ ] ¿No hay conflictos?

## 🎨 Visualización de Ramas

Puedes visualizar tus ramas con:

```bash
# Ver todas las ramas
git branch -a

# Ver ramas con commits
git log --oneline --graph --all --decorate

# Ver ramas últimas actualizadas
git branch --sort=-committerdate
```

## 🔧 Comandos Útiles

```bash
# Ver ramas remotas
git branch -r

# Eliminar rama local
git branch -d nombre-rama

# Eliminar rama remota
git push origin --delete nombre-rama

# Renombrar rama actual
git branch -m nuevo-nombre

# Ver diferencias entre ramas
git diff main..develop

# Ver commits en una rama
git log nombre-rama --oneline
```

## ⚠️ Buenas Prácticas

1. **Nunca commitees directamente a `main`** (excepto hotfixes)
2. **Mantén `main` siempre estable** y deployable
3. **Usa nombres descriptivos** para ramas
4. **Elimina ramas mergeadas** para mantener limpio el repositorio
5. **Haz pull frecuentemente** para mantener sincronizado
6. **Revisa antes de mergear** a main o develop
7. **Documenta cambios significativos** en CHANGELOG.md

## 📚 Recursos

- Ver `VERSIONAMIENTO.md` para más detalles sobre versionamiento
- Ver `CHANGELOG.md` para el historial de cambios
- Ver `ARQUITECTURA.md` para entender la estructura del proyecto

---

**Última actualización**: Diciembre 2024

